import HeartLoader from "@/components/HearLoader";
import PasscodeDot from "@/components/PasscodeDot";
import StepWrapper from "@/components/StepWrapper";
import { requestOtp, updateUser, verifyOtp } from "@/lib/appwrite";
import {
    clearResetFlow,
    loadResetFlow,
    saveResetFlow,
} from "@/lib/resetFlowStore";
import { useAuth } from "@/providers/AuthProvider";
import { hashPasscode } from "@/types/helpers";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ArrowRight, Delete, Heart, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "email" | "emailSent" | "passcode" | "confirmPasscode";

export default function ResetPasscode() {
  const { refreshUser, unlockApp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isSending, setISSending] = useState(false);

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const success = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  const error = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  const isRecentOtp = async () => {
    const ts = await SecureStore.getItemAsync("otp_verified_at");
    if (!ts) return false;

    const age = Date.now() - Number(ts);

    return age < 10 * 60 * 1000; // 10 minutes
  };

  // Restore on Mount
  useEffect(() => {
    (async () => {
      //check if OTP recently verified
      const recent = await isRecentOtp();
      if (recent) {
        setStep("passcode");
        return;
      }

      // fallback to saved flow restore
      const saved = await loadResetFlow();
      if (!saved) return;

      if (Date.now() - saved.ts > 10 * 60 * 1000) {
        await clearResetFlow();
        return;
      }

      setStep(saved.step);
      setEmail(saved.email ?? "");
    })();
  }, []);

  // persist when set changes
  useEffect(() => {
    saveResetFlow({
      step,
      email,
      ts: Date.now(),
    });
  }, [step, email]);

  {
    /* OTP */
  }
  useEffect(() => {
    if (otp.length === 6 && !verifying) handleVerifyOtp();
  }, [otp]);

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      Alert.alert("Enter valid email");
      return;
    }

    try {
      setISSending(true);
      await requestOtp(email);
      success();
      setStep("emailSent");
    } catch {
      error();
      Alert.alert("Failed to send code");
    } finally {
      setISSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (verifying) return;
    setVerifying(true);

    try {
      await verifyOtp(otp);
      await refreshUser();
      success();
      setOtp("");
      setStep("passcode");
    } catch {
      error();
      Alert.alert("Invalid code");
    } finally {
      setVerifying(false);
    }
  };

  {
    /* Passcode */
  }
  const handlePasscodePress = (n: string) => {
    if (passcode.length >= 4) return;
    const next = passcode + n;
    setPasscode(next);
    if (next.length === 4) setStep("confirmPasscode");
  };

  const handleConfirmPress = (n: string) => {
    if (confirmPasscode.length >= 4) return;

    const next = confirmPasscode + n;
    setConfirmPasscode(next);

    if (next.length === 4) {
      if (next !== passcode) {
        error();
        Alert.alert("Passcodes didn’t match");
        setPasscode("");
        setConfirmPasscode("");
        setStep("passcode");
        return;
      }
      handleFinish();
    }
  };

  const backspace = () => {
    if (step === "passcode") setPasscode((p) => p.slice(0, -1));
    else setConfirmPasscode((p) => p.slice(0, -1));
  };

  {
    /* Reset passcode Completion */
  }
  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      const hash = await hashPasscode(passcode);

      // replace stored hash
      await SecureStore.setItemAsync("between_passcode_hash", hash);

      // revoke trusted device unlock
      await SecureStore.deleteItemAsync("between_device_trusted");

      // update Appwrite
      await updateUser({ passcodeHash: hash });
      await refreshUser();
      success();
      await clearResetFlow();
      await unlockApp();
    } catch {
      error();
      Alert.alert("Reset failed");
    } finally {
      setIsFinishing(false);
    }
  };

  if (isFinishing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <HeartLoader />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="items-center mt-16 mb-14">
          <View className="h-14 w-14 rounded-full items-center justify-center mb-4 bg-primary/10">
            <Heart size={24} color="#bc8f97" fill="#bc8f97" />
          </View>
          <Text className="text-2xl font-semibold">Reset passcode</Text>
          <Text className="text-sm text-mutedForeground mt-1">
            Recover your private space
          </Text>
        </View>

        <View className="flex-1 px-8">
          {/* EMAIL */}
          {step === "email" && (
            <StepWrapper stepKey={step}>
              <View className="items-center mt-8">
                <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                  <Mail size={20} color="#8a8075" />
                </View>
                <Text className="text-2xl font-medium">Enter your email</Text>
                <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                  We'll send you an OTP to verify it's you.{"\n"}. Go back if
                  you already remember your passcode.
                </Text>

                <TextInput
                  className="h-16 w-full rounded-2xl px-6 mt-9 text-lg text-center bg-card border border-muted focus:border-primary"
                  placeholder="your@email.com"
                  placeholderTextColor="#BDB7B0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Pressable
                  onPress={handleSendOtp}
                  className="h-16 w-full bg-primary rounded-2xl items-center justify-center mt-4 flex-row"
                >
                  {isSending ? (
                    <>
                      <ActivityIndicator color="white" />
                      <Text className="text-white text-lg font-medium ml-3">
                        Sending...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-white text-lg font-medium">
                        Send Code
                      </Text>
                      <ArrowRight size={15} color="white" />
                    </>
                  )}
                </Pressable>
              </View>
              <Pressable
                className="mt-6 items-center"
                onPress={async () => {
                  await clearResetFlow();
                  router.replace("/(lock)");
                }}
              >
                <Text className="text-mutedForeground/70 text-sm">
                  Remember your passcode? Go back.
                </Text>
              </Pressable>
            </StepWrapper>
          )}

          {/* OTP */}
          {step === "emailSent" && (
            <StepWrapper stepKey={step}>
              <View className="items-center mt-8">
                <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                  <Mail size={20} color="#8a8075" />
                </View>

                <Text className="text-2xl font-medium">
                  Enter verification code
                </Text>

                <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                  We sent a 6-digit code to{"\n"}
                  <Text className="text-foreground font-medium">{email}</Text>
                </Text>

                {/* OTP Input */}
                <TextInput
                  className="h-16 w-full rounded-2xl px-6 mt-9 text-lg text-center tracking-widest bg-card border border-mutedForeground/25 focus:border-primary"
                  placeholder="000000"
                  placeholderTextColor="#BDB7B0"
                  value={otp}
                  editable={!verifying}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </StepWrapper>
          )}

          {/* PASSCODE */}
          {(step === "passcode" || step === "confirmPasscode") && (
            <View className="items-center">
              <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                <Lock size={20} color="#8a8075" />
              </View>

              <Text className="text-2xl font-medium">
                {step === "passcode"
                  ? "Reset your passcode"
                  : "Confirm your passcode"}
              </Text>
              <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                A 4-digit code to keep your space safe.
              </Text>

              <View className="flex-row my-8">
                {[0, 1, 2, 3].map((i) => (
                  <PasscodeDot
                    key={i}
                    filled={
                      (step === "passcode"
                        ? passcode.length
                        : confirmPasscode.length) > i
                    }
                  />
                ))}
              </View>

              <View className="flex-row flex-wrap justify-center w-full gap-3">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "",
                  "0",
                  "delete",
                ].map((v, i) => (
                  <Pressable
                    key={i}
                    className="w-1/4 h-16 items-center justify-center rounded-2xl bg-muted"
                    onPress={() => {
                      haptic();
                      if (v === "delete") backspace();
                      else if (v) {
                        step === "passcode"
                          ? handlePasscodePress(v)
                          : handleConfirmPress(v);
                      }
                    }}
                  >
                    {v === "delete" ? (
                      <Delete size={22} />
                    ) : (
                      <Text className="text-2xl">{v}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* COMPLETE
          {step === "complete" && (
            <StepWrapper stepKey={step}>
              <View className="items-center mt-14">
                <Check size={22} />
                <Text className="text-xl mt-4">Passcode reset</Text>
              </View>
            </StepWrapper>
          )} */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
