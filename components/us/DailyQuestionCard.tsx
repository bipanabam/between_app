import { QuestionCategory } from "@/constant/questions";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronDown, RefreshCw, Send } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import AnimatedRe, {
  FadeIn,
  FadeOut,
  interpolate,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import StatusBadge from "../StatusBadge";

const categories = [
  { id: "light", label: "Light", emoji: "☀️" },
  { id: "deep", label: "Deep", emoji: "🌊" },
  { id: "flirty", label: "Flirty", emoji: "💕" },
  { id: "reflective", label: "Reflective", emoji: "🌙" },
] as const satisfies {
  id: QuestionCategory;
  label: string;
  emoji: string;
}[];

type Props = {
  question: string;
  partnerAnswer?: string;
  myAnswer?: string;
  partnerName: string;
  currentCategory: QuestionCategory;
  onChangeQuestion: () => void;
  onCategoryChange: (c: QuestionCategory) => void;
  onSubmitAnswer: (text: string) => void;
};

const DailyQuestionCard = ({
  question,
  partnerAnswer,
  myAnswer,
  partnerName,
  onChangeQuestion,
  onCategoryChange,
  onSubmitAnswer,
  currentCategory,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [myAnswerText, setMyAnswerText] = useState("");

  const bothAnswered = !!partnerAnswer && !!myAnswer;
  const iAnswered = !!myAnswer;
  const partnerAnswered = !!partnerAnswer;

  const chevron = useSharedValue(0);
  const glow = useSharedValue(0);

  const reveal = useSharedValue(0);

  useEffect(() => {
    if (bothAnswered) {
      reveal.value = withTiming(1, { duration: 450 });
    }
  }, [bothAnswered]);

  useEffect(() => {
    if (bothAnswered) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      reveal.value = withTiming(1, { duration: 450 });

      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 800 }),
        ),
        2,
        false,
      );
    }
  }, [bothAnswered]);

  const glowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glow.value, [0, 1], [0.12, 0.22]);
    const scale = interpolate(glow.value, [0, 1], [1, 1.01]);

    return {
      shadowColor: "#bc8f97",
      shadowOpacity,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      transform: [{ scale }],
    };
  });

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setExpanded((prev) => {
      const next = !prev;
      chevron.value = withTiming(next ? 1 : 0, { duration: 200 });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!myAnswerText.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    onSubmitAnswer(myAnswerText.trim());
    setMyAnswerText("");
  };

  const cat = categories.find((c) => c.id === currentCategory);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <AnimatedRe.View
        layout={Layout.springify()}
        className="rounded-3xl overflow-hidden mt-6"
        style={{
          borderWidth: 1,
          borderColor: "#ded9d3",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <LinearGradient
          colors={
            expanded
              ? ["#ffffff", "rgba(188,143,151,0.18)"]
              : ["#ffffff", "#ffffff"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <Pressable
            onPress={toggleExpand}
            className="p-5 flex-row items-center justify-between"
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <View className="flex-row gap-3 flex-1 items-center">
              <View className="bg-primary/20 w-10 h-10 rounded-full items-center justify-center">
                <Text>💭</Text>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-mutedForeground mb-1">
                  Daily question · {cat?.emoji} {cat?.label}
                </Text>

                <Text
                  numberOfLines={expanded ? 3 : 1}
                  className="text-foreground font-medium pr-2"
                >
                  {question}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              {bothAnswered && <StatusBadge label="Complete 💞" />}
              <AnimatedRe.View style={chevronStyle}>
                <ChevronDown size={18} color="#8a8075" />
              </AnimatedRe.View>
            </View>
          </Pressable>

          {/* Expanded */}
          {expanded && (
            <AnimatedRe.View
              entering={FadeIn.duration(450).withInitialValues({
                transform: [{ scale: 0.9 }],
              })}
              exiting={FadeOut}
              layout={Layout.springify()}
              className="px-5 pb-5 gap-5"
            >
              {/* Category Pills */}
              {showCategories && (
                <AnimatedRe.View
                  layout={Layout.springify()}
                  className="flex-row flex-wrap gap-2"
                >
                  {categories.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        onCategoryChange(c.id);
                        setShowCategories(false);
                      }}
                      className={`px-3 py-2 rounded-full ${
                        currentCategory === c.id
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-muted opacity-80"
                      }`}
                      style={({ pressed }) => [
                        { transform: [{ scale: pressed ? 0.97 : 1 }] },
                      ]}
                    >
                      <Text className="text-xs">
                        {c.emoji} {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </AnimatedRe.View>
              )}

              {/* Partner Answer */}
              {partnerAnswer && (
                <AnimatedRe.View style={bothAnswered ? glowStyle : undefined}>
                  <View className="bg-partnerOne/20 border border-primary/20 rounded-2xl p-4">
                    <Text className="text-xs text-mutedForeground mb-1">
                      {partnerName}:
                    </Text>

                    {bothAnswered ? (
                      <Text className="italic text-foreground">
                        “{partnerAnswer}”
                      </Text>
                    ) : (
                      <View className="h-5 rounded-xl bg-muted/60 items-center justify-center">
                        <Text className="text-xs text-mutedForeground">
                          🔒 Answer will reveal after you respond
                        </Text>
                      </View>
                    )}
                  </View>
                </AnimatedRe.View>
              )}

              {/* My Answer */}
              {iAnswered && (
                <View className="bg-partnerTwo/20 border border-border rounded-2xl p-4">
                  <Text className="text-xs text-mutedForeground mb-1">You</Text>
                  <Text className="italic text-foreground">“{myAnswer}”</Text>
                </View>
              )}

              {/*Input */}
              {!iAnswered && !bothAnswered && (
                <View
                  className={`rounded-2xl p-4 ${
                    myAnswerText.trim()
                      ? "bg-partnerTwo/30"
                      : "bg-partnerTwo/20"
                  }`}
                >
                  <Text className="text-xs text-mutedForeground mb-2">
                    Your turn
                  </Text>

                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={myAnswerText}
                      onChangeText={setMyAnswerText}
                      placeholder="“Say what you truly feel…”"
                      placeholderTextColor="#9c948a"
                      className="flex-1 text-foreground"
                      multiline
                    />

                    <Pressable
                      onPress={handleSubmit}
                      disabled={!myAnswerText.trim()}
                      className={`w-9 h-9 rounded-full items-center justify-center ${
                        myAnswerText.trim() ? "bg-primary/20" : "bg-secondary"
                      }`}
                      style={({ pressed }) => [
                        { transform: [{ scale: pressed ? 0.96 : 1 }] },
                      ]}
                    >
                      <Send size={16} color="#bc8f97" />
                    </Pressable>
                  </View>
                </View>
              )}

              {bothAnswered && (
                <Text className="text-center text-xs text-mutedForeground">
                  Today’s ritual is complete ✨
                </Text>
              )}

              {/* Action Row */}
              {!bothAnswered && (
                <View className="flex-row gap-3 mt-1">
                  <Pressable
                    onPress={() => setShowCategories((v) => !v)}
                    className="flex-1 bg-secondary border border-border rounded-xl py-3 items-center justify-center shadow-sm"
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}
                  >
                    <Text className="text-xs text-secondaryForeground">
                      {cat?.emoji} Change vibe
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      await Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      );
                      onChangeQuestion();
                    }}
                    disabled={partnerAnswered}
                    className={`flex-1 rounded-xl py-3 items-center flex-row justify-center gap-2 ${
                      partnerAnswered
                        ? "bg-muted opacity-50"
                        : "bg-primary/15 border border-primary/20"
                    }`}
                    style={({ pressed }) => [
                      { transform: [{ scale: pressed ? 0.97 : 1 }] },
                    ]}
                  >
                    <RefreshCw size={14} color="#bc8f97" />
                    <Text className="text-xs text-primary">New question</Text>
                  </Pressable>
                </View>
              )}
            </AnimatedRe.View>
          )}
        </LinearGradient>
      </AnimatedRe.View>
    </KeyboardAvoidingView>
  );
};

export default DailyQuestionCard;
