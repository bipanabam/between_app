import { createReminder } from "@/lib/appwrite";
import {
  emotionalLabels,
  NotifyType,
  RecurrenceType,
  ReminderType,
} from "@/lib/reminderConfig";
import { showError, showSuccess } from "@/lib/toast";
import { ReminderDocument } from "@/types/type";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Heart, Lock, Moon, Sparkles, Unlock, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (reminder: ReminderDocument) => void;
}

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

const CreateReminderSheet = ({ isOpen, onClose, onCreate }: Props) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["84%"], []);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReminderType>("nudge");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("once");
  const [notify, setNotify] = useState<NotifyType>("both");
  const [isPrivate, setIsPrivate] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [baseTime, setBaseTime] = useState<Date>(new Date());

  const [weekday, setWeekday] = useState<number>(dayjs().day());
  const [monthDay, setMonthDay] = useState<number>(dayjs().date());

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [isOpen]);

  useEffect(() => {
    const def = typeOptions.find((t) => t.value === type)?.defaultRecurrence;
    if (def) setRecurrence(def);
  }, [type]);

  const computeNextTrigger = () => {
    const now = dayjs();
    const time = dayjs(baseTime);

    if (recurrence === "once") {
      return dayjs(baseDate)
        .hour(time.hour())
        .minute(time.minute())
        .toISOString();
    }

    if (recurrence === "daily") {
      let next = now.hour(time.hour()).minute(time.minute());
      if (next.isBefore(now)) next = next.add(1, "day");
      return next.toISOString();
    }

    if (recurrence === "weekly") {
      let next = now.day(weekday).hour(time.hour()).minute(time.minute());

      if (next.isBefore(now)) next = next.add(1, "week");
      return next.toISOString();
    }

    if (recurrence === "monthly") {
      let next = now.date(monthDay).hour(time.hour()).minute(time.minute());

      if (next.isBefore(now)) next = next.add(1, "month");
      return next.toISOString();
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    const nextTriggerAt = computeNextTrigger();
    if (!nextTriggerAt) return;

    try {
      setSaving(true);
      const doc = await createReminder({
        title: title.trim(),
        note: null,

        type,
        scheduleType: recurrence,

        nextTriggerAt,
        startAt: nextTriggerAt,

        weekday,
        monthDay,
        baseTime,

        notify,
        isPrivate,

        periodCycleId: null,
      });

      onCreate(doc);

      // reset
      setTitle("");
      setType("nudge");
      setRecurrence("once");
      setNotify("both");
      setIsPrivate(false);

      showSuccess(
        "Reminder saved",
        dayjs(doc.nextTriggerAt).format("MMM D • h:mm A"),
      );
    } catch (e) {
      console.log("Create reminder failed", e);
      showError("Could not save reminder", "Please try again");
    } finally {
      setSaving(false);
      onClose();
    }
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
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-medium text-foreground/80">
            Create a reminder
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <TextInput
          placeholder="What would u like to remember? (e.g. Birthday,anniversary,daily tea)"
          value={title}
          onChangeText={setTitle}
          className="bg-card rounded-full px-4 py-3.5 mb-6 text-foreground border border-primary/30 h-12"
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

        {/* Schedule */}
        <Text className="text-md text-mutedForeground mb-2 font-normal">
          When should this happen
        </Text>

        {/* ONCE */}
        {recurrence === "once" && (
          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setDatePickerOpen(true)}
              className="bg-card px-4 py-3 rounded-xl"
            >
              <Text className="text-sm text-foreground/80">
                📅 {dayjs(baseDate).format("MMM D, YYYY")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTimePickerOpen(true)}
              className="bg-card px-4 py-3 rounded-xl"
            >
              <Text className="text-sm text-foreground/80">
                ⏰ {dayjs(baseTime).format("h:mm A")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DAILY */}
        {recurrence === "daily" && (
          <TouchableOpacity
            onPress={() => setTimePickerOpen(true)}
            className="bg-card px-4 py-3 rounded-xl mb-6"
          >
            <Text className="text-sm text-foreground/80">
              Every day at {dayjs(baseTime).format("h:mm A")}
            </Text>
          </TouchableOpacity>
        )}

        {/* WEEKLY */}
        {recurrence === "weekly" && (
          <View className="gap-3 mb-6">
            <View className="flex-row flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                <Pressable
                  key={i}
                  onPress={() => setWeekday(i)}
                  className={`px-3 py-2 rounded-full ${
                    weekday === i ? "bg-primary/25" : "bg-accent/60"
                  }`}
                >
                  <Text className="text-sm">{d}</Text>
                </Pressable>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setTimePickerOpen(true)}
              className="bg-card px-4 py-3 rounded-xl"
            >
              <Text className="text-sm">
                ⏰ {dayjs(baseTime).format("h:mm A")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MONTHLY */}
        {recurrence === "monthly" && (
          <View className="gap-3 mb-6">
            <TextInput
              value={String(monthDay)}
              onChangeText={(t) => setMonthDay(Number(t))}
              keyboardType="number-pad"
              className="bg-card px-4 py-3 rounded-xl"
              placeholder="Day of month (1–31)"
            />

            <TouchableOpacity
              onPress={() => setTimePickerOpen(true)}
              className="bg-card px-4 py-3 rounded-xl"
            >
              <Text className="text-sm">
                ⏰ {dayjs(baseTime).format("h:mm A")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text className="text-xs text-mutedForeground/60 mb-6 italic">
          Next reminder: {dayjs(computeNextTrigger()).format("MMM D • h:mm A")}
        </Text>

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
          className={`bg-primary rounded-full items-center py-4 ${!title.trim() ? "opacity-50" : "opacity-100"}`}
        >
          {saving ? (
            <View className="flex-row gap-2 items-center">
              <Text className="text-white font-medium">Setting</Text>

              <ActivityIndicator color="white" />
            </View>
          ) : (
            <Text className="text-white font-medium">Set this reminder</Text>
          )}
        </Pressable>
        <DatePicker
          modal
          mode="date"
          open={datePickerOpen}
          date={baseDate}
          onConfirm={(d) => {
            setBaseDate(d);
            setDatePickerOpen(false);
          }}
          onCancel={() => setDatePickerOpen(false)}
        />

        <DatePicker
          modal
          mode="time"
          open={timePickerOpen}
          date={baseTime}
          onConfirm={(t) => {
            setBaseTime(t);
            setTimePickerOpen(false);
          }}
          onCancel={() => setTimePickerOpen(false)}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default CreateReminderSheet;
