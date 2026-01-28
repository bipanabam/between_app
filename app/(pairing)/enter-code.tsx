import { Link, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EnterCode = () => {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    // Logic
    router.push("/(tabs)/between");
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

        <Text className="text-sm text-mutedForeground text-center mb-8">
          Ask your person for the code they see.
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          placeholder="love-1234"
          className="h-14 rounded-2xl bg-card text-center text-lg tracking-widest mb-6"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!code}
          className="h-14 rounded-2xl bg-primary items-center justify-center disabled:opacity-40"
        >
          <Text className="text-white text-lg font-medium">Connect</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default EnterCode;
