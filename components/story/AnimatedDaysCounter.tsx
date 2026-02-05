import { PairDocument } from "@/types/type";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

const daysSince = (date?: string | null) => {
  if (!date) return 0;
  const start = new Date(date).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / 86400000));
};

const AnimatedDaysCounter = ({ pair }: { pair: PairDocument }) => {
  const target = daysSince(pair.pairFormedAt);
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 900;

    const tick = (t: number) => {
      if (!start) start = t;

      const progress = Math.min((t - start) / duration, 1);
      const value = Math.floor(progress * target);
      setCount(value);

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [target]);

  return (
    <View className="items-center my-8">
      <Text className="text-xs text-mutedForeground mb-2">
        Time inside this space
      </Text>

      <Text className="text-6xl font-bold text-primary">{count}</Text>

      <Text className="text-mutedForeground mt-2">days together here</Text>
    </View>
  );
};

export default AnimatedDaysCounter;
