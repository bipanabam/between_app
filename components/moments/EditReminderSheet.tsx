import { updateReminder } from "@/lib/appwrite";
import {
    emotionalLabels,
    notifyOptions,
    NotifyType,
    recurrenceOptions,
    RecurrenceType,
    ReminderType,
    typeOptions,
} from "@/lib/reminderConfig";
import { showError, showSuccess } from "@/lib/toast";
import { ReminderDocument } from "@/types/type";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { Lock, Unlock, X } from "lucide-react-native";
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
  reminder: ReminderDocument | null;
  onClose: () => void;
  onUpdated: (reminder: ReminderDocument) => void;
}

const EditReminderSheet = ({ isOpen, reminder, onClose, onUpdated }: Props) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["88%"], []);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<ReminderType>("nudge");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("once");
  const [notify, setNotify] = useState<NotifyType>("both");
  const [isPrivate, setIsPrivate] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const [baseDate, setBaseDate] = useState(new Date());
  const [baseTime, setBaseTime] = useState(new Date());

  const [weekday, setWeekday] = useState<number>(dayjs().day());
  const [monthDay, setMonthDay] = useState<number>(dayjs().date());

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [isOpen]);

  // Hydrate from existing reminder
  useEffect(() => {
    if (!reminder) return;

    setTitle(reminder.title);
    setNote(reminder?.note ?? "");
    setType(reminder.type);
    setRecurrence(reminder.scheduleType);
    setIsPrivate(reminder.private);

    const notifyType: NotifyType =
      reminder.notifySelf && reminder.notifyPartner
        ? "both"
        : reminder.notifyPartner
          ? "partner"
          : "me";

    setNotify(notifyType);

    const next = dayjs(reminder.nextTriggerAt);
    setBaseDate(next.toDate());
    setBaseTime(next.toDate());

    if (reminder.recurrenceRule) {
      const parsed = JSON.parse(reminder.recurrenceRule);
      if (parsed.weekday !== undefined) setWeekday(parsed.weekday);
      if (parsed.dayOfMonth !== undefined) setMonthDay(parsed.dayOfMonth);
    }
  }, [reminder]);

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

  const previewTrigger = computeNextTrigger();

  const handleUpdate = async () => {
    if (!reminder) return;
    if (!title.trim()) return;

    const nextTriggerAt = computeNextTrigger();
    if (!nextTriggerAt) return;

    try {
      setSaving(true);

      const updated = await updateReminder(reminder.$id, {
        title: title.trim(),
        note,

        type,
        scheduleType: recurrence,

        nextTriggerAt,

        weekday,
        monthDay,
        baseTime,

        notify,
        isPrivate,
      });

      onUpdated(updated);

      showSuccess(
        "Reminder updated",
        dayjs(updated.nextTriggerAt).format("MMM D • h:mm A"),
      );
    } catch (e) {
      console.log(e);
      showError("Update failed", "Please try again");
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
      backgroundStyle={{ borderRadius: 28, backgroundColor: "#f5f5f5" }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-medium text-foreground/80">
            Edit reminder
          </Text>
          <TouchableOpacity onPress={onClose}>
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

        {/* Note */}
        <TextInput
          placeholder="A little note to your future self…(optional)"
          value={note}
          onChangeText={setNote}
          multiline
          textAlignVertical="top"
          className="bg-card rounded-xl px-4 py-3.5 mb-6 text-foreground border border-primary/30 h-20"
          placeholderTextColor="#aaa"
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
          {previewTrigger
            ? `Next reminder: ${dayjs(previewTrigger).format("MMM D • h:mm A")}`
            : ""}
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

        <Pressable
          onPress={handleUpdate}
          disabled={!title.trim()}
          className="bg-primary rounded-full items-center py-4"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-medium">Save changes</Text>
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

export default EditReminderSheet;
