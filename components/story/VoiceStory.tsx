// components/story/VoiceStory.tsx
import { PairStats } from "@/types/type";
import { Text, View } from "react-native";

const VoiceStory = ({ stats }: { stats: PairStats }) => {
  if (!stats) return null;

  return (
    <View className="bg-background rounded-3xl p-6 shadow-md border border-border">
      <Text className="text-[11px] uppercase tracking-[2px] text-mutedForeground/60 mb-3">
        Chapter Three: From moments to voices
      </Text>
      <Text className="text-xl font-semibold text-foreground leading-snug">
        You let each other be heard
      </Text>

      <Text className="text-3xl font-bold text-primary mt-5 tracking-tight">
        {stats.voiceCount}
      </Text>

      <Text className="text-mutedForeground italic mt-1">
        voice notes exchanged
      </Text>
    </View>
  );
};

export default VoiceStory;
