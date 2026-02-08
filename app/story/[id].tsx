import HeartLoader from "@/components/HearLoader";
import ConversationStory from "@/components/story/ConverstionStory";
import GrowthSentence from "@/components/story/GrowthSentence";
import MemoryStory from "@/components/story/MemoryStory";
import RelationshipClockCounter from "@/components/story/RelationshipClockCounter";
import StoryHero from "@/components/story/StoryHero";
import StoryReveal from "@/components/story/StoryReveal";
import VoiceStory from "@/components/story/VoiceStory";
import {
  ensureUserDocument,
  getMyPair,
  getOrCreatePairStats,
  getPartner,
} from "@/lib/appwrite";
import { PairStats } from "@/types/type";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StoryDivider = () => (
  <View className="items-center my-7">
    <View className="w-12 h-[2px] bg-mutedForeground rounded-full opacity-40" />
    {/* <View className="h-px w-24 bg-primary/20 mt-5 rounded-full" /> */}
  </View>
);

const PairStoryScreen = () => {
  const [pair, setPair] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats] = useState<PairStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [meDoc, partnerDoc, pairDoc] = await Promise.all([
        ensureUserDocument(),
        getPartner(),
        getMyPair(),
      ]);
      setPair(pairDoc);
      setPartner(partnerDoc);
      setMe(meDoc);
      if (pairDoc) {
        const statsDoc = await getOrCreatePairStats(pairDoc);
        setStats(statsDoc);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!pair || !stats) {
    return (
      <View className="flex-1 bg-muted justify-center items-center">
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
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
      >
        <Text className="text-center text-xs text-mutedForeground/50 mt-2">
          This is the story you’ve been writing together
        </Text>

        <StoryReveal delay={0}>
          <StoryHero pair={pair} partner={partner} me={me} />
        </StoryReveal>
        <View className="h-6" />

        {/* Intro line */}
        <Text className="text-center text-mutedForeground/60 mt-5 mb-3">
          Your story so far ✨
        </Text>
        <StoryReveal delay={120}>
          <RelationshipClockCounter pair={pair} />
        </StoryReveal>

        <StoryDivider />

        <Text className="text-xs text-mutedForeground/40 mt-8 mb-3">
          Your connection
        </Text>

        <StoryReveal delay={240}>
          <ConversationStory stats={stats} />
        </StoryReveal>

        <Text className="text-center text-mutedForeground/50 italic my-4">
          From words to moments
        </Text>

        <MemoryStory stats={stats} />

        <Text className="text-center text-mutedForeground/50 italic my-4">
          From moments to voices
        </Text>

        <VoiceStory stats={stats} />
        <StoryDivider />
        <GrowthSentence stats={stats} />
        <View className="items-center mt-12 mb-16">
          <Text className="text-mutedForeground/60 italic text-center">
            Still unfolding — one moment at a time ✨
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PairStoryScreen;
