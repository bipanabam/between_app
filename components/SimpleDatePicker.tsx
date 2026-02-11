import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
  label?: string;
};

const SimpleDatePicker = ({
  value,
  onChange,
  maxDate = new Date(),
  minDate,
  label = "Select date",
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate quick select last 60 days
  const dateOptions = Array.from({ length: 60 }, (_, i) => {
    const date = dayjs().subtract(i, "day").toDate();
    return {
      date,
      label: dayjs(date).format("MMM D"),
      isToday: i === 0,
    };
  }).filter((opt) => {
    if (minDate && dayjs(opt.date).isBefore(minDate, "day")) return false;
    if (maxDate && dayjs(opt.date).isAfter(maxDate, "day")) return false;
    return true;
  });

  const changeDate = (days: number) => {
    const newDate = dayjs(value).add(days, "day").toDate();
    if (maxDate && dayjs(newDate).isAfter(maxDate, "day")) return;
    if (minDate && dayjs(newDate).isBefore(minDate, "day")) return;
    onChange(newDate);
  };

  const isAtMaxDate = maxDate && dayjs(value).isSame(maxDate, "day");
  const isAtMinDate = minDate && dayjs(value).isSame(minDate, "day");

  if (!isExpanded) {
    return (
      <TouchableOpacity
        onPress={() => setIsExpanded(true)}
        className="bg-white rounded-2xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text className="text-gray-700" style={{ fontSize: 15 }}>
          {dayjs(value).format("MMM D, YYYY")}
        </Text>
        <ChevronRight size={18} color="#bc8f97" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4">
      {/* Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => changeDate(-1)}
          className="p-2 bg-primary/50 rounded-full"
          disabled={isAtMinDate}
        >
          <ChevronLeft size={20} color={isAtMinDate ? "#d1d5db" : "#fff"} />
        </TouchableOpacity>

        <Text className="text-gray-700 font-medium" style={{ fontSize: 16 }}>
          {dayjs(value).format("MMMM D, YYYY")}
        </Text>

        <TouchableOpacity
          onPress={() => changeDate(1)}
          className="p-2 bg-primary/50 rounded-full"
          disabled={isAtMaxDate}
        >
          <ChevronRight size={20} color={isAtMaxDate ? "#d1d5db" : "#fff"} />
        </TouchableOpacity>
      </View>

      {/* Quick select scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
      >
        <View className="flex-row gap-2">
          {dateOptions.slice(0, 15).map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onChange(opt.date)}
              className={`px-3 py-2 rounded-full ${
                dayjs(value).isSame(opt.date, "day")
                  ? "bg-primary/40"
                  : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs ${
                  dayjs(value).isSame(opt.date, "day")
                    ? "text-gray-700"
                    : "text-gray-500"
                }`}
              >
                {opt.isToday ? "Today" : opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Done button */}
      <TouchableOpacity
        onPress={() => setIsExpanded(false)}
        className="bg-primary rounded-full py-2 mt-2"
      >
        <Text
          className="text-white text-center font-medium"
          style={{ fontSize: 13 }}
        >
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SimpleDatePicker;
