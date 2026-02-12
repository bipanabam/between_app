import FloatingActionMenu, {
  FloatingActionItem,
} from "@/components/FloatingActionMenu";
import CalendarReminderSheet from "@/components/moments/CalenderReminderSheet";
import CreateMomentSheet from "@/components/moments/CreateMomentSheet";
import CreateReminderSheet from "@/components/moments/CreateReminderSheet";
import CycleCard from "@/components/moments/CycleCard";
import CycleSetupSheet from "@/components/moments/CycleSetupSheet";
import EmptyState from "@/components/moments/EmptyState";
import MomentsCalendar from "@/components/moments/MomentsCalendar";
import MomentsHeader from "@/components/moments/MomentsHeader";
import ReminderCard from "@/components/moments/ReminderCard";

import {
  createCycleReminderRows,
  deleteCycleReminders,
  getCurrentMonthReminders,
  upsertPeriodCycle,
} from "@/lib/appwrite";

import { CycleConfig, ReminderDocument } from "@/types/type";
import dayjs from "dayjs";

import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Moments = () => {
  const [tab, setTab] = useState<"moments" | "calendar">("moments");
  const [reminders, setReminders] = useState<ReminderDocument[]>([]);

  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<dayjs.Dayjs | null>(null);

  const [cycleEnabled, setCycleEnabled] = useState(false);
  const [cycleSaving, setCycleSaving] = useState(false);

  const [isCycleSheetOpen, setIsCycleSheetOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMomentSheetOpen, setMomentSheetOpen] = useState(false);

  // Open sheet automatically if no reminders
  // useEffect(() => {
  //   if (tab === "moments" && reminders?.length === 0) {
  //     setIsSheetOpen(true);
  //   }
  // }, [tab, reminders?.length]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await getCurrentMonthReminders();
        console.log(data);

        setReminders(data);
      } catch (err) {
        console.log("Failed to fetch reminders", err);
      }
    };

    fetchReminders();
  }, []);

  const handleCreate = (newReminder: ReminderDocument) => {
    console.log(newReminder);
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleCycleSave = async (config: CycleConfig) => {
    try {
      setCycleSaving(true);

      const cycleDoc = await upsertPeriodCycle({
        avgCycleLength: config.avgCycleLength,
        lastStartDate: config.lastStartDate!,
        reminderOffsets: config.offsets,
        isEnabled: config.isEnabled,
      });

      setCycleEnabled(config.isEnabled);
      setIsCycleSheetOpen(false);
      // setCycleSaving(false); // stop spinner early

      // background work — don't block UI
      if (config.isEnabled) {
        await deleteCycleReminders(cycleDoc.$id);
        await createCycleReminderRows(cycleDoc.$id, config).catch(
          console.error,
        );
      } else {
        await deleteCycleReminders(cycleDoc.$id);
      }
    } catch (e) {
      console.log("Cycle save failed", e);
    } finally {
      setCycleSaving(false);
    }
  };

  const actionItems: FloatingActionItem[] = [
    {
      label: "Add moment",
      onPress: () => setMomentSheetOpen(true),
    },
    {
      label: "Add reminder",
      onPress: () => setIsSheetOpen(true),
    },
    {
      label: "Period care",
      onPress: () => setIsCycleSheetOpen(true),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-card">
      <View className="flex-1">
        <MomentsHeader activeTab={tab} onChange={setTab} />

        {tab === "moments" ? (
          <>
            {reminders?.length === 0 ? (
              <EmptyState onCreateFirst={() => setIsSheetOpen(true)} />
            ) : (
              <>
                <FlatList
                  data={reminders}
                  keyExtractor={(i) => i.$id}
                  contentContainerStyle={{
                    paddingTop: 10,
                    paddingBottom: 100,
                  }}
                  ItemSeparatorComponent={() => <View className="h-3" />}
                  ListHeaderComponent={
                    <CycleCard
                      enabled={cycleEnabled}
                      nextWindowLabel="Next care window in 3 days"
                      onPress={() => setIsCycleSheetOpen(true)}
                    />
                  }
                  renderItem={({ item, index }) => (
                    <View className="px-5">
                      <ReminderCard reminder={item} index={index} />
                    </View>
                  )}
                />
              </>
            )}
          </>
        ) : (
          <FlatList
            data={[{ id: "calendar" }]}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 40,
            }}
            ListHeaderComponent={
              <CycleCard
                enabled={cycleEnabled}
                nextWindowLabel="Next care window in 3 days"
                onPress={() => setIsCycleSheetOpen(true)}
              />
            }
            renderItem={() => (
              <MomentsCalendar
                reminders={reminders}
                onDayPress={setSelectedCalendarDate}
              />
            )}
          />
        )}
        {/* Floating Action Menu */}
        <FloatingActionMenu
          items={actionItems}
          bottom={110}
          right={24}
          fabStyle={{ backgroundColor: "#bc8f97" }}
        />
      </View>
      {/* Sheets */}
      <CreateReminderSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onCreate={handleCreate}
      />

      <CycleSetupSheet
        isOpen={isCycleSheetOpen}
        onClose={() => setIsCycleSheetOpen(false)}
        onSave={handleCycleSave}
        saving={cycleSaving}
      />

      <CreateMomentSheet
        isOpen={isMomentSheetOpen}
        onClose={() => setMomentSheetOpen(false)}
        onSaved={(m) => console.log("moment created")}
      />

      <CalendarReminderSheet
        selectedDate={selectedCalendarDate}
        reminders={reminders}
        onClose={() => setSelectedCalendarDate(null)}
      />
    </SafeAreaView>
  );
};

export default Moments;
