import PairConnectionAnimation from "@/components/PairConnectionAnimation";
import { ensureUserDocument, getPartner } from "@/lib/appwrite";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Success = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [me, setMe] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      const [meDoc, partnerDoc] = await Promise.all([
        ensureUserDocument(),
        getPartner(),
      ]);
      setMe(meDoc);
      setPartner(partnerDoc);
    };

    load();
  }, []);

  if (!me || !partner) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          {/* Success Icon */}
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-8">
            <Heart size={27} color="#bc8f97" fill="#bc8f97" />
          </View>

          {/* Title */}
          <Text className="text-2xl font-semibold text-foreground text-center">
            You're Connected
          </Text>

          {/* Subtitle */}
          <Text className="text-mutedForeground text-center mt-2 px-4">
            You and {partner?.nickname ?? "Your Partner"} now share a private
            space together.
          </Text>

          {/* Pair Animation Row */}
          <PairConnectionAnimation me={me} partner={partner} />

          {/* Continue Button */}
          {me || partner ? (
            <Pressable
              onPress={() => router.replace("/(tabs)/between")}
              className="mt-12 px-10 py-4 rounded-2xl bg-primary/80 items-center justify-center"
            >
              <Text className="text-white text-lg font-medium">Continue</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Success;
