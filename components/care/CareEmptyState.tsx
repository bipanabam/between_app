import { Heart, Sparkles } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  onCreateFirst: () => void;
}

const CareEmptyState = ({ onCreateFirst }: Props) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Pulsing Heart */}
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ loop: true, type: "timing", duration: 4000 }}
        className="w-24 h-24 rounded-full bg-primary/50 flex items-center justify-center mb-6"
      >
        <Heart size={32} color="#bc8f97" />
      </MotiView>

      {/* Sparkles */}
      <MotiView
        from={{ rotate: "0deg", scale: 1 }}
        animate={{
          rotate: ["0deg", "15deg", "-15deg", "0deg"],
          scale: [1, 1.1, 1],
        }}
        transition={{ loop: true, type: "timing", duration: 3000, delay: 500 }}
        className="absolute -top-4 -right-4"
      >
        <Sparkles size={20} color="#fbb6ce" />
      </MotiView>

      <Text className="text-gray-700 font-medium text-base mb-1">
        No care moments yet
      </Text>
      <Text className="text-gray-400 text-sm text-center mb-4">
        Plant small acts of care — gentle reminders, memory dates, and rituals
        that nurture your connection.
      </Text>

      <TouchableOpacity
        onPress={onCreateFirst}
        className="bg-pink-200 px-6 py-3 rounded-xl"
      >
        <Text className="text-white text-sm">Plant your first care moment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CareEmptyState;
