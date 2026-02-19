import { MomentsDocument } from "@/types/type";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Flag, Heart, Lock, Star, X } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type MomentType =
  | "memory"
  | "date-night"
  | "anniversary"
  | "milestone"
  | "trip"
  | "relationship-start";

const typeConfig: Record<
  MomentType,
  {
    icon: any;
    pastel: string;
    iconColor: string;
    gradient: [string, string];
  }
> = {
  memory: {
    icon: Camera,
    pastel: "#DCEEFF",
    iconColor: "#3B82F6",
    gradient: ["#DCEEFF", "#A0C4FF"],
  },
  "date-night": {
    icon: Heart,
    pastel: "#FFE0E6",
    iconColor: "#EF476F",
    gradient: ["#FFE0E6", "#FFB3C6"],
  },
  anniversary: {
    icon: Star,
    pastel: "#FFF3CC",
    iconColor: "#FFC300",
    gradient: ["#FFF3CC", "#FFD966"],
  },
  milestone: {
    icon: Flag,
    pastel: "#E8DAFF",
    iconColor: "#7C3AED",
    gradient: ["#E8DAFF", "#C9B3FF"],
  },
  trip: {
    icon: Flag,
    pastel: "#E8DAFF",
    iconColor: "#7C3AED",
    gradient: ["#E8DAFF", "#C9B3FF"],
  },
  "relationship-start": {
    icon: Heart,
    pastel: "#FFE0E6",
    iconColor: "#EF476F",
    gradient: ["#FFE0E6", "#FFB3C6"],
  },
};

interface Props {
  moment: MomentsDocument;
  index: number;
  scrollY?: Animated.Value;
  onPress?: (moment: MomentsDocument) => void;
}

const MemoryCard = ({ moment, index, scrollY, onPress }: Props) => {
  const config = typeConfig[moment.type as MomentType] ?? typeConfig.memory;
  const Icon = config.icon;
  const hasMedia = !!moment.mediaUrl;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          delay: index * 80,
          type: "timing",
          duration: 500,
        }}
      >
        <Pressable
          onPress={() => onPress?.(moment)}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
          className="mb-12"
        >
          <LinearGradient
            colors={[config.gradient[0], config.gradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-3xl shadow-sm"
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            {/* Media */}
            {hasMedia && (
              <Pressable onPress={() => setPreviewOpen(true)}>
                <View style={{ overflow: "hidden" }}>
                  <Animated.Image
                    source={{ uri: moment.mediaUrl! }}
                    style={{
                      width: "100%",
                      height: 320, // slightly larger for parallax crop
                      transform: [
                        {
                          translateY: scrollY
                            ? scrollY.interpolate({
                                inputRange: [-200, 0, 400],
                                outputRange: [-40, 0, 60],
                                extrapolate: "clamp",
                              })
                            : 0,
                        },
                      ],
                    }}
                    resizeMode="cover"
                  />

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.65)"]}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 140,
                      justifyContent: "flex-end",
                      padding: 20,
                    }}
                  >
                    <Text className="text-white text-xl font-semibold">
                      {moment.title}
                    </Text>

                    {moment.note && (
                      <Text className="text-white/80 mt-1 text-sm">
                        {moment.note}
                      </Text>
                    )}
                  </LinearGradient>
                </View>
              </Pressable>
            )}

            {/* Content */}
            <View className="p-5">
              {!hasMedia && (
                <>
                  <Text className="text-lg font-semibold text-foreground">
                    {moment.title}
                  </Text>

                  {moment.note && (
                    <Text className="text-mutedForeground mt-1 leading-5">
                      {moment.note}
                    </Text>
                  )}
                </>
              )}

              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <Icon
                      size={16}
                      color={config.iconColor}
                      strokeWidth={1.8}
                    />
                  </View>

                  <Text className="text-xs text-mutedForeground/80 capitalize">
                    {moment.type.replace("-", " ")}
                  </Text>
                </View>

                <Text className="text-xs text-mutedForeground/80">
                  {new Date(moment.momentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>

              {moment.isPrivate && (
                <View className="absolute top-4 right-4">
                  <Lock size={14} color="#9CA3AF" strokeWidth={1.5} />
                </View>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      </MotiView>
      {/* Fullscreen image preview */}
      <Modal
        visible={previewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewOpen(false)}
      >
        <View className="flex-1 bg-black/95 items-center justify-center">
          <TouchableOpacity
            className="absolute top-16 right-6 z-10"
            onPress={() => setPreviewOpen(false)}
          >
            <X size={30} color="white" />
          </TouchableOpacity>

          <Image
            source={{ uri: moment.mediaUrl! }}
            style={{
              width: "95%",
              height: "75%",
            }}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
};

export default MemoryCard;
