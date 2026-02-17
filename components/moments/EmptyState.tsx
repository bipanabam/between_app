import { Sparkles } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  onCreateFirst: () => void;
}

const EmptyState = ({ onCreateFirst }: Props) => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Pulsing Heart */}
      {/* <PulseHeart active /> */}

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

      <Text className="text-gray-700 font-medium text-base mb-1 text-center">
        You don’t have any reminders/moments yet
      </Text>
      <Text className="text-gray-400 text-sm text-center mb-4">
        Create small reminders, special dates, or rituals that bring you closer
        together.
      </Text>

      <TouchableOpacity
        onPress={onCreateFirst}
        className="bg-primary/80 px-6 py-3 rounded-xl"
      >
        <Text className="text-white text-sm text-center">
          Add your first care moment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyState;
