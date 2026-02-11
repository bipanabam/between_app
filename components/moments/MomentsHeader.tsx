import { MotiView } from "moti";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  activeTab: "moments" | "calendar";
  onChange: (tab: "moments" | "calendar") => void;
};
const MomentsHeader = ({ activeTab, onChange }: Props) => {
  return (
    <View className="px-6  mt-6 pb-3 bg-card">
      <Text className="text-center text-mutedForeground/60 mb-5 italic">
        Moments that keep your bond warm
      </Text>

      <View className="bg-muted rounded-full p-1 flex-row">
        {["moments", "calendar"].map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onChange(tab as any)}
              className="flex-1"
            >
              <MotiView
                animate={{ backgroundColor: active ? "#fff" : "transparent" }}
                transition={{ type: "timing", duration: 250 }}
                className="py-2 rounded-full"
              >
                <Text
                  className={`text-center capitalize ${
                    active ? "text-primary" : "text-mutedForeground"
                  }`}
                >
                  {tab}
                </Text>
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MomentsHeader;
