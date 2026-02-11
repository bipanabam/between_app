import CareCalendar from "@/components/care/Calendar";
import CareCard, { CareReminder } from "@/components/care/CareCard";
import CareEmptyState from "@/components/care/CareEmptyState";
import CareHeader from "@/components/care/CareHeader";
import CreateReminderSheet from "@/components/care/CreateReminderSheet";
import CycleCard from "@/components/care/CycleCard";
import CycleSetupSheet from "@/components/care/CycleSetupSheet";
import {
  createCycleReminderRows,
  deleteCycleReminders,
  upsertPeriodCycle,
} from "@/lib/appwrite";

import { CycleConfig } from "@/types/type";

import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sampleReminders: CareReminder[] = [
  {
    id: "1",
    title: "Ask how their day really went",
    type: "nudge",
    recurrence: "daily",
    notify: "me",
    isPrivate: false,
    nextTrigger: "This evening",
    emotionalLabel: "A gentle nudge for your connection",
  },
  {
    id: "2",
    title: "Our first date anniversary",
    type: "memory",
    recurrence: "monthly",
    notify: "both",
    isPrivate: false,
    nextTrigger: "Mar 15",
    emotionalLabel: "A moment worth remembering",
  },
];

const Care = () => {
  const [tab, setTab] = useState<"moments" | "calendar">("moments");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [reminders, setReminders] = useState<CareReminder[]>(sampleReminders);
  const [cycleEnabled, setCycleEnabled] = useState(false);
  const [isCycleSheetOpen, setIsCycleSheetOpen] = useState(false);
  const [cycleSaving, setCycleSaving] = useState(false);

  // Open sheet automatically if no reminders
  useEffect(() => {
    if (tab === "moments" && reminders.length === 0) {
      setIsSheetOpen(true);
    }
  }, [tab, reminders.length]);

  const handleCreate = (newReminder: CareReminder) => {
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
        createCycleReminderRows(cycleDoc.$id, config).catch(console.error);
      } else {
        await deleteCycleReminders(cycleDoc.$id);
      }
    } catch (e) {
      console.log("Cycle save failed", e);
    } finally {
      setCycleSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card">
      <View className="flex-1">
        <CareHeader activeTab={tab} onChange={setTab} />

        {tab === "moments" ? (
          <>
            {reminders.length === 0 ? (
              <CareEmptyState onCreateFirst={() => setIsSheetOpen(true)} />
            ) : (
              <>
                <FlatList
                  data={reminders}
                  keyExtractor={(i) => i.id}
                  contentContainerStyle={{
                    paddingTop: 10,
                    paddingBottom: 100,
                  }}
                  ListHeaderComponent={
                    <CycleCard
                      enabled={cycleEnabled}
                      nextWindowLabel="Next care window in 3 days"
                      onPress={() => setIsCycleSheetOpen(true)}
                    />
                  }
                  renderItem={({ item }) => (
                    <View className="px-5">
                      <CareCard reminder={item} />
                    </View>
                  )}
                />

                {/* Floating Button */}
                <TouchableOpacity
                  onPress={() => setIsSheetOpen(true)}
                  className="absolute bottom-28 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
                >
                  <Plus size={24} color="white" />
                </TouchableOpacity>
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
            renderItem={() => <CareCalendar />}
          />
        )}
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
    </SafeAreaView>
  );
};

export default Care;
