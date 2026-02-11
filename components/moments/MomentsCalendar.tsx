import { ReminderDocument } from "@/types/type";

import dayjs from "dayjs";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  HandHeart,
  Heart,
  Leaf,
  Moon,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const reminderIcons: Record<string, any> = {
  memory: Camera,
  nudge: Heart,
  ritual: Moon,
  custom: Leaf,
  cycle: HandHeart,
};

// Pastel colors for reminder dots
const reminderColors: Record<string, string> = {
  memory: "#93c5fd",
  nudge: "#fca5a5",
  ritual: "#c7d2fe",
  custom: "#86efac",
  cycle: "#fcd34d",
};

interface Props {
  reminders: ReminderDocument[];
  onDayPress: (day: dayjs.Dayjs) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MomentsCalendar = ({ reminders, onDayPress }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Group reminders by day
  const remindersByDay = useMemo(() => {
    const map: Record<string, ReminderDocument[]> = {};
    reminders.forEach((r) => {
      if (!r.nextTriggerAt) return;
      const key = dayjs(r.nextTriggerAt).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [reminders]);

  // Build calendar grid for current month
  const daysInMonth = useMemo(() => {
    const start = currentMonth.startOf("month").startOf("week");
    const end = currentMonth.endOf("month").endOf("week");
    const days: dayjs.Dayjs[] = [];
    let day = start;
    while (day.isBefore(end) || day.isSame(end)) {
      days.push(day);
      day = day.add(1, "day");
    }
    return days;
  }, [currentMonth]);

  return (
    <View className="flex-1 px-2 pt-4">
      {/* Month Header */}
      <View className="flex-row justify-between items-center mb-3 px-2">
        <TouchableOpacity
          onPress={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="px-3 py-1.5 rounded-full bg-accent/40"
        >
          <ChevronLeft size={18} />
        </TouchableOpacity>

        <Text className="text-base font-semibold tracking-wide">
          {currentMonth.format("MMMM YYYY")}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="px-3 py-1.5 rounded-full bg-accent/40"
        >
          <ChevronRight size={18} />
        </TouchableOpacity>
      </View>

      {/* Weekday Names */}
      <View className="flex-row mb-1">
        {WEEKDAYS.map((d, i) => (
          <View
            key={i}
            style={{ flexBasis: "14.28%", maxWidth: "14.28%" }}
            className="items-center py-1"
          >
            <Text className="text-xs text-mutedForeground font-medium">
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {daysInMonth.map((day, i) => {
          const dayKey = day.format("YYYY-MM-DD");
          const isCurrentMonth = day.month() === currentMonth.month();
          const isToday = day.isSame(dayjs(), "day");
          const isSelected = selectedDate?.isSame(day, "day");
          const dayReminders = remindersByDay[dayKey] || [];

          return (
            <TouchableOpacity
              key={dayKey}
              onPress={() => {
                if (dayReminders.length) onDayPress(day);
              }}
              activeOpacity={0.7}
              style={{ flexBasis: "14.28%", maxWidth: "14.28%" }}
              className={`
                aspect-square items-center justify-center rounded-2xl mb-1
                ${!isCurrentMonth ? "opacity-25" : ""}
              `}
            >
              <View
                className={`
                w-10 h-10 items-center justify-center rounded-xl
                ${isSelected ? "bg-primary/20 border border-primary/30" : ""}
                ${isToday && !isSelected ? "bg-accent/50" : ""}
              `}
              >
                <Text
                  className={`text-sm ${
                    isToday
                      ? "text-primary font-semibold"
                      : "text-foreground/80"
                  }`}
                >
                  {day.date()}
                </Text>
              </View>

              {/* Multi reminder dots */}
              {dayReminders.length > 0 &&
                (() => {
                  const firstType = dayReminders[0].type;
                  const Icon = reminderIcons[firstType];

                  return (
                    <>
                      {Icon && (
                        <Icon
                          size={12}
                          color={reminderColors[firstType]}
                          strokeWidth={2}
                        />
                      )}

                      {/* extra indicator */}
                      {dayReminders.length > 1 && (
                        <View
                          className="absolute bottom-0.5 right-1.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: "#999" }}
                        />
                      )}
                    </>
                  );
                })()}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Microcopy */}
      <Text className="text-center text-xs text-mutedForeground/50 mt-5 italic">
        Moments you’ve set aside for each other
      </Text>
    </View>
  );
};

export default MomentsCalendar;
