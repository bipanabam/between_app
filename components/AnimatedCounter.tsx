import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  value: number;
  duration?: number;
  className?: string;
};

const AnimatedCounter = ({ value, duration = 900, className }: Props) => {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    progress.value = 0; // reset first
    progress.value = withTiming(value, { duration });
  }, [value, duration]);

  useAnimatedReaction(
    () => Math.floor(progress.value),
    (v, prev) => {
      if (v !== prev) {
        runOnJS(setDisplay)(v);
      }
    },
  );

  return <Text className={className}>{display}</Text>;
};

export default AnimatedCounter;
