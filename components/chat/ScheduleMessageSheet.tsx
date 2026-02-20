import { showError, showSuccess } from "@/lib/toast";
import { ScheduledMessages } from "@/types/type";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import { CalendarIcon, TimerIcon, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  message?: ScheduledMessages | null;
  onClose: () => void;
  onSchedule: (text: string, scheduledAt: string) => Promise<void>;
}

const ScheduleMessageSheet = ({
  visible,
  message,
  onClose,
  onSchedule,
}: Props) => {
  const isEditing = !!message;

  const [text, setText] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // HYDRATE EXISTING DATA
  useEffect(() => {
    if (visible && message) {
      setText(message.text);
      setDate(new Date(message.scheduledAt));
    }

    // reset when closing
    if (!visible) {
      setText("");
      setDate(null);
    }
  }, [visible, message]);

  const handleSubmit = async () => {
    if (!text.trim() || !date) return;

    try {
      setLoading(true);
      await onSchedule(text, dayjs(date).toISOString());

      showSuccess(
        isEditing
          ? "Scheduled message updated successfully 💌"
          : "Text scheduled successfully 💌",
      );

      onClose();
    } catch (error) {
      console.log(error);
      showError("Something went wrong..Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
          </Pressable>

          <View
            style={{
              backgroundColor: "#F7F3F2",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View className="w-12 h-1.5 rounded-full bg-gray-300 self-center mb-6" />

            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-semibold text-foreground">
                {isEditing ? "Edit scheduled message" : "Schedule a message"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View className="bg-inputColor rounded-2xl px-4 py-3 my-4">
              <TextInput
                placeholder="Write something sweet..."
                multiline
                value={text}
                onChangeText={setText}
                style={{ minHeight: 60 }}
              />
            </View>

            <View className="flex-row gap-3 mb-6 mt-2">
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center bg-inputColor gap-2 rounded-2xl px-4 py-3"
              >
                <CalendarIcon size={16} color={date ? "#bc8f97" : "#aaa"} />

                <Text className="text-md text-foreground">
                  {date ? dayjs(date).format("MMM D, YYYY") : "Pick a date"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="flex-row items-center gap-2 bg-inputColor rounded-2xl px-4 py-3"
              >
                <Text>
                  {date ? dayjs(date).format("hh:mm A") : "Pick time"}
                </Text>
                <TimerIcon size={16} color={date ? "#bc8f97" : "#aaa"} />
              </Pressable>
            </View>

            <Pressable
              disabled={!text.trim() || !date || loading}
              onPress={handleSubmit}
              style={{
                backgroundColor: !text.trim() || !date ? "#D6C3C4" : "#D7AEB2",
                paddingVertical: 14,
                borderRadius: 18,
                alignItems: "center",
              }}
            >
              <Text className="text-white">
                {loading
                  ? isEditing
                    ? "Updating..."
                    : "Scheduling..."
                  : isEditing
                    ? "Update 💌"
                    : "Send later 💌"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(e, selected) => {
            setShowDatePicker(false);
            if (selected) {
              // preserve time if editing
              const currentTime = date || new Date();
              selected.setHours(currentTime.getHours());
              selected.setMinutes(currentTime.getMinutes());
              setDate(selected);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="time"
          onChange={(e, selected) => {
            setShowTimePicker(false);
            if (selected) {
              const currentDate = date || new Date();
              currentDate.setHours(selected.getHours());
              currentDate.setMinutes(selected.getMinutes());
              setDate(new Date(currentDate));
            }
          }}
        />
      )}
    </>
  );
};

export default ScheduleMessageSheet;
