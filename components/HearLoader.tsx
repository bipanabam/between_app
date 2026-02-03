import { Heart } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function HeartLoader() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{ transform: [{ scale }] }}
      className="h-12 w-12 rounded-full items-center justify-center bg-primary/10"
    >
      <Heart size={20} color="#bc8f97" fill="#bc8f97" />
    </Animated.View>
  );
}
