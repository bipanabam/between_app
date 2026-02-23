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
      className="bg-background rounded-3xl p-6 shadow-md border border-border"
    >
      <Text className="text-[11px] uppercase tracking-[2px] text-mutedForeground/60 mb-3">
        Chapter One: Everything starts with a text
      </Text>

      <Text className="text-xl font-semibold text-foreground leading-snug">
        You kept the connection alive
      </Text>

      <Text className="text-3xl font-bold text-primary mt-5 tracking-tight">
        {stats.messagesCount}
      </Text>

      <Text className="text-mutedForeground italic mt-1">
        messages shared here
      </Text>
    </Animated.View>
  );
};

export default ConversationStory;
