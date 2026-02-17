import { HandHeart, Heart, Leaf, Moon, Sparkles } from "lucide-react-native";

export type ReminderType = "nudge" | "ritual" | "custom" | "cycle";

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

export const emotionalLabels: Record<ReminderType, string> = {
  nudge: "A gentle reminder",
  ritual: "A repeating connection habit",
  custom: "Something meaningful you want to remember",
  cycle: "A gentle partner care window",
};

export const typeOptions: {
  value: ReminderType;
  label: string;
  subtitle: string;
  icon: any;
  defaultRecurrence: RecurrenceType;
}[] = [
  // {
  //   value: "memory",
  //   label: "Memory",
  //   subtitle: "A date that matters (e.g. Birthday, anniversary, special day)",
  //   icon: Calendar,
  //   defaultRecurrence: "monthly",
  // },
  {
    value: "nudge",
    label: "A nudge",
    subtitle: "A small caring reminder",
    icon: Heart,
    defaultRecurrence: "daily",
  },
  {
    value: "ritual",
    label: "Connection ritual",
    subtitle: "A repeating moment",
    icon: Moon,
    defaultRecurrence: "weekly",
  },
  {
    value: "custom",
    label: "Something else",
    subtitle: "Something personal",
    icon: Sparkles,
    defaultRecurrence: "once",
  },
];

export const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: "once", label: "One time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const notifyOptions: { value: NotifyType; label: string }[] = [
  { value: "me", label: "Just me" },
  { value: "partner", label: "Partner" },
  { value: "both", label: "Both of us" },
];
