import { PairStats } from "@/types/type";
import { Text, View } from "react-native";

const ConversationStory = ({ stats }: { stats: PairStats }) => {
  if (!stats) return null;

  return (
    <View className="bg-card rounded-3xl p-6 shadow-sm mb-5">
      <Text className="text-xs text-mutedForeground mb-2">Chapter 1</Text>

      <Text className="text-lg font-semibold">
        You’ve been talking a lot 💬
      </Text>

      <Text className="text-3xl font-bold text-primary mt-2">
        {stats.messagesCount}
      </Text>

      <Text className="text-mutedForeground mt-1">messages shared here</Text>
    </View>
  );
};

export default ConversationStory;
