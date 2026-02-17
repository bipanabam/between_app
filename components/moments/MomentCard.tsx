import { MomentsDocument } from "@/types/type";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Edit,
  Flag,
  Heart,
  Lock,
  Star,
  Trash,
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";

interface Moment {
  id: string;
  title: string;
  note?: string;
  type: "memory" | "date-night" | "anniversary" | "milestone";
  date: string;
  hasReminder?: boolean;
  private?: boolean;
}
interface Props {
  moment: MomentsDocument;
  index: number;
  onPress?: (moment: MomentsDocument) => void;
  onLongPress?: (momentId: string) => void;
  onEdit?: (moment: MomentsDocument) => void;
  onDelete?: (momentId: string) => void;
}

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
    icon: Flag,
    pastel: "#E8DAFF",
    iconColor: "#7C3AED",
    gradient: ["#E8DAFF", "#C9B3FF"],
  },
};

const MomentCard = ({
  moment,
  index,
  onPress,
  onLongPress,
  onEdit,
  onDelete,
}: Props) => {
  const config = typeConfig[moment.type];
  const Icon = config.icon;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        delay: index * 60,
        type: "timing",
        duration: 420,
      }}
    >
      <Pressable
        onPress={() => onPress?.(moment)}
        onLongPress={() => onLongPress?.(moment.$id)}
        delayLongPress={300}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        <View className="bg-white/90 rounded-2xl overflow-hidden shadow-sm">
          {/* Gradient Accent */}
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 4, width: "100%" }}
          />

          <View className="p-4 space-y-2">
            {/* Icon */}
            <View className="flex-row items-start gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: config.pastel }}
              >
                <Icon size={18} color={config.iconColor} strokeWidth={1.8} />
              </View>

              {/* Title & Note */}
              <View className="flex-1">
                <Text className="text-foreground/90 font-medium text-base leading-snug">
                  {moment.title}
                </Text>
                <Text className="text-mutedForeground/45 text-sm italic mt-0.5">
                  {moment.note || "A special moment"}
                </Text>
              </View>

              {/* Private Lock */}
              {moment.isPrivate && (
                <Lock size={14} color="#9CA3AF" strokeWidth={1.5} />
              )}
            </View>

            {/* Chips row */}
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {/* Date */}
              <View className="px-2.5 py-1 rounded-full bg-accent/70">
                <Text className="text-sm text-primary/90 font-light">
                  {new Date(moment.momentDate).toDateString()}
                </Text>
              </View>

              {/* Type */}
              <View className="px-2.5 py-1 rounded-full bg-accent/50">
                <Text className="text-sm text-mutedForeground/90 font-light capitalize">
                  {moment.type.replace("-", " ")}
                </Text>
              </View>

              {/* Reminder Badge */}
              {moment.hasReminder && (
                <View className="px-2.5 py-1 rounded-full bg-accent/50">
                  <Text className="text-sm text-mutedForeground/90 font-light">
                    🔔 Reminder
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View className="absolute top-3 right-3 flex-row gap-4">
            <TouchableOpacity onPress={() => onEdit?.(moment)}>
              <Edit size={15} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Delete moment",
                  "Are you sure you want to delete this moment?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => onDelete?.(moment.$id),
                    },
                  ],
                )
              }
            >
              <Trash size={15} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
};

export default MomentCard;
