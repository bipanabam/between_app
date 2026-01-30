import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const PasscodeDot = ({ filled }: { filled: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: filled ? 1.2 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [filled]);

  return (
    <Animated.View
      style={{ transform: [{ scale }] }}
      className={`w-3.5 h-3.5 mx-2 rounded-full ${
        filled ? "bg-primary" : "bg-muted"
      }`}
    />
  );
};

export default PasscodeDot;