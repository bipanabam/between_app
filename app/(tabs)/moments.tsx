import FloatingActionMenu, {
  FloatingActionItem,
} from "@/components/FloatingActionMenu";
import CalendarReminderSheet from "@/components/moments/CalenderReminderSheet";
import CreateMomentSheet from "@/components/moments/CreateMomentSheet";
import CreateReminderSheet from "@/components/moments/CreateReminderSheet";
import CycleCard from "@/components/moments/CycleCard";
import CycleSetupSheet from "@/components/moments/CycleSetupSheet";
import EditMomentSheet from "@/components/moments/EditMomentSheet";
import EditReminderSheet from "@/components/moments/EditReminderSheet";
import EmptyState from "@/components/moments/EmptyState";
import MomentCard from "@/components/moments/MomentCard";
import MomentsCalendar from "@/components/moments/MomentsCalendar";
import MomentsHeader from "@/components/moments/MomentsHeader";
import ReminderCard from "@/components/moments/ReminderCard";

import {
  createCycleReminderRows,
  deleteCycleReminders,
  deleteMoment,
  deleteReminder,
  getAllMoments,
  getAllReminders,
  getMomentsWithUpcomingReminders,
  getPeriodCycle,
  getUpcomingReminders,
  upsertPeriodCycle,
} from "@/lib/appwrite";

import { showError, showSuccess } from "@/lib/toast";

import {
  CycleConfig,
  MomentsDocument,
  PeriodCycleDocument,
  ReminderDocument,
} from "@/types/type";
import dayjs from "dayjs";

