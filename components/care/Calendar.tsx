// import React from "react";
// import { Text, View } from "react-native";
// import { Calendar } from "react-native-calendars";

// const CareCalendar = () => {
//   return (
//     <View className="px-5">
//       <Calendar
//         // Hide default arrows
//         renderArrow={(direction) => null}
//         hideExtraDays={true}
//         theme={{
//           backgroundColor: "transparent",
//           calendarBackground: "transparent",
//           textSectionTitleColor: "#8a8075",
//           selectedDayBackgroundColor: "transparent",
//           dayTextColor: "#38332e",
//           todayTextColor: "#bc8f97",
//           textDisabledColor: "#d9d2ca",
//           monthTextColor: "#38332e",
//           textMonthFontWeight: "500",
//           textMonthFontSize: 18,
//           textDayFontSize: 15,
//           textDayHeaderFontSize: 13,
//           dotColor: "#f3c6cd",
//           selectedDotColor: "#bc8f97",
//         }}
//         markedDates={{
//           "2026-02-10": {
//             customStyles: {
//               container: { backgroundColor: "#f9ebec", borderRadius: 100 },
//               text: { color: "#bc8f97", fontWeight: "bold" },
//             },
//           },
//         }}
//         markingType={"custom"}
//       />

//       <Text className="text-center text-xs text-mutedForeground/50 mt-4">
//         Days that hold meaning between you
//       </Text>
//     </View>
//   );
// };

// export default CareCalendar;

import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CareCalendar = () => {
  const [selected, setSelected] = useState(14);

  const fakeDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <View className="flex-1 px-5 pt-4">
      {/* Month Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity>
          <ChevronLeft size={20} />
        </TouchableOpacity>

        <Text className="text-lg font-semibold">February 2026</Text>

        <TouchableOpacity>
          <ChevronRight size={20} />
        </TouchableOpacity>
      </View>

      {/* Week Row */}
      <View className="flex-row justify-between mb-3">
        {days.map((d) => (
          <Text
            key={d}
            className="text-xs text-mutedForeground w-9 text-center"
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap">
        {fakeDays.map((day) => {
          const isSelected = day === selected;
          const hasReminder = day % 5 === 0;
          const isCareWindow = day >= 18 && day <= 22;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelected(day)}
              className="w-9 h-10 items-center justify-center mb-2"
            >
              <View
                className={`
                  w-9 h-9 rounded-full items-center justify-center
                  ${isSelected ? "bg-primary" : ""}
                  ${isCareWindow && !isSelected ? "bg-rose-100" : ""}
                `}
              >
                <Text
                  className={`text-sm
                    ${isSelected ? "text-white font-semibold" : "text-foreground"}
                  `}
                >
                  {day}
                </Text>
              </View>

              {hasReminder && (
                <View className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Panel */}
      <View className="mt-6 rounded-2xl bg-card border border-border p-4">
        <Text className="font-semibold mb-1">Feb {selected}</Text>

        <Text className="text-sm text-mutedForeground">
          • Care reminder scheduled • Gentle support window
        </Text>
      </View>
    </View>
  );
};

export default CareCalendar;
