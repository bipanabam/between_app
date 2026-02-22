import { daysSince, formatDate } from "@/lib/date";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import TogetherSinceSheet from "./TogetherSinceSheet";

const TogetherSinceCard = ({ pair, meId, onPropose, onConfirm }: any) => {
  const [open, setOpen] = useState(false);

  const confirmed = pair?.relationshipStartDateConfirmed;
  const pending = pair?.relationshipStartDatePending;
  const today = new Date();
  const start = new Date(pair.relationshipStartDate);

  const isAnniversary =
    today.getMonth() === start.getMonth() &&
    today.getDate() === start.getDate();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15 }) }],
  }));

  const glow = useSharedValue(0);

  useEffect(() => {
    if (confirmed) {
      glow.value = withSpring(1);
    }
  }, [confirmed]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + glow.value * 0.4,
  }));

  return (
    <>
      <Animated.View
        style={[
          animatedStyle,
          {
            marginTop: 32,
            borderRadius: 24,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setOpen(true);
          }}
          onPressIn={() => (scale.value = 0.97)}
          onPressOut={() => (scale.value = 1)}
        >
          <LinearGradient
            colors={
              confirmed
                ? ["#ffffff", "rgba(188,143,151,0.10)"]
                : ["#ffffff", "#ffffff"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "#ded9d3",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View className="flex-row gap-3 items-center">
              <View className="bg-primary/20 p-3 rounded-xl">
                <Calendar size={18} color="#8a8075" />
              </View>

              <View>
                <Text className="text-mutedForeground text-sm">
                  Our story began
                </Text>
                <Text className="text-foreground font-medium">
                  {confirmed
                    ? formatDate(pair.relationshipStartDate)
                    : pending
                      ? `${formatDate(pair.relationshipStartDatePending)}`
                      : "Tap to set"}
                </Text>
              </View>
            </View>
            {pending && (
              <Text className="text-amber-500 text-xs mt-1">
                Waiting for your partner to confirm
              </Text>
            )}
            {confirmed && (
              <View className="flex-col items-center">
                <Text className="text-primary font-bold text-xl">
                  {daysSince(pair.relationshipStartDate)}
                </Text>
                <Text className="text-mutedForeground text-sm">days</Text>
              </View>
            )}
            {/* {pending && <StatusBadge label="Pending" />} */}
          </LinearGradient>
        </Pressable>

        <TogetherSinceSheet
          open={open}
          onClose={() => setOpen(false)}
          pair={pair}
          meId={meId}
          onPropose={onPropose}
          onConfirm={onConfirm}
        />
      </Animated.View>
    </>
  );
};

export default TogetherSinceCard;
