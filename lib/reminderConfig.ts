import {
  Calendar,
  Flame,
  HandHeart,
  Heart,
  Leaf,
  Moon,
} from "lucide-react-native";

export type ReminderType =
  | "memory"
  | "nudge"
  | "ritual"
  | "date-night"
  | "custom"
  | "cycle";

export type RecurrenceType = "once" | "daily" | "weekly" | "monthly";

export type NotifyType = "me" | "partner" | "both";

// Config for icons, pastel colors, gradients, labels
export const typeConfig: Record<
  ReminderType,
  {
    icon: any;
    pastel: string;
    label: string;
    iconColor: string;
    gradient: [string, string];
  }
> = {
  memory: {
    icon: Calendar,
    label: "Memory",
    pastel: "#e8f1f5",
    iconColor: "#7ea4b6",
    gradient: ["#e8f1f5", "#d0e4f0"],
  },

  nudge: {
    icon: Heart,
    label: "Caring nudge",
    pastel: "#f9ebec",
    iconColor: "#bc8f97",
    gradient: ["#f9ebec", "#f4d6d8"],
  },

  ritual: {
    icon: Moon,
    label: "Ritual",
    pastel: "#f2eff9",
    iconColor: "#9b8bb9",
    gradient: ["#f2eff9", "#e6e1f5"],
  },

  "date-night": {
    icon: Flame,
    label: "Date night",
    pastel: "#fff1e6",
    iconColor: "#d19a66",
    gradient: ["#fff1e6", "#ffe6d8"],
  },

  custom: {
    icon: Leaf,
    label: "Custom",
    pastel: "#e6f3e6",
    iconColor: "#8a8075",
    gradient: ["#e6f3e6", "#d6ebd6"],
  },

  cycle: {
    icon: HandHeart,
    label: "Partner care",
    pastel: "#fbe6d6",
    iconColor: "#a36f50",
    gradient: ["#fbe6d6", "#f5d9c8"],
  },
};

// Recurrence and notify labels
export const recurrenceLabel: Record<RecurrenceType, string> = {
  once: "One time",
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
};

export const notifyLabel: Record<NotifyType, string> = {
  me: "Just you",
  partner: "Your partner",
  both: "Both of you",
};
