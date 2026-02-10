import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  Calendar,
  Flame,
  Heart,
  Lock,
  Moon,
  Sparkles,
  Unlock,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type {
  CareReminder,
  NotifyType,
  RecurrenceType,
  ReminderType,
} from "./CareCard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (reminder: CareReminder) => void;
}

// const typeOptions: { value: ReminderType; icon: any; label: string }[] = [
//   { value: "memory", icon: Calendar, label: "Memory" },
//   { value: "nudge", icon: Heart, label: "Caring nudge" },
//   { value: "ritual", icon: Flame, label: "Ritual" },
//   { value: "partner-care", icon: CandlestickChart, label: "Partner care" },
//   { value: "custom", icon: Leaf, label: "Custom" },
// ];

export const typeOptions: {
  value: ReminderType;
  label: string;
  subtitle: string;
  icon: any;
  defaultRecurrence: RecurrenceType;
}[] = [
  {
    value: "memory",
    label: "Memory date",
    subtitle: "Birthday, anniversary, special day",
    icon: Calendar,
    defaultRecurrence: "monthly",
  },
  {
    value: "nudge",
    label: "Care nudge",
    subtitle: "Small loving reminder",
    icon: Heart,
    defaultRecurrence: "daily",
  },
  {
    value: "ritual",
    label: "Connection ritual",
    subtitle: "A repeating moment together",
    icon: Moon,
    defaultRecurrence: "weekly",
  },
  {
    value: "date-night",
    label: "Date night",
    subtitle: "Time just for you two",
    icon: Flame,
    defaultRecurrence: "weekly",
  },
  {
    value: "custom",
    label: "Something else",
    subtitle: "Your own kind of care",
    icon: Sparkles,
    defaultRecurrence: "once",
  },
];

const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: "once", label: "One time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const notifyOptions: { value: NotifyType; label: string }[] = [
  { value: "me", label: "Just me" },
  { value: "partner", label: "Partner" },
  { value: "both", label: "Both of us" },
];

const emotionalLabels: Record<ReminderType, string> = {
  memory: "A day that matters to you both",
  nudge: "A gentle reminder to show care",
  ritual: "A repeating moment of connection",
  "date-night": "Time set aside for each other",
  custom: "A reminder you created",
  cycle: "A gentle care window",
};

const CreateReminderSheet = ({ isOpen, onClose, onCreate }: Props) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["84%"], []);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReminderType>("nudge");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("once");
  const [notify, setNotify] = useState<NotifyType>("both");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (isOpen) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [isOpen]);

  const handleCreate = () => {
    if (!title.trim()) return;

    onCreate({
      id: Date.now().toString(),
      title: title.trim(),
      type,
      recurrence,
      notify,
      isPrivate,
      nextTrigger:
        recurrence === "daily"
          ? "Tomorrow"
          : recurrence === "weekly"
            ? "Next week"
            : recurrence === "monthly"
              ? "Next month"
              : "Scheduled",
      emotionalLabel: emotionalLabels[type],
    });

    // Reset
    setTitle("");
    setType("nudge");
    setRecurrence("once");
    setNotify("both");
    setIsPrivate(false);

    onClose();
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.3} />
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "#d4c4c7", width: 48 }}
      backgroundStyle={{ borderRadius: 28, backgroundColor: "#f5f5f5" }}
      enableDynamicSizing={false}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-medium text-foreground/80">
            New care moment
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <TextInput
          placeholder="What would you like to remember?"
          value={title}
          onChangeText={setTitle}
          className="bg-card rounded-full px-4 py-3.5 mb-6 text-foreground border border-primary/30 h-14"
          placeholderTextColor="#aaa"
          style={{
            fontSize: 15,
            fontWeight: "400",
          }}
        />

        {/* Type */}
        <Text className="text-md text-mutedForeground mb-2 font-normal">
          Kind of care
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-2">
          {typeOptions.map((opt) => {
            const active = type === opt.value;
            const Icon = opt.icon;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setType(opt.value)}
                className={`flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full ${
                  active ? "bg-primary/25" : "bg-accent/60"
                }`}
              >
                <Icon size={15} color={active ? "#bc8f97" : "#999"} />
                <Text
                  className={`text-sm ${active ? "text-foreground" : "text-mutedForeground/50"}`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="text-xs italic text-mutedForeground/50 mb-6">
          {emotionalLabels[type]}
        </Text>

        {/* Recurrence */}
        <Text className="text-md text-mutedForeground mb-2 font-normal">
          How often
        </Text>
        <View className="flex-row gap-2 mb-6">
          {recurrenceOptions.map((opt) => {
            const active = recurrence === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setRecurrence(opt.value)}
                className={`flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full ${active ? "bg-primary/25" : "bg-accent/60"}`}
              >
                <Text
                  className={`text-sm ${active ? "text-foreground" : "text-mutedForeground/50"}`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Notify */}
        <Text className="text-md text-mutedForeground mb-2 font-normal">
          Gently remind
        </Text>
        <View className="flex-row gap-2 mb-6">
          {notifyOptions.map((opt) => {
            const active = notify === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setNotify(opt.value)}
                className={`flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full ${active ? "bg-primary/25" : "bg-accent/60"}`}
              >
                <Text
                  className={`text-sm ${active ? "text-foreground" : "text-mutedForeground/50"}`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Privacy */}
        <TouchableOpacity
          onPress={() => setIsPrivate(!isPrivate)}
          className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3.5 mb-6"
        >
          <View className="flex-row items-center gap-2.5">
            {isPrivate ? (
              <Lock size={16} color="#bc8f97" />
            ) : (
              <Unlock size={16} color="#aaa" />
            )}
            <Text className="text-sm text-foreground/70">
              {isPrivate
                ? "Private — only you can see this"
                : "Shared — visible to both"}
            </Text>
          </View>
          <View
            className={`w-11 h-6 rounded-full justify-center ${
              isPrivate ? "bg-primary/30" : "bg-muted"
            }`}
            style={{
              paddingHorizontal: 2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: isPrivate ? "flex-end" : "flex-start",
            }}
          >
            <View className="w-5 h-5 bg-white rounded-full shadow-sm" />
          </View>
        </TouchableOpacity>

        {/* Create */}
        <Pressable
          onPress={handleCreate}
          disabled={!title.trim()}
          className={`bg-primary rounded-full py-4 ${!title.trim() ? "opacity-50" : "opacity-100"}`}
        >
          <Text className="text-white text-center font-medium text-base">
            Set this care moment
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheetModal>
  );
};

export default CreateReminderSheet;