import React, { useEffect, useState } from "react";
import { FlatList, SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Moments = () => {
  const [tab, setTab] = useState<"moments" | "calendar">("moments");
  const [reminders, setReminders] = useState<ReminderDocument[]>([]);
  const [moments, setMoments] = useState<MomentsDocument[]>([]);
  const [allReminders, setAllReminders] = useState<ReminderDocument[]>([]);
  const [allMoments, setAllMoments] = useState<MomentsDocument[]>([]);
  const [cycle, setCycle] = useState<PeriodCycleDocument | null>(null);

  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<dayjs.Dayjs | null>(null);

  const [cycleEnabled, setCycleEnabled] = useState(false);
  const [cycleSaving, setCycleSaving] = useState(false);

  const [isCycleSheetOpen, setIsCycleSheetOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMomentSheetOpen, setMomentSheetOpen] = useState(false);

  const [editingMoment, setEditingMoment] = useState<MomentsDocument | null>(
    null,
  );
  const [isMomentEditSheetOpen, setIsMomentEditSheetOpen] = useState(false);

  const [editingReminder, setEditingReminder] =
    useState<ReminderDocument | null>(null);
  const [isReminderEditSheetOpen, setIsReminderEditSheetOpen] = useState(false);

  const handleEditMoment = (moment: MomentsDocument) => {
    setEditingMoment(moment);
    setIsMomentEditSheetOpen(true);
  };

  const handleDeleteMoment = async (momentId: string) => {
    await deleteMoment(momentId);

    setMoments((prev) => prev.filter((m) => m.$id !== momentId));
    setAllMoments((prev) => prev.filter((m) => m.$id !== momentId));

    showSuccess("Moment deleted");
  };

  const handleEditReminder = (reminder: ReminderDocument) => {
    setEditingReminder(reminder);
    setIsReminderEditSheetOpen(true);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    await deleteReminder(reminderId);

    setReminders((prev) => prev.filter((r) => r.$id !== reminderId));
    setAllReminders((prev) => prev.filter((r) => r.$id !== reminderId));

    showSuccess("Reminder deleted 🗑️");
  };

  // Open sheet automatically if no reminders
  // useEffect(() => {
  //   if (tab === "moments" && reminders?.length === 0) {
  //     setIsSheetOpen(true);
  //   }
  // }, [tab, reminders?.length]);

  useEffect(() => {
    const load = async () => {
      const [
        upcomingRem,
        upcomingMoments,
        allReminders,
        allMoments,
        periodCycle,
      ] = await Promise.all([
        getUpcomingReminders(),
        getMomentsWithUpcomingReminders(),
        getAllReminders(),
        getAllMoments(),
        getPeriodCycle(),
      ]);

      setReminders(upcomingRem);
      setMoments(upcomingMoments);
      setAllReminders(allReminders);
      setAllMoments(allMoments);
      setCycle(periodCycle);
    };

    load();
  }, []);

  const handleCreate = (newReminder: ReminderDocument) => {
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
      showSuccess(
        config.isEnabled ? "Cycle care enabled 🌸" : "Cycle care disabled",
      );

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
      showError("Cycle save failed");
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

  const sections = [
    {
      title: "Upcoming moments",
      type: "moments",
      data: moments,
    },
    {
      title: "Upcoming reminders",
      type: "reminders",
      data: reminders,
    },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-card">
      <View className="flex-1">
        <MomentsHeader activeTab={tab} onChange={setTab} />

        {tab === "moments" ? (
          <>
            <CycleCard
              cycle={cycle ?? undefined}
              onPress={() => setIsCycleSheetOpen(true)}
            />

            {moments.length === 0 && reminders.length === 0 ? (
              <EmptyState onCreateFirst={() => setIsSheetOpen(true)} />
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item: any) => item.$id}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 120 }}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={() => <View className="h-3" />}
                renderSectionHeader={({ section }) => (
                  <View className="px-5 mt-4 mb-2">
                    <Text className="text-xs text-mutedForeground/60 tracking-wide">
                      {section.title}
                    </Text>
                  </View>
                )}
                renderItem={({ item, index, section }) => {
                  if (section.type === "moments") {
                    return (
                      <View className="px-5">
                        <MomentCard
                          moment={item}
                          index={index}
                          onEdit={handleEditMoment}
                          onDelete={handleDeleteMoment}
                        />
                      </View>
                    );
                  }

                  return (
                    <View className="px-5">
                      <ReminderCard
                        reminder={item}
                        index={index}
                        onEdit={handleEditReminder}
                        onDelete={handleDeleteReminder}
                      />
                    </View>
                  );
                }}
              />
            )}
          </>
        ) : (
          <FlatList
            data={[{ id: "calendar" }]}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
            ListHeaderComponent={
              <CycleCard
                cycle={cycle ?? undefined}
                onPress={() => setIsCycleSheetOpen(true)}
              />
            }
            renderItem={() => (
              <MomentsCalendar onDayPress={setSelectedCalendarDate} />
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

      <EditReminderSheet
        isOpen={isReminderEditSheetOpen}
        onClose={() => setIsReminderEditSheetOpen(false)}
        reminder={editingReminder}
        onUpdated={(updated) => {
          setReminders((prev) =>
            prev.map((m) => (m.$id === updated.$id ? updated : m)),
          );

          showSuccess("Reminder updated ✨");
        }}
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
        onSaved={(m) => {
          showSuccess("Moment saved 💖");
        }}
      />

      <EditMomentSheet
        isOpen={isMomentEditSheetOpen}
        onClose={() => setIsMomentEditSheetOpen(false)}
        moment={editingMoment}
        onUpdated={(updated) => {
          setMoments((prev) =>
            prev.map((m) => (m.$id === updated.$id ? updated : m)),
          );

          showSuccess("Moment updated ✨");
        }}
      />

      <CalendarReminderSheet
        selectedDate={selectedCalendarDate}
        reminders={allReminders}
        moments={allMoments}
        onClose={() => setSelectedCalendarDate(null)}
        onEditMoment={(m) => {
          setSelectedCalendarDate(null);
          handleEditMoment(m);
        }}
        onDeleteMoment={(id) => {
          setSelectedCalendarDate(null);
          handleDeleteMoment(id);
        }}
        onEditReminder={(r) => {
          setSelectedCalendarDate(null);
          handleEditReminder(r);
        }}
        onDeleteReminder={(id) => {
          setSelectedCalendarDate(null);
          handleDeleteReminder(id);
        }}
      />
    </SafeAreaView>
  );
};

export default Moments;
