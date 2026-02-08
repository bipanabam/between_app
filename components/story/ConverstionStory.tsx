import { PairStats } from "@/types/type";
import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

const ConversationStory = ({ stats }: { stats: PairStats }) => {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!stats) return null;

  return (
    <Animated.View
      style={{ opacity: fade }}
      className="bg-card rounded-3xl p-6 shadow-md mb-5"
    >
      <Text className="text-xs text-mutedForeground mb-2">
        Chapter — Conversations
      </Text>

      <Text className="text-lg font-semibold">
        You kept the connection alive 💬
      </Text>

      <Text className="text-3xl font-bold text-primary mt-2">
        {stats.messagesCount}
      </Text>

      <Text className="text-mutedForeground mt-1">messages shared here</Text>
    </Animated.View>
  );
};

export default ConversationStory;
