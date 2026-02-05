import HeartLoader from "@/components/HearLoader";
import ConversationStory from "@/components/story/ConverstionStory";
import GrowthSentence from "@/components/story/GrowthSentence";
import MemoryStory from "@/components/story/MemoryStory";
import RelationshipClockCounter from "@/components/story/RelationshipClockCounter";
import StoryHero from "@/components/story/StoryHero";
import VoiceStory from "@/components/story/VoiceStory";
import { getMyPair, getOrCreatePairStats } from "@/lib/appwrite";
import { PairStats } from "@/types/type";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StoryDivider = () => (
  <View className="items-center my-7">
    <View className="w-12 h-[2px] bg-mutedForeground rounded-full opacity-40" />
  </View>
);

const PairStoryScreen = () => {
  const [pair, setPair] = useState<any>(null);
  const [stats, setStats] = useState<PairStats | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const pairDoc = await getMyPair();
    setPair(pairDoc);
    if (pairDoc) {
      const statsDoc = await getOrCreatePairStats(pairDoc);
      setStats(statsDoc);
    }
  };
  if (!pair || !stats) {
    return (
      <View className="flex-1 justify-center items-center">
        <HeartLoader />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <StoryHero pair={pair} />

        {/* Intro line */}
        <Text className="text-center text-mutedForeground/60 mt-5 mb-3">
          Your story so far ✨
        </Text>''
        <RelationshipClockCounter pair={pair} />

        <StoryDivider />

        <ConversationStory stats={stats} />
        <MemoryStory stats={stats} />
        <VoiceStory stats={stats} />

        <StoryDivider />

        <GrowthSentence stats={stats} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PairStoryScreen;
