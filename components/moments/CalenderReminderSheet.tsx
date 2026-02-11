import { ReminderDocument } from "@/types/type";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { X } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import ReminderCard from "./ReminderCard";

interface Props {
  selectedDate: dayjs.Dayjs | null;
  reminders: ReminderDocument[];
  onClose: () => void;
}

const CalendarReminderSheet = ({ selectedDate, reminders, onClose }: Props) => {
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["50%"], []);

  const dayReminders = useMemo(() => {
    if (!selectedDate) return [];
    return reminders.filter((r) =>
      r.nextTriggerAt
        ? dayjs(r.nextTriggerAt).isSame(selectedDate, "day")
        : false,
    );
  }, [selectedDate, reminders]);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.3} />
  );

  if (!selectedDate) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#d4c4c7", width: 48 }}
      backgroundStyle={{ borderRadius: 28, backgroundColor: "#f5f5f5" }}
      enablePanDownToClose
      enableDynamicSizing={false}
    >
      <View className="px-5 pb-10">
        {/* Header */}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm font-semibold text-foreground/80">
            {selectedDate.format("dddd, MMMM D")}
          </Text>
          <Pressable onPress={onClose}>
            <X size={20} color="#999" />
          </Pressable>
        </View>

        {/* Content */}
        {dayReminders.length ? (
          <FlatList
            data={dayReminders}
            keyExtractor={(i) => i.$id}
            renderItem={({ item, index }) => (
              <ReminderCard reminder={item} index={index} />
            )}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text className="text-center text-mutedForeground/40 text-xs italic py-8">
            A quiet day — no moments planned
          </Text>
        )}
      </View>
    </BottomSheet>
  );
};

export default CalendarReminderSheet;
