import { getPartner } from "@/lib/appwrite";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";

type Props = {
  partnerName?: string;
  partnerAvatar?: string;
};

const Success = ({ partnerName = "Your Partner", partnerAvatar }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const loadPartner = async () => {
      const partnerDoc = await getPartner();
      setPartner(partnerDoc);
    };

    loadPartner();
  }, []);

  return (
    <View className="flex-1 bg-[#F6F2ED] items-center justify-center px-6">
      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        {/* Success Icon */}
        <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-sm mb-8">
          <Text className="text-4xl">🤍</Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-semibold text-neutral-800 text-center">
          You're Connected
        </Text>

        {/* Subtitle */}
        <Text className="text-neutral-500 text-center mt-2 px-4">
          You and {partner?.nickname ?? "Your Partner"} now share a private
          space together.
        </Text>

        {/* Partner Avatar */}
        <View className="mt-10 items-center">
          {partner?.avatar ? (
            <Image
              source={{ uri: partner.avatar }}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-sm">
              <Text className="text-xl">👤</Text>
            </View>
          )}

          <Text className="mt-3 text-neutral-700 font-medium">
            {partner?.nickname}
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          onPress={() => router.replace("/(tabs)/between")}
          className="mt-14 bg-neutral-900 px-10 py-4 rounded-2xl"
        >
          <Text className="text-white font-medium">Continue</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default Success;
