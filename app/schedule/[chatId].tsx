import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, Pencil, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScheduleMessageSheet from "@/components/chat/ScheduleMessageSheet";
import {
  deleteScheduledMessage,
  getScheduledMessages,
  updateScheduledMessage,
} from "@/lib/appwrite";
import { showError, showSuccess } from "@/lib/toast";
import { ScheduledMessages } from "@/types/type";

const ScheduledMessagesScreen = () => {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessages[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [editingMessage, setEditingMessage] =
    useState<ScheduledMessages | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const fetchScheduledMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const messages = await getScheduledMessages(chatId);
      setScheduledMessages(messages);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchScheduledMessages();
  }, [fetchScheduledMessages]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete scheduled message?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteScheduledMessage(id);
            setScheduledMessages((prev) => prev.filter((m) => m.$id !== id));
            showSuccess("Scheduled message deleted");
          } catch (error) {
            console.log(error);
            showError("Error occured while deleting schedule");
          }
        },
      },
    ]);
  };

  const handleEdit = (item: ScheduledMessages) => {
    setEditingMessage(item);
    setShowSheet(true);
  };

  const handleUpdate = async (text: string, scheduledAt: string) => {
    if (!editingMessage) return;

    const updated = await updateScheduledMessage(
      editingMessage.$id,
      text,
      scheduledAt,
    );

    setScheduledMessages((prev) =>
      prev.map((m) => (m.$id === updated.$id ? updated : m)),
    );

    setEditingMessage(null);
    setShowSheet(false);
  };

  const renderItem = ({ item }: { item: ScheduledMessages }) => {
    const formatted = dayjs(item.scheduledAt).format("MMM D • h:mm A");

    return (
      <View
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        style={{
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.3)",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <Text className="text-base mb-2">{item.text}</Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Clock size={14} color="#8a8075" />
            <Text className="text-xs text-mutedForeground">{formatted}</Text>
          </View>

          <View className="flex-row gap-3">
            <Pressable onPress={() => handleEdit(item)}>
              <Pencil size={18} color="#bc8f97" />
            </Pressable>

            <Pressable onPress={() => handleDelete(item.$id)}>
              <Trash2 size={18} color="#E57399" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ paddingBottom: 80 }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 gap-3 mb-">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={22} color="#bc8f97" />
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">
          Scheduled Messages
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-mutedForeground">Loading...</Text>
        </View>
      ) : scheduledMessages.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-mutedForeground">
            No scheduled messages yet 💌
          </Text>
        </View>
      ) : (
        <FlatList
          data={scheduledMessages}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}
        />
      )}

      <ScheduleMessageSheet
        visible={showSheet}
        message={editingMessage}
        onClose={() => {
          setEditingMessage(null);
          setShowSheet(false);
        }}
        onSchedule={handleUpdate}
      />
    </SafeAreaView>
  );
};

export default ScheduledMessagesScreen;
