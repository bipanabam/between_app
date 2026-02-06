import AnimatedCounter from "@/components/AnimatedCounter";
import DailyQuestionCard from "@/components/between/DailyQuestionCard";
import LoveRitualPanel from "@/components/between/LoveRitualPanel";
import MoodBottomSheet from "@/components/between/MoodBottomSheet";
import TogetherSinceCard from "@/components/between/TogetherSinceCard";
import HeartLoader from "@/components/HearLoader";
import PartnerCard from "@/components/PartnerCard";
import RotatingMicrocopy from "@/components/RotatingMicrocopy";
import { privacyMicrocopy } from "@/constant/privacyMicrocopy";
import { QuestionCategory } from "@/constant/questions";
import {
  confirmRelationshipDate,
  ensureUserDocument,
  getActiveMood,
  getMutualStreak,
  getMyPair,
  getOrCreatePairStats,
  getOrCreateTodayQuestion,
  getPartner,
  getQuestionText,
  hasSentLoveToday,
  proposeRelationshipDate,
  sendThinkingOfYouNotification,
  submitQuestionAnswer,
  updateMood,
  updatePushToken,
} from "@/lib/appwrite";
import { isOnline } from "@/lib/helper";
import { registerForPushToken } from "@/lib/push";
import { PairStats, QuestionAnswer } from "@/types/type";
import { useRouter } from "expo-router";
import { Bookmark, Camera, Heart, MessageCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Between = () => {
  const [me, setMe] = useState<any>(null);
  const [pair, setPair] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats] = useState<PairStats | null>(null);

  const [todayQ, setTodayQ] = useState<any>(null);
  const [questionText, setQuestionText] = useState("");
  const [myAnswer, setMyAnswer] = useState<string | undefined>();
  const [partnerAnswer, setPartnerAnswer] = useState<string | undefined>();

  const [isSendingLove, setIsSendingLove] = useState(false);

  const partnerOnline = isOnline(partner?.lastActiveAt);
  const meOnline = isOnline(me?.lastActiveAt);

  const [mutualStreak, setMutualStreak] = useState(0);
  const [sentToday, setSentToday] = useState(false);

  const [myMood, setMyMood] = useState<string | null>(null);
  const [partnerMood, setPartnerMood] = useState<string | null>(null);
  const [showMoodSheet, setShowMoodSheet] = useState(false);

  const [currentCategory, setCurrentCategory] =
    useState<QuestionCategory>("light");

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
      setMyMood(getActiveMood(meDoc));
      setPartnerMood(getActiveMood(partnerDoc));

      if (pairDoc && meDoc) {
        const [streak, sent] = await Promise.all([
          getMutualStreak(pairDoc.$id),
          hasSentLoveToday(pairDoc.$id, meDoc.$id),
        ]);

        setMutualStreak(streak);
        setSentToday(sent);
      }

      if (pairDoc) {
        const statsDoc = await getOrCreatePairStats(pairDoc);
        const qDoc = await getOrCreateTodayQuestion(pairDoc);

        setStats(statsDoc);
        setTodayQ(qDoc);

        // map into UI state
        const selectedQuestion = getQuestionText(qDoc?.questionId);
        setQuestionText(selectedQuestion ?? "");
        setCurrentCategory((qDoc?.category as QuestionCategory) ?? "light");

        // answers to question if any
        const answers: QuestionAnswer[] = JSON.parse(qDoc.answers ?? "[]");
        setMyAnswer(answers.find((a) => a.userId === meDoc.$id)?.text);
        setPartnerAnswer(answers.find((a) => a.userId !== meDoc.$id)?.text);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const setupPush = async () => {
      if (!me) return;

      const token = await registerForPushToken();
      if (!token) return;

      if (token !== me.pushToken) {
        await updatePushToken(me.$id, token);
      }
    };

    setupPush();
  }, [me]);

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

  // Today's question
  const submitAnswer = async (answer: string) => {
    if (!todayQ || !me || !pair) return;

    await submitQuestionAnswer(todayQ, me.$id, answer);

    const refreshed = await getOrCreateTodayQuestion(pair);
    setTodayQ(refreshed);
    const answers: QuestionAnswer[] = JSON.parse(refreshed.answers ?? "[]");

    setMyAnswer(answers.find((a) => a.userId === me.$id)?.text);
    setPartnerAnswer(answers.find((a) => a.userId !== me.$id)?.text);
  };

  const changeQuestion = async () => {
    if (!pair) return;

    const qDoc = await getOrCreateTodayQuestion(pair, currentCategory, {
      forceNew: true,
    });

    setTodayQ(qDoc);
    setQuestionText(getQuestionText(qDoc.questionId));
    setPartnerAnswer(undefined);
  };

  const setCategory = async (category: QuestionCategory) => {
    if (!pair) return;

    setCurrentCategory(category);

    const qDoc = await getOrCreateTodayQuestion(pair, category, {
      forceNew: true,
    });

    setTodayQ(qDoc);
    setQuestionText(getQuestionText(qDoc.questionId));
  };

  // handle thinking of you
  const handleThinkingOfYou = async () => {
    if (!partner || !me || !pair || isSendingLove) return;

    try {
      setIsSendingLove(true);

      await sendThinkingOfYouNotification({
        pairId: pair.$id,
        fromUserId: me.$id,
        toUserId: partner.$id,
        fromName: me.nickname,
      });

      // refresh ritual state after send
      const [streak, sent] = await Promise.all([
        getMutualStreak(pair.$id),
        hasSentLoveToday(pair.$id, me.$id),
      ]);

      setMutualStreak(streak);
      setSentToday(sent);

      Toast.show({
        type: "success",
        text1: "💞 Little love is Sent",
        text2: `${partner.nickname} will feel it soon`,
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Couldn’t send",
        text2: "Connection hiccup — try again",
      });
    } finally {
      setTimeout(() => setIsSendingLove(false), 1200);
    }
  };

  if (!me || !partner || !pair) {
    return (
      <View className="flex-1 justify-center items-center">
        <HeartLoader />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-card">
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
            emoji="💗"
            mood={partnerMood ?? ""}
            color="#E57399"
            online={partnerOnline}
            lastActiveAt={partner.lastActiveAt}
          />

          <PartnerCard
            name={me.nickname}
            emoji="💙"
            mood={myMood ?? ""}
            color="#2F6BD6"
            online={meOnline}
            lastActiveAt={me.lastActiveAt}
            onPressAvatar={() => setShowMoodSheet(true)}
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

        {/* Love Ritual Panel */}
        <LoveRitualPanel
          onSend={handleThinkingOfYou}
          isSending={isSendingLove}
          sentToday={sentToday}
          streak={mutualStreak}
        />

        {/* Today's Question */}
        <DailyQuestionCard
          question={questionText}
          partnerAnswer={partnerAnswer}
          myAnswer={myAnswer}
          partnerName={partner.nickname}
          currentCategory={currentCategory}
          onSubmitAnswer={submitAnswer}
          onChangeQuestion={changeQuestion}
          onCategoryChange={setCategory}
        />

        {/* Stats */}
        <Pressable
          onPress={() => router.push(`/story/${pair.$id}`)}
          className="bg-background rounded-3xl p-6 mt-6 shadow-sm"
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

        {/* Last Memory */}
        <View className="bg-background rounded-3xl p-5 mt-6 shadow-sm flex-row items-center gap-4">
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
        {/* <ThinkingOfYouButton
          onPress={handleThinkingOfYou}
          isSending={isSendingLove}
        /> */}

        {/* Footer */}
        <RotatingMicrocopy lines={privacyMicrocopy} />
        <MoodBottomSheet
          isOpen={showMoodSheet}
          onSelect={async (mood) => {
            setMyMood(mood.emoji);

            await updateMood(me.$id, mood.emoji, mood.label);

            setShowMoodSheet(false);
            Toast.show({
              type: "success",
              text1: `${mood.emoji} Mood shared`,
              text2: "They’ll see how you feel",
            });

            // update local copy so UI stays in sync
            setMe({
              ...me,
              moodEmoji: mood.emoji,
              moodUpdatedAt: new Date().toISOString(),
            });
          }}
          onClose={() => setShowMoodSheet(false)}
        />
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
