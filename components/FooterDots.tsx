import React from "react";
import { View } from "react-native";

type Props = {
  steps: string[];
  current: string;
};

const FooterDots = ({ steps, current }: Props) => {
  const index = steps.indexOf(current);

  return (
    <View className="flex-row justify-center pb-12">
      {steps.map((_, i) => {
        const active = i === index;

        return (
          <View
            key={i}
            className={`h-2 mx-1 rounded-full ${
              active ? "bg-primary w-7" : "bg-muted w-3"
            }`}
          />
        );
      })}
    </View>
  );
};

export default FooterDots;
