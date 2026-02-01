import PartnerCard from "@/components/PartnerCard";
import { ensureUserDocument, getPartner } from "@/lib/appwrite";
import { Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Between = () => {
  const [me, setMe] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);

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
      <View className="flex-1 flex-col px-6 pt-14 justify-between mb-28">
        {/* Header */}
        <Text className="text-center text-mutedForeground/50 mt-6">
          Your quiet space together
        </Text>

        <View className="flex-col gap-10 mt-20">
          {/* Couple Row */}
          <View className="flex-row justify-center gap-14 px-6">
            <PartnerCard
              name={partner?.nickname}
              status="here now"
              // avatar={partner?.avatar}
              emoji="💗"
              mood="😌"
              color="#E57399"
            />

            <PartnerCard
              name={me?.nickname}
              status="tap to update"
              // avatar={me?.avatar}
              emoji="💙"
              mood="..."
              color="#2F6BD6"
            />
          </View>

          {/* Both here */}
          <Text className="text-center text-mutedForeground/50">
            ✧ Both here, right now ✧
          </Text>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        <View className="flex-col">
          <Text className="text-center text-mutedForeground/40 mb-4">
            This space grows with every conversation
          </Text>

          {/* CTA */}
          <Pressable className="bg-primary/80 py-5 rounded-full items-center mb-6">
            <View className="flex-row items-center gap-2">
              <Heart size={18} color="white" />
              <Text className="text-white text-lg font-medium">
                Thinking of you
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Between;
