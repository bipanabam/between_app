import { Text, View } from "react-native";
import ThinkingOfYouButton from "./ThinkingOfYouButton";

type Props = {
  onSend: () => void;
  isSending: boolean;
  sentToday: boolean;
  streak: number;
};

const LoveRitualPanel = ({ onSend, isSending, sentToday, streak }: Props) => {
  return (
    <View
      className="bg-white rounded-2xl p-4 mt-4 shadow-sm"
      style={{
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <ThinkingOfYouButton onPress={onSend} isSending={isSending} />

      <View className="flex-row justify-center gap-4 mt-4">
        {sentToday && (
          <View className="px-3 py-1 rounded-full bg-primary/10">
            <Text className="text-primary text-xs">💌 Love sent today</Text>
          </View>
        )}

        {streak > 0 && (
          <View className="px-3 py-1 rounded-full bg-orange-100">
            <Text className="text-orange-500 text-xs">
              🔥 {streak} day care streak
            </Text>
          </View>
        )}
      </View>

      <Text className="text-center text-mutedForeground/50 text-xs mt-3">
        Tiny signals. Real warmth.
      </Text>
    </View>
  );
};

export default LoveRitualPanel;
