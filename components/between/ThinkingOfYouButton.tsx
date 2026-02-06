import { Heart } from "lucide-react-native";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

type Props = {
  onPress: () => void;
  isSending?: boolean;
};

const ThinkingOfYouButton = ({ onPress, isSending = false }: Props) => {
  const glow = useSharedValue(0);
  const heartBeat = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  // background pulse
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 1800 }),
      ),
      -1,
      false,
    );
  }, []);

  // sending heartbeat
  useEffect(() => {
    if (isSending) {
      heartBeat.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      );

      shimmer.value = withRepeat(withTiming(1, { duration: 1800 }), -1, false);
    } else {
      heartBeat.value = withTiming(0);
      shimmer.value = withTiming(-1);
    }
  }, [isSending]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.75, 1]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.03]) }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(heartBeat.value, [0, 1], [1, 1.25]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmer.value, [-1, 1], [-200, 300]) },
    ],
    opacity: isSending ? 0.35 : 0,
  }));

  return (
    <Pressable disabled={isSending} onPress={onPress} className="mt-8">
      <Animated.View
        style={glowStyle}
        className={`rounded-2xl overflow-hidden ${
          isSending ? "bg-primary" : "bg-primary/90"
        }`}
      >
        {/* shimmer sweep */}
        <Animated.View
          style={shimmerStyle}
          className="absolute top-0 bottom-0 w-24 bg-white/30"
        />

        <View className="flex-row items-center justify-center gap-3 py-5">
          <Animated.View style={heartStyle}>
            <Heart
              size={18}
              color="white"
              fill={isSending ? "white" : "none"}
            />
          </Animated.View>

          <Text className="text-white text-lg font-medium">
            {isSending ? "Sending love…" : "Thinking of you"}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ThinkingOfYouButton;
