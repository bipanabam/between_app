import { formatDate, isAnniversary } from "@/lib/date";
import { PairDocument } from "@/types/type";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import PulseHeart from "../PulseHeart";

const StoryHero = ({ pair }: { pair: PairDocument }) => {
  const start = pair.relationshipStartDate ?? pair.pairFormedAt;
  const glow = useRef(new Animated.Value(0)).current;
  const anniversary = isAnniversary(pair.relationshipStartDate);

  useEffect(() => {
    if (!anniversary) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [anniversary]);

  const bg = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f6edef", "#f0d7dc"],
  });

  const border = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e5c9cf", "#bc8f97"],
  });

  return (
    <Animated.View
      style={{
        backgroundColor: anniversary ? bg : "#f3f0ed",
        borderColor: anniversary ? border : "#e8e2dd",
        borderWidth: 1,
      }}
      className="rounded-3xl p-7 mt-6 items-center shadow-sm"
    >
      {anniversary && (
        <Text className="text-xs mb-2 text-amber-500 font-medium">
          ✨ Anniversary Day
        </Text>
      )}
      <View className="bg-primary/15 p-3 rounded-full mb-3">
        <PulseHeart active />
      </View>

      <Text className="text-xs text-mutedForeground text-center">
        Your story together began
      </Text>

      <Text className="text-2xl font-semibold mt-1 text-center">
        {start ? formatDate(start) : "Recently"}
      </Text>

      <Text className="text-mutedForeground mt-3 text-center leading-6">
        A quiet space for two — where your messages, moments, and memories grow
        without noise.
      </Text>

      <Text className="text-mutedForeground/60 text-center mt-3 text-xs italic">
        Still being written ✨
      </Text>
    </Animated.View>
  );
};

export default StoryHero;
