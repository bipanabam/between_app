import PasscodeDot from "@/components/PasscodeDot";
import { useAuth } from "@/providers/AuthProvider";
import { hashPasscode } from "@/types/helpers";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Delete, Shield } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const [code, setCode] = useState("");
  const { user, unlockApp } = useAuth();
  const router = useRouter();

  const haptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePasscodePress = (num: string) => {
    if (code.length >= 4) return;

    const next = code + num;
    setCode(next);
  };

  const handleBackspace = () => {
    setCode((p) => p.slice(0, -1));
  };

  const verify = async () => {
    const hash = await hashPasscode(code);
    let storedHash = await SecureStore.getItemAsync("between_passcode_hash");

    if (!storedHash) {
      storedHash = user?.passcodeHash ?? null;
    }
    if (hash === storedHash) {
      await unlockApp();
    } else {
      Alert.alert("Wrong passcode");
      setCode("");
    }
  };

  useEffect(() => {
    if (code.length === 4) verify();
  }, [code]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-8 justify-center items-center">
          <View className="items-center w-full">
            <View className="h-14 w-14 rounded-full bg-muted items-center justify-center mb-6">
              <Shield size={24} color="#bc8f97" fill="#bc8f97" />
            </View>

            <Text className="text-2xl font-medium">Welcome back</Text>
            <Text className="text-sm text-center text-mutedForeground mt-3 leading-5">
              Enter your passcode
            </Text>

            {/* Dots */}
            <View className="flex-row my-9">
              {[0, 1, 2, 3].map((i) => (
                <PasscodeDot key={i} filled={code.length > i} />
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
                  className="w-1/4 h-16 items-center justify-center rounded-full bg-muted"
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;
