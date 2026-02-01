import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

type Props = {
  me?: { avatar?: string };
  partner?: { avatar?: string };
};

const PairConnectionAnimation = ({ me, partner }: Props) => {
  const leftAnim = useRef(new Animated.Value(-80)).current;
  const rightAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!me || !partner) return;

    Animated.parallel([
      Animated.timing(leftAnim, {
        toValue: 0,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(rightAnim, {
        toValue: 0,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [me, partner]);

  //   useEffect(() => {
  //     const pulse = (anim: Animated.Value, delay: number) =>
  //       Animated.loop(
  //         Animated.sequence([
  //           Animated.delay(delay),
  //           Animated.timing(anim, {
  //             toValue: 1,
  //             duration: 400,
  //             useNativeDriver: true,
  //           }),
  //           Animated.timing(anim, {
  //             toValue: 0.3,
  //             duration: 400,
  //             useNativeDriver: true,
  //           }),
  //         ]),
  //       ).start();

  //     pulse(dot1, 0);
  //     pulse(dot2, 150);
  //     pulse(dot3, 300);
  //   }, []);

  useEffect(() => {
    if (!me || !partner) return;

    const pulse = (anim: Animated.Value) =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.6,
          duration: 350,
          useNativeDriver: true,
        }),
      ]);

    Animated.stagger(140, [pulse(dot1), pulse(dot2), pulse(dot3)]).start();
  }, [me, partner]);

  if (!me || !partner) {
    return null;
  }

  return (
    <View className="mt-11 flex-row items-center justify-center">
      {/* Left — Me */}
      <Animated.View
        style={{
          transform: [{ translateX: leftAnim }],
          opacity: opacityAnim,
        }}
      >
        {me?.avatar ? (
          <Image
            source={{ uri: me.avatar }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Text>👤</Text>
          </View>
        )}
      </Animated.View>

      {/* Center Dots */}
      <View className="mx-5 flex-row items-center">
        <Animated.View
          style={{ opacity: dot1 }}
          className="w-2 h-2 rounded-full bg-[#bc8f97] mx-1"
        />
        <Animated.View
          style={{ opacity: dot2 }}
          className="w-2 h-2 rounded-full bg-[#bc8f97] mx-1"
        />
        <Animated.View
          style={{ opacity: dot3 }}
          className="w-2 h-2 rounded-full bg-[#bc8f97] mx-1"
        />
      </View>

      {/* Right — Partner */}
      <Animated.View
        style={{
          transform: [{ translateX: rightAnim }],
          opacity: opacityAnim,
        }}
      >
        {partner?.avatar ? (
          <Image
            source={{ uri: partner.avatar }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Text>👤</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default PairConnectionAnimation;
