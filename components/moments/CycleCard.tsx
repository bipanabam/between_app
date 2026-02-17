import dayjs from "dayjs";
import { HandHeart } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  cycle?: {
    avgCycleLength: number;
    lastStartDate: string;
    isEnabled: boolean;
  };
  onPress: () => void;
};

const CycleCard = ({ cycle, onPress }: Props) => {
  const nextStart = cycle
    ? dayjs(cycle.lastStartDate).add(cycle.avgCycleLength, "day")
    : null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="mx-5 mb-4 rounded-3xl p-5 bg-rose-50 border border-rose-100"
    >
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-rose-100 items-center justify-center mr-3">
          <HandHeart size={20} color="#c97b84" />
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            Period care
          </Text>

          <Text className="text-sm text-mutedForeground mt-1">
            {cycle && cycle.isEnabled
              ? `Next care days start on ${nextStart?.format("MMM D")}`
              : "Track and support your partner’s cycle with gentle care"}
          </Text>
        </View>
      </View>

      {!cycle?.isEnabled && (
        <TouchableOpacity
          onPress={onPress}
          className="bg-white/80 rounded-xl px-4 py-3"
        >
          <Text className="text-sm text-center font-medium text-foreground">
            Enable cycle care
          </Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
};

export default CycleCard;
