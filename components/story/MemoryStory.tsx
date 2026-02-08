import { PairStats } from "@/types/type";
import { Text, View } from "react-native";

const MemoryStory = ({ stats }: { stats: PairStats }) => {
  if (!stats) return null;

  return (
    <View className="bg-card rounded-3xl p-6 shadow-md mb-5">
      <Text className="text-xs text-mutedForeground mb-2">
        Chapter — Moments
      </Text>

      <Text className="text-lg font-semibold">Moments you kept 📸</Text>

      <Text className="text-3xl font-bold text-primary mt-2">
        {stats.photosCount}
      </Text>

      <Text className="text-mutedForeground mt-1">memories saved together</Text>
    </View>
  );
};

export default MemoryStory;
