import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export const getPresenceLabel = (last?: string) => {
  if (!last) return "";

  const diff = Date.now() - new Date(last).getTime();

  if (diff < 3 * 60 * 1000) return "Here with you";
  if (diff < 15 * 60 * 1000) return "Recently here";
  if (diff < 24 * 60 * 60 * 1000) return "Visited today";

  return "";
};

const PartnerCard = ({
  name,
  online,
  emoji,
  mood,
  color,
  lastActiveAt,
}: any) => {
  // soft pulse animation when online
  const pulse = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!online) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [online]);

  useEffect(() => {
    if (!online) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [online]);

  return (
    <View className="items-center">
      <Animated.View
        style={{
          transform: [{ scale: online ? pulse : 1 }],
          borderColor: online ? color + "55" : color + "22",
          backgroundColor: color + "11",
        }}
        className="w-24 h-24 rounded-full items-center justify-center"
      >
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{
            borderWidth: 2,
            borderColor: online ? color + "55" : color + "22",
            backgroundColor: color + "11",
          }}
        >
          <Text style={{ fontSize: 30 }}>{emoji}</Text>

          {/* 💞 soft presence badge */}
          {/* <View className="absolute bottom-1 right-1">
            <Text style={{ fontSize: 16 }}>{online ? "💓" : "🌙"}</Text>
          </View> */}

          {/* soft dot (fallback / glow) */}
          <Animated.View
            style={{ opacity: online ? dotOpacity : 0.7 }}
            className={`absolute bottom-2 right-2 w-3 h-3 rounded-full border border-white ${
              online ? "bg-emerald-300" : "bg-gray-300"
            }`}
          />
        </View>
      </Animated.View>

      <Text className="mt-4 font-medium text-foreground">{name}</Text>
      <Text style={{ fontSize: 20 }}>{mood}</Text>

      {/* emotional presence label */}
      <Text
        className={`text-sm mt-1 ${
          online ? "text-primary/70" : "text-mutedForeground/60"
        }`}
      >
        {getPresenceLabel(lastActiveAt)}
      </Text>
    </View>
  );
};

export default PartnerCard;
