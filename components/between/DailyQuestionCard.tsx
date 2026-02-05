import StatusBadge from "@/components/StatusBadge";
import { QuestionCategory } from "@/constant/questions";
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

  const chevron = useSharedValue(0);

  const reveal = useSharedValue(0);
  useEffect(() => {
    if (bothAnswered) {
      reveal.value = withTiming(1, { duration: 450 });
    }
  }, [bothAnswered]);
  const revealStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ scale: 0.96 + reveal.value * 0.04 }],
  }));

  const glow = useSharedValue(0);
  useEffect(() => {
    if (bothAnswered) {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900 }),
          withTiming(0, { duration: 900 }),
        ),
        2, // pulses twice
        false,
      );
    }
  }, [bothAnswered]);
  const glowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glow.value, [0, 1], [0.15, 0.45]);
    const scale = interpolate(glow.value, [0, 1], [1, 1.02]);

    return {
      shadowColor: "#bc8f97",
      shadowOpacity,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      transform: [{ scale }],
    };
  });

  const toggleExpand = () => {
    setExpanded((v) => !v);
    chevron.value = withTiming(expanded ? 0 : 1, { duration: 220 });
  };

  const handleSubmit = () => {
    if (!myAnswerText.trim()) return;
    onSubmitAnswer(myAnswerText.trim());
    setMyAnswerText("");
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${chevron.value * 180}deg`,
      },
    ],
  }));

  const cat = categories.find((c) => c.id === currentCategory);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <AnimatedRe.View
        layout={Layout.springify()}
        className="bg-background rounded-3xl overflow-hidden mt-6 shadow-sm"
      >
        {/* Header */}
        <Pressable
          onPress={toggleExpand}
          className="p-5 flex-row items-center justify-between"
        >
          <View className="flex-row gap-3 flex-1 items-center">
            <View className="bg-primary/15 w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-base">💭</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-mutedForeground">
                    Today’s question
                  </Text>

                  <Text className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-mutedForeground">
                    {cat?.emoji}
                  </Text>
                </View>
                <View className="mr-2">
                  {bothAnswered && <StatusBadge label="💞 answered" />}
                </View>
              </View>

              <Text
                numberOfLines={expanded ? 3 : 1}
                className="text-foreground font-medium pr-2"
              >
                {question}
              </Text>
            </View>
          </View>

          <AnimatedRe.View style={chevronStyle}>
            <ChevronDown size={18} color="#8a8075" />
          </AnimatedRe.View>
        </Pressable>

        {/* Expanded */}
        {expanded && (
          <AnimatedRe.View
            entering={FadeIn.duration(450).withInitialValues({
              transform: [{ scale: 0.9 }],
            })}
            exiting={FadeOut}
            layout={Layout.springify()}
            className="px-5 pb-5 gap-4"
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
                      onCategoryChange(c.id);
                      setShowCategories(false);
                    }}
                    className={`px-3 py-2 rounded-full ${
                      currentCategory === c.id ? "bg-primary/20" : "bg-muted"
                    }`}
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
              <AnimatedRe.View
                layout={Layout.springify()}
                className="min-h-[56px] rounded-2xl overflow-hidden border border-primary/20"
              >
                {/* Locked state */}
                {!bothAnswered && (
                  <View className="bg-partnerOne/20 p-4">
                    <Text className="text-xs text-mutedForeground mb-1">
                      {partnerName} said:
                    </Text>

                    {/* fake placeholder instead of real answer */}
                    <View className="h-5 rounded-xl bg-muted/60 justify-center items-center">
                      <Text className="text-xs text-mutedForeground">
                        🔒 Answer to reveal
                      </Text>
                    </View>
                  </View>
                )}

                {/* Revealed state */}
                {bothAnswered && (
                  <AnimatedRe.View style={glowStyle}>
                    <AnimatedRe.View
                      entering={FadeIn.duration(450)}
                      layout={Layout.springify()}
                      className="bg-partnerOne/20 border border-primary/30 rounded-2xl p-4"
                    >
                      <Text className="text-xs text-mutedForeground mb-1">
                        {partnerName} said:
                      </Text>

                      <Text className="italic text-foreground">
                        “{partnerAnswer}”
                      </Text>
                    </AnimatedRe.View>
                  </AnimatedRe.View>
                )}
              </AnimatedRe.View>
            )}

            {/* My Answer */}
            {iAnswered && (
              <AnimatedRe.View
                layout={Layout.springify()}
                className="bg-partnerTwo/20 border border-border rounded-2xl p-4"
              >
                <Text className="text-xs text-mutedForeground mb-1">
                  You answered:
                </Text>
                <Text className="italic text-foreground">“{myAnswer}”</Text>
              </AnimatedRe.View>
            )}

            {/*Input */}
            {!bothAnswered && !iAnswered && (
              <AnimatedRe.View
                layout={Layout.springify()}
                className="bg-partnerTwo/20 rounded-2xl p-4"
              >
                <Text className="text-xs text-mutedForeground mb-2">
                  Your turn
                </Text>

                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={myAnswerText}
                    onChangeText={setMyAnswerText}
                    placeholder="Share your answer…"
                    placeholderTextColor="#9c948a"
                    className="flex-1 text-foreground"
                    multiline
                  />

                  {myAnswerText.trim().length > 0 && (
                    <Pressable
                      onPress={handleSubmit}
                      className="bg-primary/20 w-9 h-9 rounded-full items-center justify-center"
                    >
                      <Send size={16} color="#bc8f97" />
                    </Pressable>
                  )}
                </View>
              </AnimatedRe.View>
            )}
            {bothAnswered && (
              <AnimatedRe.View entering={FadeIn} className="items-center mt-2">
                <Text className="text-xs text-mutedForeground">
                  🔒 Today’s question is complete
                </Text>
              </AnimatedRe.View>
            )}

            {/* Action Row */}
            {!bothAnswered && (
              <AnimatedRe.View
                layout={Layout.springify()}
                className="flex-row gap-3"
              >
                <Pressable
                  onPress={() => setShowCategories((v) => !v)}
                  className="flex-1 bg-muted rounded-xl py-3 items-center"
                >
                  <Text className="text-xs text-mutedForeground">
                    {cat?.emoji} Change vibe
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onChangeQuestion}
                  className="flex-1 bg-muted rounded-xl py-3 items-center flex-row justify-center gap-2"
                >
                  <RefreshCw size={14} color="#8a8075" />
                  <Text className="text-xs text-mutedForeground">
                    New question
                  </Text>
                </Pressable>
              </AnimatedRe.View>
            )}
          </AnimatedRe.View>
        )}
      </AnimatedRe.View>
    </KeyboardAvoidingView>
  );
};

export default DailyQuestionCard;
