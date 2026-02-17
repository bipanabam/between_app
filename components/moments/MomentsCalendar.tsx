import { getAllMoments, getAllReminders } from "@/lib/appwrite";
import { MomentsDocument, ReminderDocument } from "@/types/type";

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
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  onDayPress: (day: dayjs.Dayjs) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MomentsCalendar = ({ onDayPress }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const [monthReminders, setMonthReminders] = useState<ReminderDocument[]>([]);
  const [monthMoments, setMonthMoments] = useState<MomentsDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMonthData = async (month: dayjs.Dayjs) => {
    try {
      setLoading(true);

      const start = month.startOf("month").startOf("week").toDate();
      const end = month.endOf("month").endOf("week").toDate();

      const [rem, mom] = await Promise.all([
        getAllReminders({ from: start, to: end }),
        getAllMoments({ from: start, to: end }),
      ]);

      setMonthReminders(rem);
      setMonthMoments(mom);
    } catch (e) {
      console.error("Month fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const lastFetchedMonth = useRef<string | null>(null);

  useEffect(() => {
    const key = currentMonth.format("YYYY-MM");

    if (lastFetchedMonth.current === key) return;

    lastFetchedMonth.current = key;
    fetchMonthData(currentMonth);
  }, [currentMonth]);

  // Group reminders by day
  const remindersByDay = useMemo(() => {
    const map: Record<string, ReminderDocument[]> = {};
    monthReminders.forEach((r) => {
      if (!r.nextTriggerAt) return;
      const key = dayjs(r.nextTriggerAt).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [monthReminders]);

  const momentsByDay = useMemo(() => {
    const map: Record<string, MomentsDocument[]> = {};

    monthMoments.forEach((m) => {
      if (!m.momentDate) return;

      const key = dayjs(m.momentDate).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });

    return map;
  }, [monthMoments]);

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

  // if (loading) {
  //   return (
  //     <View className="flex-1 items-center justify-center">
  //       <ActivityIndicator color="#bc8f97" />
  //     </View>
  //   );
  // }

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
          const dayMoments = momentsByDay[dayKey] || [];

          return (
            <TouchableOpacity
              key={dayKey}
              onPress={() => {
                if (dayReminders.length || dayMoments.length) {
                  setSelectedDate(day);
                  onDayPress(day);
                }
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
                ${isSelected ? "bg-primary/20 border border-primary/40" : ""}
                ${isToday && !isSelected ? "border border-primary/30" : ""}
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
              {/* {dayReminders.length > 0 &&
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
                      )} */}

              {/* extra indicator */}
              {/* {dayReminders.length > 1 && (
                        <View
                          className="absolute bottom-0.5 right-1.5 w-1 h-1 rounded-full"
                          style={{ backgroundColor: "#999" }}
                        />
                      )}
                    </>
                  );
                })()} */}
              <View className="absolute bottom-1 flex-row items-center space-x-1">
                {/* Reminder dot */}
                {dayReminders.length > 0 && (
                  <View
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        reminderColors[dayReminders[0].type] || "#ccc",
                    }}
                  />
                )}

                {/* Moment icon */}
                {dayMoments.length > 0 && (
                  <Camera size={12} color="#f9a8d4" strokeWidth={2} />
                )}
              </View>
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
