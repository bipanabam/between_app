import { MomentsDocument, ReminderDocument } from "@/types/type";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { X } from "lucide-react-native";
import React, { useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import MomentCard from "./MomentCard";
import ReminderCard from "./ReminderCard";

interface Props {
  selectedDate: dayjs.Dayjs | null;
  reminders: ReminderDocument[];
  moments: MomentsDocument[];
  onClose: () => void;

  onEditMoment?: (moment: MomentsDocument) => void;
  onDeleteMoment?: (id: string) => void;

  onEditReminder?: (reminder: ReminderDocument) => void;
  onDeleteReminder?: (id: string) => void;
}

const CalendarReminderSheet = ({
  selectedDate,
  reminders,
  moments,
  onClose,
  onEditMoment,
  onDeleteMoment,
  onEditReminder,
  onDeleteReminder,
}: Props) => {
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

  const dayMoments = useMemo(() => {
    if (!selectedDate) return [];

    return moments.filter(
      (m) => m.momentDate && dayjs(m.momentDate).isSame(selectedDate, "day"),
    );
  }, [selectedDate, moments]);

  const combinedData = useMemo(() => {
    const items = [
      ...dayMoments.map((m) => ({
        type: "moment" as const,
        id: `moment-${m.$id}`,
        date: m.momentDate,
        data: m,
      })),
      ...dayReminders.map((r) => ({
        type: "reminder" as const,
        id: `reminder-${r.$id}`,
        date: r.nextTriggerAt,
        data: r,
      })),
    ];

    return items.sort(
      (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    );
  }, [dayMoments, dayReminders]);

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
      <BottomSheetFlatList
        data={combinedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 95 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-semibold text-foreground/80">
              {selectedDate.format("dddd, MMMM D")}
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color="#999" />
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => {
          if (item.type === "moment") {
            return (
              <MomentCard
                moment={item.data}
                index={index}
                onEdit={(m) => {
                  onClose();
                  onEditMoment?.(m);
                }}
                onDelete={(id) => {
                  onClose();
                  onDeleteMoment?.(id);
                }}
              />
            );
          }

          return (
            <ReminderCard
              reminder={item.data}
              index={index}
              onEdit={(r) => {
                onClose();
                onEditReminder?.(r);
              }}
              onDelete={(id) => {
                onClose();
                onDeleteReminder?.(id);
              }}
            />
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-mutedForeground/40 text-xs italic py-8">
            A quiet day — nothing planned yet
          </Text>
        }
      />
    </BottomSheet>
  );
};

export default CalendarReminderSheet;
