import { PairStats } from "@/types/type";
import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

const GrowthSentence = ({ stats }: { stats: PairStats }) => {
  if (!stats) return null;

  let sentence = "";
  let sub = "";

  if (stats.messagesCount > 1000) {
    sentence = "You two never really run out of things to say.";
    sub = "Your connection keeps finding new words.";
  } else if (stats.messagesCount > 300) {
    sentence = "You’ve been building something steady.";
    sub = "Consistency is its own kind of love.";
  } else if (stats.messagesCount > 80) {
    sentence = "Your story is warming up.";
    sub = "Small talks turn into deep roots.";
  } else {
    sentence = "Every story starts with a few words.";
    sub = "You’re at the beautiful beginning.";
  }

  return (
    <View className="bg-card rounded-3xl p-6 mt-6 shadow-md border border-border">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-3">
        <View className="bg-primary/15 p-2 rounded-xl">
          <Sparkles size={16} color="#bc8f97" />
        </View>

        <Text className="text-xs text-mutedForeground font-medium">
          What this says about you two
        </Text>
      </View>

      {/* Main sentence */}
      <Text className="text-xl font-semibold leading-relaxed text-foreground">
        {sentence}
      </Text>

      {/* Sub line */}
      <Text className="text-mutedForeground mt-2 leading-5">{sub}</Text>
    </View>
  );
};

export default GrowthSentence;
