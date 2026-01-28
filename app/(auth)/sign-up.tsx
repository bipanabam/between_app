import StepWrapper from "@/components/StepWrapper";
import * as Haptics from "expo-haptics";
import {
  ArrowRight,
  Check,
  Delete,
  Heart,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";

type Step =
  | "email"
  | "emailSent"
  | "passcode"
  | "confirmPasscode"
  | "nickname"
  | "complete";

const SignUp = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [nickname, setNickname] = useState("");

  const haptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const PasscodeDot = ({ filled }: { filled: boolean }) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.spring(scale, {
        toValue: filled ? 1.2 : 1,
        useNativeDriver: true,
        friction: 6,
      }).start();
    }, [filled]);

    return (
      <Animated.View
        style={{ transform: [{ scale }] }}
        className={`w-3.5 h-3.5 mx-2 rounded-full ${
          filled ? "bg-primary" : "bg-muted"
        }`}
      />
    );
  };

  const handleSendMagicLink = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid email");
      return;
    }

    // TODO: Appwrite magic link
    setStep("emailSent");

    // Simulate magic link opened
    setTimeout(() => {
      setStep("passcode");
    }, 1500);
  };

  const handlePasscodePress = (num: string) => {
    if (passcode.length >= 4) return;

    const next = passcode + num;
    setPasscode(next);
    console.log(passcode);

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

  // const handlePasscodeComplete = async () => {
  //   if (passcode.length !== 4) return;

  //   // await AsyncStorage.setItem("between_passcode", passcode);
  //   setStep("confirmPasscode");
  // };

  const handleConfirmPasscodePress = (num: string) => {
    if (confirmPasscode.length >= 4) return;

    const next = confirmPasscode + num;
    setConfirmPasscode(next);

    if (next.length === 4) {
      if (next !== passcode) {
        Alert.alert("Passcode didn't match!");
        setConfirmPasscode("");
        return;
      }
      setStep("nickname");
    }
  };

  const handleFinish = async () => {
    setStep("complete");
    setTimeout(onComplete, 2500);
  };

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
                  We'll send you a magic link to sign in.{"\n"}No passwords to
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
                  onPress={handleSendMagicLink}
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

          {/* EMAIL SENT */}
          {step === "emailSent" && (
            <StepWrapper stepKey={step}>
              <View className="items-center mt-8">
                <View className="h-12 w-12 rounded-full bg-muted items-center justify-center mb-6">
                  <Mail size={20} color="#8a8075" />
                </View>

                <Text className="text-2xl font-medium">Check your email</Text>
                <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
                  Open the magic link to continue.
                </Text>
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
              <View className="flex-row flex-wrap justify-center w-full px-4 gap-3">
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
                      v === "delete"
                        ? handleBackspace()
                        : v && handlePasscodePress(v);
                    }}
                  >
                    {v === "delete" ? (
                      <Delete size={24} color="#5E5851" />
                    ) : (
                      <Text className="text-2xl text-foreground font-semibold">
                        {v}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>

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
                <View className="flex-row flex-wrap justify-center w-full px-4 gap-3">
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
                        v === "delete"
                          ? handleBackspace()
                          : v && handleConfirmPasscodePress(v);
                      }}
                    >
                      {v === "delete" ? (
                        <Delete size={24} color="#5E5851" />
                      ) : (
                        <Text className="text-2xl text-foreground font-semibold">
                          {v}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>

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
              <View className="items-center mt-10">
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
