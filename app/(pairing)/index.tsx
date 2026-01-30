import { createPairAndInvite } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const router = useRouter();

  const beginPairing = async () => {
    const invite = await createPairAndInvite();

    router.push({
      pathname: "/(pairing)/invite",
      params: { code: invite.code },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        {/* Decorative Circles */}
        <View className="flex-row gap-2 mb-10">
          <View className="h-11 w-11 rounded-full bg-partnerOne/50 border border-partnerOne" />
          <View className="h-11 w-11 rounded-full bg-partnerTwo/50 border border-partnerTwo" />
        </View>

        <Text className="text-3xl font-medium text-foreground mb-3">Us</Text>

        <Text className="text-center text-mutedForeground text-base leading-6 mb-16">
          A quiet space{"\n"}just for the two of you.
        </Text>

        <Pressable
          onPress={beginPairing}
          className="w-full h-14 rounded-full bg-primary/80 items-center justify-center"
        >
          <Text className="text-white text-lg font-medium">Begin</Text>
        </Pressable>

        <Text className="text-xs text-mutedForeground/70 mt-8 text-center">
          No social feeds. No strangers.{"\n"}Just us.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;
