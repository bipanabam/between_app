import HeartLoader from "@/components/HearLoader";
import StoryChapters from "@/components/story/StoryChapters";
import StoryReflection from "@/components/story/StoryReflection";
import StoryTimeline from "@/components/story/StoryTimeline";
import {
  ensureUserDocument,
  getMyPair,
  getOrCreatePairStats,
  getPartner,
} from "@/lib/appwrite";
import { PairStats } from "@/types/type";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
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
    <LinearGradient
      colors={["#FDFBFF", "#F8F2F4", "#F3E8EE"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
        >
          <View className="flex-row items-start px-4 pt-3">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={22} color="#bc8f97" />
            </Pressable>
          </View>
          <StoryTimeline pair={pair} />

          <Text className="text-center text-xs text-mutedForeground/50 mt-6">
            This is the story you’ve been writing together
          </Text>
          <StoryChapters pair={pair} partner={partner} me={me} stats={stats} />
          <StoryReflection />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PairStoryScreen;
