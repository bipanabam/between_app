import { useEffect, useState } from "react";

import {
    deleteMoment,
    deleteReminder,
    getAllMoments,
    getAllReminders,
    getMomentsWithUpcomingReminders,
    getUpcomingReminders,
} from "@/lib/appwrite";

import { showSuccess } from "@/lib/toast";
import { MomentsDocument, ReminderDocument } from "@/types/type";

export const useMomentsController = () => {
  const [upcomingReminders, setUpcomingReminders] = useState<
    ReminderDocument[]
  >([]);
  const [upcomingMoments, setUpcomingMoments] = useState<MomentsDocument[]>([]);

  const [allReminders, setAllReminders] = useState<ReminderDocument[]>([]);
  const [allMoments, setAllMoments] = useState<MomentsDocument[]>([]);

  const [loading, setLoading] = useState(true);

  // Sheet state
  const [editingMoment, setEditingMoment] = useState<MomentsDocument | null>(
    null,
  );

  const [editingReminder, setEditingReminder] =
    useState<ReminderDocument | null>(null);

  const load = async () => {
    try {
      setLoading(true);

      const [upRem, upMom, allRem, allMom] = await Promise.all([
        getUpcomingReminders(),
        getMomentsWithUpcomingReminders(),
        getAllReminders(),
        getAllMoments(),
      ]);

      setUpcomingReminders(upRem);
      setUpcomingMoments(upMom);
      setAllReminders(allRem);
      setAllMoments(allMom);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // CRUD

  const deleteMomentById = async (id: string) => {
    await deleteMoment(id);

    setUpcomingMoments((prev) => prev.filter((m) => m.$id !== id));
    setAllMoments((prev) => prev.filter((m) => m.$id !== id));

    showSuccess("Moment deleted ✨");
  };

  const deleteReminderById = async (id: string) => {
    await deleteReminder(id);

    setUpcomingReminders((prev) => prev.filter((r) => r.$id !== id));
    setAllReminders((prev) => prev.filter((r) => r.$id !== id));

    showSuccess("Reminder deleted 🗑️");
  };

  const updateMomentLocal = (updated: MomentsDocument) => {
    setUpcomingMoments((prev) =>
      prev.map((m) => (m.$id === updated.$id ? updated : m)),
    );
    setAllMoments((prev) =>
      prev.map((m) => (m.$id === updated.$id ? updated : m)),
    );
  };

  const updateReminderLocal = (updated: ReminderDocument) => {
    setUpcomingReminders((prev) =>
      prev.map((r) => (r.$id === updated.$id ? updated : r)),
    );
    setAllReminders((prev) =>
      prev.map((r) => (r.$id === updated.$id ? updated : r)),
    );
  };

  return {
    loading,

    // Data
    upcomingReminders,
    upcomingMoments,
    allReminders,
    allMoments,

    // Edit state
    editingMoment,
    setEditingMoment,
    editingReminder,
    setEditingReminder,

    // Actions
    deleteMomentById,
    deleteReminderById,
    updateMomentLocal,
    updateReminderLocal,

    reload: load,
  };
};
