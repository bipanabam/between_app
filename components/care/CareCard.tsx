import { Camera, Flame, Heart, Moon, Sparkles } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import { Text, View } from "react-native";

export type ReminderType =
  | "memory"
  | "nudge"
  | "ritual"
  | "date-night"
  | "custom"
  | "cycle";

export type RecurrenceType = "once" | "daily" | "weekly" | "monthly";

export type NotifyType = "me" | "partner" | "both";

export interface CareReminder {
  id: string;
  title: string;
  type: ReminderType;
  recurrence: RecurrenceType;
  notify: NotifyType;
  isPrivate: boolean;
  nextTrigger: string;
  emotionalLabel: string;
}

const typeIcons = {
  memory: Camera,
  nudge: Heart,
  ritual: Moon,
  custom: Sparkles,
  cycle: Heart,
  "date-night": Flame,
};

const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: "once", label: "One time" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];

interface Props {
  reminder: CareReminder;
  index: number;
}

// const pastel = {
//   memory: "bg-[#e8f1f5]", // Soft blue
//   nudge: "bg-[#f9ebec]", // Soft pink/red
//   ritual: "bg-[#f2eff9]", // Soft purple
//   custom: "bg-green-50",
//   "partner-care": "bg-partnerTwo/20",
// };

// const iconColors = {
//   memory: "#7ea4b6",
//   nudge: "#bc8f97",
//   ritual: "#9b8bb9",
//   custom: "#8a8075",
//   "partner-care": "#a3b8c2",
// };

const pastel = {
  memory: "bg-[#e8f1f5]",
  nudge: "bg-[#f9ebec]",
  ritual: "bg-[#f2eff9]",
  "date-night": "bg-[#fff1e6]",
  custom: "bg-green-50",
  cycle: "bg-rose-50",
};

const iconColors = {
  memory: "#7ea4b6",
  nudge: "#bc8f97",
  ritual: "#9b8bb9",
  "date-night": "#d19a66",
  custom: "#8a8075",
  cycle: "#c97b84",
};

const chip = "px-3 py-1 rounded-full bg-muted text-xs text-mutedForeground";

const CareCard = ({ reminder }: { reminder: CareReminder }) => {
  const [recurrence, setRecurrence] = useState<RecurrenceType>("once");
  const Icon = typeIcons[reminder.type];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="bg-white/60 rounded-3xl p-6 mb-5 border border-white/20"
    >
      <View className="flex-row items-center mb-3">
        <View
          className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${pastel[reminder.type]}`}
        >
          <Icon size={22} color={iconColors[reminder.type]} />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground/90 leading-tight">
            {reminder.title}
          </Text>
          <Text className="text-sm italic text-mutedForeground mt-1">
            {reminder.emotionalLabel}
          </Text>
        </View>
      </View>

      {/* Chips */}
      <View className="flex-row flex-wrap gap-2">
        <Text className={chip}>{reminder.nextTrigger}</Text>

        <Text className={chip}>
          {reminder.recurrence === "daily"
            ? "Every day"
            : reminder.recurrence === "weekly"
              ? "Every week"
              : reminder.recurrence === "monthly"
                ? "Every month"
                : "One time"}
        </Text>

        <Text className={chip}>
          {reminder.notify === "both"
            ? "Both of you"
            : reminder.notify === "partner"
              ? "Partner"
              : "Just you"}
        </Text>
      </View>
    </MotiView>
  );
};

export default CareCard;
