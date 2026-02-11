import { notifyLabel, recurrenceLabel, typeConfig } from "@/lib/reminderConfig";
import { ReminderDocument } from "@/types/type";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  reminder: ReminderDocument;
  index: number;
  onDismiss?: (id: string) => void;
  onEdit?: (reminder: ReminderDocument) => void;
}

const SWIPE_THRESHOLD = 120;

const ReminderCard = ({ reminder, index, onDismiss, onEdit }: Props) => {
  const config = typeConfig[reminder.type];
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
        onPress={() => onEdit?.(reminder)}
        onLongPress={() => onDismiss?.(reminder.$id)}
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

              {/* Title + Subtitle */}
              <View className="flex-1">
                <Text className="text-foreground/90 font-medium text-base leading-snug">
                  {reminder.title}
                </Text>

                <Text className="text-mutedForeground/45 text-sm italic mt-0.5">
                  {reminder.note || "A gentle care moment"}
                </Text>
              </View>

              {/* Private Lock */}
              {reminder.private && (
                <Lock size={14} color="#9CA3AF" strokeWidth={1.5} />
              )}
            </View>

            {/* Chips row */}
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              <View className="px-2.5 py-1 rounded-full bg-accent/70">
                <Text className="text-sm text-primary/90 font-light">
                  {reminder.nextTriggerAt
                    ? new Date(reminder.nextTriggerAt).toDateString()
                    : "Scheduled"}
                </Text>
              </View>

              {/* Recurrence */}
              <View className="px-2.5 py-1 rounded-full bg-accent/50">
                <Text className="text-sm text-mutedForeground/90 font-light">
                  {recurrenceLabel[reminder.scheduleType]}
                </Text>
              </View>

              <View className="px-2.5 py-1 rounded-full bg-accent/50">
                <Text className="text-sm text-mutedForeground/90 font-light">
                  {
                    notifyLabel[
                      reminder.notifySelf && reminder.notifyPartner
                        ? "both"
                        : reminder.notifyPartner
                          ? "partner"
                          : "me"
                    ]
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
};

export default ReminderCard;
