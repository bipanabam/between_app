import { getActiveInvite } from "@/lib/appwrite";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { Copy, Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Invite = () => {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);

  // Fetch invite on mount
  useEffect(() => {
    const loadInvite = async () => {
      const invite = await getActiveInvite();
      setCode(invite?.code ?? null);
    };

    loadInvite();
  }, []);

  const onCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    alert("Code Copied");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-8 items-center">
        {/* Top spacing */}
        <View className="mt-20 mb-14 flex-row items-center">
          <View className="h-14 w-14 rounded-full bg-primary/20 items-center justify-center">
            <Heart size={22} color="#bc8f97" fill="#bc8f97" />
          </View>

          <View className="mx-4 flex-row gap-2">
            <View className="h-1 w-1 rounded-full bg-muted" />
            <View className="h-1 w-1 rounded-full bg-muted" />
            <View className="h-1 w-1 rounded-full bg-muted" />
          </View>

          <View className="h-14 w-14 rounded-full border border-dashed border-muted items-center justify-center">
            <Text className="text-mutedForeground text-xl">?</Text>
          </View>
        </View>

        <Text className="text-2xl font-medium mb-2">Invite your person</Text>

        <Text className="text-center text-mutedForeground text-sm leading-5 mb-10">
          Share this code with them.{"\n"}
          When they enter it, you'll be connected.
        </Text>

        {/* Code Card */}
        <View className="w-4/5 rounded-3xl bg-accent p-6 items-center mb-3">
          <Text className="text-3xl tracking-widest text-foreground mb-4">
            {code ?? "Loading..."}
          </Text>

          <Pressable
            onPress={onCopy}
            className="flex-row items-center gap-2 bg-muted px-6 py-3 rounded-full"
          >
            <Copy size={16} color="#6F6A63" />
            <Text className="text-mutedForeground text-sm">Copy code</Text>
          </Pressable>
        </View>

        <Text className="text-xs text-mutedForeground/70 mb-20">
          This code expires in 24 hours.
        </Text>

        <Text className="text-mutedForeground mb-4">or</Text>

        <Pressable
          onPress={() => router.push("/(pairing)/enter-code")}
          className="w-full h-14 rounded-2xl border border-muted items-center justify-center"
        >
          <Text className="text-mutedForeground text-base">I have a code</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Invite;
