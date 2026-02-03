import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";

const RotatingMicrocopy = ({ lines }: { lines: string[] }) => {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(6)).current;

  const animateIn = () => {
    fade.setValue(0);
    translate.setValue(6);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateIn();

    const id = setInterval(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: -6,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((i) => (i + 1) % lines.length);
      });
    }, 3200);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    animateIn();
  }, [index]);

  return (
    <View className="items-center pt-3 mt-6">
      <Animated.Text
        style={{
          opacity: fade,
          transform: [{ translateY: translate }],
        }}
        className="text-mutedForeground/40 text-xs font-light text-center"
      >
        {lines[index]}
      </Animated.Text>
    </View>
  );
};

export default RotatingMicrocopy;
