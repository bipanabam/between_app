// components/story/VoiceStory.tsx
import { PairStats } from "@/types/type";
import { Text, View } from "react-native";

const VoiceStory = ({ stats }: { stats: PairStats }) => {
  if (!stats) return null;

  return (
    <View className="bg-card rounded-3xl p-6 shadow-sm mb-5">
      <Text className="text-xs text-mutedForeground mb-2">Chapter 3</Text>

      <Text className="text-lg font-semibold">You heard each other 🎧</Text>

      <Text className="text-3xl font-bold text-primary mt-2">
        {stats.voiceCount}
      </Text>

      <Text className="text-mutedForeground mt-1">voice notes exchanged</Text>
    </View>
  );
};

export default VoiceStory;
