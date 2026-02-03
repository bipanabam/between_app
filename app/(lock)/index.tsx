import PasscodeDot from "@/components/PasscodeDot";
import { useAuth } from "@/providers/AuthProvider";
import { hashPasscode } from "@/types/helpers";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Delete, Shield } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const { user, unlockApp, loading } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
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
      Alert.alert("Not ready yet — please try again");
      setCode("");
      return;
    }
    if (hash === storedHash) {
      await unlockApp();
    } else {
      triggerShake();
      setError(true);
      // Delay the reset slightly so the user sees the 4th dot fill before it shakes/clears
      setTimeout(() => {
        setCode("");
      }, 200);
      return;
    }
  };

  useEffect(() => {
    if (code.length === 4 && !loading && user) {
      verify();
    }
  }, [code, loading, user]);

  // Clear error state when user starts re-typing
  useEffect(() => {
    if (code.length > 0 && error) {
      setError(false);
    }
  }, [code]);

  // Initialize the shake value
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    // Trigger error haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    //shake sequence
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
            {/* Instruction or error message */}
            <View className="h-6 items-center justify-center mt-3">
              {error ? (
                <Text className="text-red-500 text-sm font-medium">
                  Incorrect passcode. Please try again.
                </Text>
              ) : (
                <Text className="text-sm text-center text-mutedForeground leading-5">
                  Enter your passcode
                </Text>
              )}
            </View>

            {/* Dots */}
            <Animated.View
              style={{
                flexDirection: "row",
                marginVertical: 32,
                transform: [{ translateX: shakeAnim }],
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <PasscodeDot key={i} filled={code.length > i} />
              ))}
            </Animated.View>

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

            <Pressable
              className="mt-6"
              onPress={() => {
                Alert.alert(
                  "Reset passcode?",
                  "You'll need to verify your email.",
                  [
                    { text: "Cancel" },
                    {
                      text: "Continue",
                      onPress: () => router.push("/(reset)"),
                    },
                  ],
                );
              }}
            >
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
