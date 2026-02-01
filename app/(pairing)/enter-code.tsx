import { joinPairByCode } from "@/lib/appwrite";
import { Link, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EnterCode = () => {
  const [code, setCode] = useState("");
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (connecting) return;

    try {
      setConnecting(true);
      await joinPairByCode(code.trim().toUpperCase());
      router.replace("/(pairing)/success");
    } catch (e: any) {
      console.log(e);
      alert(e.message || "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Link href="/(pairing)/invite" className="absolute z-10 left-9 top-16">
        <ArrowLeft size={20} color="#8a8075" />
        <Text className="text-sm text-mutedForeground">Back</Text>
      </Link>
      <View className="flex-1 justify-center px-8">
        <Text className="text-2xl font-medium text-center mb-2">
          Enter their code
        </Text>

        <Text className="text-sm text-mutedForeground text-center mb-5">
          Ask your person for the code they see.
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          editable={!connecting}
          autoCapitalize="characters"
          placeholder="BET-1234"
          placeholderTextColor="#BDB7B0"
          className="h-14 w-full rounded-2xl px-6 mt-9 text-lg text-center bg-card border border-muted focus:border-primary"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!code || connecting}
          className="h-14 w-full bg-primary/90 rounded-2xl items-center justify-center mt-4 flex-row disabled:opacity-50"
        >
          {connecting ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white text-lg font-medium ml-3">
                Connecting...
              </Text>
            </>
          ) : (
            <Text className="text-white text-lg font-medium">Connect</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default EnterCode;
