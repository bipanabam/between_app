import AnimatedCounter from "@/components/AnimatedCounter";
import HeartLoader from "@/components/HearLoader";
import PartnerCard from "@/components/PartnerCard";
import RotatingMicrocopy from "@/components/RotatingMicrocopy";
import TogetherSinceCard from "@/components/TogetherSinceCard";
import { privacyMicrocopy } from "@/constant/privacyMicrocopy";
import {
  confirmRelationshipDate,
  ensureUserDocument,
  getMyPair,
  getOrCreatePairStats,
  getPartner,
  proposeRelationshipDate,
} from "@/lib/appwrite";
import { PairStats } from "@/types/type";
import { useRouter } from "expo-router";
import {
  Bookmark,
  Camera,
  ChevronRight,
  Heart,
  MessageCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Between = () => {
  const [me, setMe] = useState<any>(null);
  const [pair, setPair] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats] = useState<PairStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const [meDoc, partnerDoc, pairDoc] = await Promise.all([
        ensureUserDocument(),
        getPartner(),
        getMyPair(),
      ]);
      setMe(meDoc);
      setPartner(partnerDoc);
      setPair(pairDoc);
      if (pairDoc) {
        const statsDoc = await getOrCreatePairStats(pairDoc);
        setStats(statsDoc);
      }
    };

    load();
  }, []);

  const handleProposeDate = async (date: Date) => {
    if (!pair || !me) return;
    await proposeRelationshipDate(pair.$id, date, me.$id);

    const updated = await getMyPair();
    setPair(updated);
  };

  const handleConfirmDate = async () => {
    if (!pair) return;
    await confirmRelationshipDate(pair);

    const updated = await getMyPair();
    setPair(updated);
  };
  const daysTogetherHere = pair?.$createdAt
    ? Math.floor((Date.now() - new Date(pair.$createdAt).getTime()) / 86400000)
    : 0;

  if (!me || !partner || !pair) {
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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-center text-mutedForeground/60 mt-6">
          Your quiet space together
        </Text>

        {/* Couple */}
        <View className="flex-row justify-center gap-12 mt-10">
          <PartnerCard
            name={partner.nickname}
            status="here now"
            emoji="💗"
            mood="😌"
            color="#E57399"
          />

          <PartnerCard
            name={me.nickname}
            status="tap"
            emoji="💙"
            mood="🙂"
            color="#2F6BD6"
          />
        </View>

        <Text className="text-center text-mutedForeground/50 mt-4">
          ✧ Both here, right now ✧
        </Text>

        {/* Together Since */}
        <TogetherSinceCard
          pair={pair}
          meId={me.$id}
          onPropose={handleProposeDate}
          onConfirm={handleConfirmDate}
        />

        {/* Stats */}
        <Pressable
          onPress={() => router.push(`/story/${pair.$id}`)}
          className="bg-card rounded-3xl p-6 mt-6 shadow-sm"
        >
          <Text className="text-mutedForeground mb-4">
            Moments captured in this space
          </Text>

          <View className="flex-row justify-between">
            <Stat
              icon={MessageCircle}
              label="messages"
              value={stats?.messagesCount ?? 0}
            />
            <Stat
              icon={Camera}
              label="moments"
              value={stats?.photosCount ?? 0}
            />
            <Stat
              icon={Bookmark}
              label="collection"
              value={stats?.savedCount ?? 0}
            />
            <Stat icon={Heart} label="days here" value={daysTogetherHere} />
          </View>
        </Pressable>

        {/* Today's Question */}
        <Pressable className="bg-card rounded-3xl p-5 mt-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="bg-muted p-3 rounded-xl">
                <MessageCircle size={18} color="#8a8075" />
              </View>

              <View className="flex-1">
                <Text className="text-mutedForeground text-sm">
                  Today’s question 🌙
                </Text>
                <Text numberOfLines={1} className="text-foreground font-medium">
                  What's one thing you're grateful for today?
                </Text>
              </View>
            </View>

            <ChevronRight size={18} color="#8a8075" />
          </View>
        </Pressable>

        {/* Last Memory */}
        <View className="bg-card rounded-3xl p-5 mt-6 shadow-sm flex-row items-center gap-4">
          <View className="bg-muted p-4 rounded-xl">
            <Camera size={18} color="#8a8075" />
          </View>

          <View className="flex-1">
            <Text className="text-mutedForeground text-sm">Last memory</Text>
            <Text className="text-foreground font-medium">
              “Sunday morning together”
            </Text>
            <Text className="text-mutedForeground text-xs mt-1">
              3 days ago
            </Text>
          </View>
        </View>

        {/* CTA */}
        <Pressable className="bg-primary/80 rounded-2xl py-5 mt-8 items-center">
          <View className="flex-row items-center gap-3">
            <Heart size={18} color="white" />
            <Text className="text-white text-lg font-medium">
              Thinking of you
            </Text>
          </View>
        </Pressable>

        {/* Footer */}
        <RotatingMicrocopy lines={privacyMicrocopy} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => {
  return (
    <View className="items-center gap-2">
      <View className="bg-muted p-3 rounded-xl">
        <Icon size={18} color="#8a8075" />
      </View>
      {/* <Text className="text-foreground font-semibold">{value}</Text> */}
      <AnimatedCounter
        key={value}
        value={value}
        duration={2000}
        className="text-primary font-semibold"
      />

      <Text className="text-mutedForeground text-xs">{label}</Text>
    </View>
  );
};

export default Between;
