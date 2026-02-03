import HeartLoader from "@/components/HearLoader";
import NumPad from "@/components/NumPad";
import PasscodeDot from "@/components/PasscodeDot";
import StepWrapper from "@/components/StepWrapper";
import { requestOtp, updateUser, verifyOtp } from "@/lib/appwrite";
import { useAuth } from "@/providers/AuthProvider";
import { hashPasscode } from "@/types/helpers";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ArrowRight,
  Check,
  Heart,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step =
  | "email"
  | "emailSent"
  | "passcode"
  | "confirmPasscode"
  | "nickname"
  | "complete";

const SignUp = () => {
  const { loading, isAuthenticated, user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [nickname, setNickname] = useState("");
  const [completingOnboarding, setCompletingOnboarding] = useState(false);
  const router = useRouter();

  const triggerSuccess = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  const triggerError = () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  const haptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Skip entire signup if fully onboarded
  useEffect(() => {
    if (!loading && isAuthenticated && user?.passcodeHash && user?.nickname) {
      router.replace("/(tabs)/between");
    }
  }, [loading, isAuthenticated, user, step]);

  // Restore step when screen loads
  useEffect(() => {
    const restoreStep = async () => {
      if (isAuthenticated && user?.passcodeHash) return; // user already onboarded
      const saved = await SecureStore.getItemAsync("signup_step");

      if (saved) {
        setStep(saved as Step);
      }
    };

    restoreStep();
  }, [isAuthenticated]);

  // Persist step whenever it changes
  useEffect(() => {
    const saveStep = async () => {
      try {
        await SecureStore.setItemAsync("signup_step", step);
      } catch {}
    };
    saveStep();
  }, [step]);

  // on hardware/device back press
  useEffect(() => {
    const backAction = () => {
      if (step === "passcode") {
        setStep("emailSent");
        return true;
      }
      if (step === "nickname") {
        setStep("passcode");
        return true;
      }
      if (step === "confirmPasscode") {
        setStep("passcode");
        return true;
      }
      return false; // let default behavior happen
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [step]);

  // Auto Submit When 6 Digits Entered
  useEffect(() => {
    if (otp.length === 6 && !verifying) {
      handleVerifyOtp();
    }
  }, [otp]);

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid email");
      return;
    }

    try {
      await requestOtp(email);
      triggerSuccess();
      setStep("emailSent");
    } catch {
      triggerError();
      Alert.alert("Failed to send code. Try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (verifying) return;

    if (otp.length !== 6) {
      Alert.alert("Enter 6-digit code");
      return;
    }

    setVerifying(true);

    try {
      await verifyOtp(otp);
      // mark OTP verified time
      await SecureStore.setItemAsync("otp_verified_at", Date.now().toString());
      await refreshUser();
      triggerSuccess();
      setOtp("");
      setStep("passcode");
    } catch (e) {
      triggerError();
      console.log("VERIFY ERROR", e);
      Alert.alert("Invalid code. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handlePasscodePress = (num: string) => {
    if (passcode.length >= 4) return;

    const next = passcode + num;
    setPasscode(next);

    if (next.length === 4) {
      setStep("confirmPasscode");
    }
  };

  const handleBackspace = () => {
    if (step == "passcode") {
      setPasscode((p) => p.slice(0, -1));
    }
    if (step == "confirmPasscode") {
      setConfirmPasscode((p) => p.slice(0, -1));
    }
  };

  const handleConfirmPasscodePress = (num: string) => {
    if (confirmPasscode.length >= 4) return;

    const next = confirmPasscode + num;
    setConfirmPasscode(next);

    if (next.length === 4) {
      if (next !== passcode) {
        triggerError();
        Alert.alert("Passcodes didn't match. Try again.");
        setPasscode("");
        setConfirmPasscode("");
        setStep("passcode");
        return;
      }
      setStep("nickname");
    }
  };

  const handleFinish = async () => {
    if (!nickname.trim()) {
      Alert.alert("Please enter a nickname");
      return;
    }

    try {
      setCompletingOnboarding(true);
      const hash = await hashPasscode(passcode);

      await SecureStore.setItemAsync("between_passcode_hash", hash);

      await updateUser({
        passcodeHash: hash,
        nickname,
      });
      await refreshUser();
      setStep("complete");
      triggerSuccess();
      await SecureStore.deleteItemAsync("signup_step");
    } catch (e) {
      // console.log(e);
      triggerError();
      Alert.alert("Something went wrong. Please try again.");
    } finally {
      setCompletingOnboarding(false);
    }
  };

  if (completingOnboarding) {
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
          <Text className="text-2xl font-semibold text-foreground">
            Between
          </Text>
          <Text className="text-sm font-light text-mutedForeground mt-1">
            Your private space
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
                  We'll send you an OTP to sign in.{"\n"}No passwords to
                  remember.
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
                  className="h-16 w-full bg-primary/90 rounded-2xl items-center justify-center mt-4 flex-row disabled:opacity-50"
                  disabled={!email}
                >
                  <Text className="text-white text-lg font-medium mr-2">
                    Continue
                  </Text>
                  <ArrowRight size={15} color="white" />
                </Pressable>
                <Text className="text-xs text-mutedForeground/70 mt-8">
                  Your email stays private. We never share it.
                </Text>
              </View>
            </StepWrapper>
          )}

          {/* OTP VERIFY */}
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
                  className="h-16 w-full rounded-2xl px-6 mt-9 text-lg text-center tracking-widest bg-card border border-muted focus:border-primary"
                  placeholder="000000"
                  placeholderTextColor="#BDB7B0"
                  value={otp}
                  editable={!verifying}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                {/* <Pressable
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 6 || verifying}
                  className="h-16 w-full bg-primary/90 rounded-2xl items-center justify-center mt-4 flex-row disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <ActivityIndicator color="white" />
                      <Text className="text-white text-lg font-medium ml-3">
                        Verifying...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-white text-lg font-medium">
                        Verify
                      </Text>
                      <ArrowRight size={15} color="white" />
                    </>
                  )}
                </Pressable> */}

                {/* Resend */}
                <Pressable onPress={handleSendOtp} className="mt-6">
                  <Text className="text-sm text-mutedForeground">
                    Didn't receive code?{" "}
                    <Text className="text-primary font-medium">Resend</Text>
                  </Text>
                </Pressable>
              </View>
            </StepWrapper>
          )}

          {/* PASSCODE */}
          {step === "passcode" && (
            <View className="items-center">
              <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                <Lock size={20} color="#8a8075" />
              </View>

              <Text className="text-2xl font-medium">
                Set your privacy code
              </Text>
              <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                A 4-digit code to keep your space safe.
              </Text>

              {/* Dots */}
              <View className="flex-row my-8">
                {[0, 1, 2, 3].map((i) => (
                  <PasscodeDot key={i} filled={passcode.length > i} />
                ))}
              </View>

              {/* Numpad */}
              <NumPad
                onDigit={handlePasscodePress}
                onDelete={handleBackspace}
              />

              <Pressable className="mt-6">
                <Text className="text-mutedForeground/70 text-sm">
                  Forgot your passcode? We can help.
                </Text>
              </Pressable>
            </View>
          )}

          {/* CONFIRM PASSCODE */}
          {step === "confirmPasscode" && (
            <StepWrapper stepKey={step}>
              <View className="items-center">
                <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                  <Lock size={20} color="#8a8075" />
                </View>

                <Text className="text-2xl font-medium">
                  Confirm your passcode
                </Text>
                <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                  Enter your 4-digit code again to confirm.
                </Text>

                {/* Dots */}
                <View className="flex-row my-8">
                  {[0, 1, 2, 3].map((i) => (
                    <PasscodeDot key={i} filled={confirmPasscode.length > i} />
                  ))}
                </View>

                {/* Numpad */}
                <NumPad
                  onDigit={handleConfirmPasscodePress}
                  onDelete={handleBackspace}
                />

                <Pressable className="mt-6">
                  <Text className="text-mutedForeground/70 text-sm">
                    Forgot your passcode? We can help.
                  </Text>
                </Pressable>
              </View>
            </StepWrapper>
          )}

          {/* NICKNAME */}
          {step === "nickname" && (
            <StepWrapper stepKey={step}>
              <View className="items-center mt-8">
                <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                  <User size={20} color="#8a8075" />
                </View>

                <Text className="text-2xl font-medium">
                  What should we call you?
                </Text>
                <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                  A nickname for your partner to see.{"\n"}You can always change
                  this later.
                </Text>

                <TextInput
                  className="h-16 w-full rounded-2xl px-6 mt-9 text-lg text-center bg-card border border-muted focus:border-primary"
                  placeholder="Your nickname"
                  placeholderTextColor="#BDB7B0"
                  value={nickname}
                  onChangeText={setNickname}
                />

                <Pressable
                  onPress={handleFinish}
                  className="h-16 w-full bg-primary/90 rounded-2xl items-center justify-center mt-4 flex-row disabled:opacity-50"
                >
                  <Text className="text-white text-lg font-medium mr-2">
                    Continue
                  </Text>
                  <ArrowRight size={15} color="white" />
                </Pressable>
              </View>
            </StepWrapper>
          )}

          {/* COMPLETE */}
          {step === "complete" && (
            <StepWrapper stepKey={step}>
              <View className="items-center mt-14">
                <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                  <Check size={20} color="#8a8075" />
                </View>

                <Text className="text-2xl font-medium">You’re all set</Text>
                <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                  Your private space is ready.{"\n"}Let's find your person.
                </Text>
              </View>
            </StepWrapper>
          )}
        </View>

        {/* Footer Pagination Dots */}
        <View className="flex-row justify-center pb-12">
          <View
            className={`h-2 w-3 rounded-full mx-1 ${step === "email" ? "bg-primary w-7" : "bg-muted"}`}
          />
          <View
            className={`h-2 w-3 rounded-full mx-1 ${step === "passcode" ? "bg-primary w-7" : "bg-muted"}`}
          />
          <View className={`h-2 w-3 rounded-full mx-1 bg-muted`} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  keyText: { fontSize: 22, color: "#4A4A4A" },
});
