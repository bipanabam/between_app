import { Heart, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export const SignupScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState<number>(0); // 0: Email, 1: Passcode, 2: Nickname
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [nickname, setNickname] = useState("");

  const steps = ["email", "passcode", "nickname"];

  const handleSendMagicLink = async () => {
    try {
      // Appwrite Magic Link Logic Here
      setStep(1);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handlePasscodePress = (num: string) => {
    if (passcode.length < 4) setPasscode((prev) => prev + num);
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
  };

  const nextStep = () => {
    if (step === 1 && passcode.length !== 4) return;
    if (step < 2) setStep(step + 1);
    else onComplete();
  };

  const RenderDots = () => (
    <View style={styles.dotContainer}>
      {steps.map((_, i) => (
        <View key={i} style={[styles.dot, step === i && styles.activeDot]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 items-center justify-between py-10"
      >
        {/* Header Section */}
        <View className="items-center mt-5">
          <View className="h-10 w-10 rounded-full items-center justify-center bg-primary/10 mb-4">
            <Heart size={24} color="#bc8f97" />
          </View>
          <Text className="text-xl font-medium text-foreground">Between</Text>
          <Text className="text-sm text-mutedForeground mt-1">
            Your private space
          </Text>
        </View>

        {/* Step 1: Email */}
        {step === 0 && (
          <View className="flex-1 items-center px-10">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-muted mb-2">
              <Mail size={20} color="#8a8075" />
            </View>
            <Text className="text-lg font-medium text-foreground">
              Enter your email
            </Text>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              We'll send you a magic link to sign in.{"\n"}No passwords to
              remember.
            </Text>
            <TextInput
              className="h-14 text-center text-base bg-card border-border/50 rounded-2xl px-5 mb-5 placeholder:text-mutedForeground/50 focus:border-primary/30 focus:ring-primary/20"
              //   style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#C7C7CD"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Pressable
              className="w-full h-14 rounded-2xl justify-center items-center bg-primary/90 disabled:opacity-50"
              onPress={handleSendMagicLink}
              disabled={!email}
            >
              <Text className="text-white text-lg font-semibold">
                Continue →
              </Text>
            </Pressable>
            <Text className="mt-5 text-xs text-mutedForeground/70 text-center">
              Your email stays private. We never share it.
            </Text>
          </View>
        )}

        {/* Step 2: Passcode (Custom Keypad) */}
        {step === 1 && (
          <View className="items-center px-10">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-muted mb-2">
              <Lock size={20} color="#8a8075" />
            </View>
            <Text className="text-lg font-medium text-foreground">
              Set your privacy code
            </Text>
            <Text className="text-sm text-mutedForeground leading-relaxed">
              A 4-digit code to keep your space safe.
            </Text>

            <View className="flex-row mb-10">
              {[...Array(4)].map((_, i) => (
                <View
                  className={`w-3 h-3 rounded-full mx-2 ${
                    passcode.length > i ? "bg-primary" : "bg-muted"
                  }`}
                  key={i}
                />
              ))}
            </View>

            <View className="flex-wrap flex-row justify-center w-64">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
                (val, i) => (
                  <Pressable
                    key={i}
                    className="w-20 h-14 justify-center items-center"
                    onPress={() =>
                      val === "⌫"
                        ? handleBackspace()
                        : val !== "" && handlePasscodePress(val)
                    }
                  >
                    <Text style={styles.keyText}>{val}</Text>
                  </Pressable>
                ),
              )}
            </View>

            {passcode.length === 4 && (
              <Pressable
                className="w-full h-14 bg-primary rounded-2xl justify-center items-center mt-5"
                onPress={nextStep}
              >
                <Text className="text-white text-lg font-semibold">
                  Continue →
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Step 3: Nickname */}
        {step === 2 && (
          <View className="items-center px-10">
            <View className="w-10 h-10 rounded-full items-center justify-center bg-muted mb-2">
              <User size={28} color="#bc8f97" />
            </View>
            <Text className="text-lg font-medium text-foreground">
              What should we call you?
            </Text>
            <Text className="text-sm text-mutedForeground leading-relaxed">
              A nickname for your partner to see.{"\n"}You can always change
              this later.
            </Text>
            <TextInput
              className="h-14 text-center text-base bg-card border-border/50 rounded-2xl px-5 mb-5 placeholder:text-mutedForeground/50 focus:border-primary/30 focus:ring-primary/20"
              placeholder="Your nickname"
              value={nickname}
              onChangeText={setNickname}
            />
            <Pressable
              className="w-full h-14 bg-primary rounded-2xl justify-center items-center mt-5"
              onPress={nextStep}
            >
              <Text className="text-white text-lg font-semibold">
                Continue →
              </Text>
            </Pressable>
            <Pressable onPress={nextStep} style={{ marginTop: 20 }}>
              <Text className="text-sm text-mutedForeground">Skip for now</Text>
            </Pressable>
          </View>
        )}

        <RenderDots />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F7F5" },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginTop: 20 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EBE3DF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  brandTitle: { fontSize: 22, fontWeight: "600", color: "#4A4A4A" },
  brandSubtitle: { fontSize: 14, color: "#9E9E9E", marginTop: 4 },
  content: { width: "100%", alignItems: "center", paddingHorizontal: 40 },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F2EBE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  stepDescription: {
    textAlign: "center",
    color: "#8E8E8E",
    lineHeight: 20,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E8E0DA",
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#D8C2BC",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  footerNote: { marginTop: 20, fontSize: 12, color: "#BDBDBD" },
  skipText: { color: "#BDBDBD", fontSize: 14 },
  // Passcode Styles
  passcodeDisplay: { flexDirection: "row", marginBottom: 30 },
  passcodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  passcodeDotFilled: { backgroundColor: "#D8C2BC" },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    justifyContent: "center",
  },
  key: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  keyText: { fontSize: 24, color: "#4A4A4A" },
  // Dot Pagination
  dotContainer: { flexDirection: "row", marginBottom: 20 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: "#D8C2BC", width: 20 },
});
