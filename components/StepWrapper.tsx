import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const StepWrapper = ({ children, stepKey }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(12);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [stepKey]);

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className="w-full"
    >
      {children}
    </Animated.View>
  );
};

export default StepWrapper;
