import * as Haptics from "expo-haptics";
import { Delete } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

const NumPad = ({ onDigit, onDelete }: Props) => {
  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View className="flex-row flex-wrap justify-center w-full px-4 gap-3">
      {KEYS.map((v, i) => (
        <Pressable
          key={i}
          className="w-1/4 h-16 items-center justify-center rounded-full bg-muted"
          disabled={v === ""}
          onPress={() => {
            haptic();
            if (v === "delete") onDelete();
            else onDigit(v);
          }}
        >
          {v === "delete" ? (
            <Delete size={24} color="#5E5851" />
          ) : (
            <Text className="text-2xl text-foreground font-semibold">{v}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
};

export default NumPad;
