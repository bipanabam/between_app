import { createMomentWithMedia, createReminderForMoment } from "@/lib/appwrite";
import { useAuth } from "@/providers/AuthProvider";
import { MomentsDocument } from "@/types/type";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { Bell, Camera, Flag, Heart, Star } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-native-date-picker";

import { CalendarIcon, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const momentTypes = [
  { value: "memory", label: "Memory", icon: Camera },
  { value: "date-night", label: "Date night", icon: Heart },
  { value: "anniversary", label: "Anniversary", icon: Star },
  { value: "milestone", label: "Milestone", icon: Flag },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (moment: MomentsDocument) => void;
};

const CreateMomentSheet = ({ isOpen, onClose, onSaved }: Props) => {
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const { temporarilyIgnoreAppLock } = useAuth();

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<MomentsDocument["type"]>("memory");
  const [date, setDate] = useState(dayjs());
  const [hasReminder, setHasReminder] = useState(true);
  const [notifyPartner, setNotifyPartner] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // animated reveal for reminder options
  const reminderAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOpen) ref.current?.present();
    else ref.current?.dismiss();
  }, [isOpen]);

  useEffect(() => {
    Animated.timing(reminderAnim, {
      toValue: hasReminder ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [hasReminder]);

  const marked = {
    [date.format("YYYY-MM-DD")]: {
      selected: true,
      selectedColor: "#bc8f97",
    },
  };

  const handleSave = async () => {
    if (!title.trim() || saving) return;

    try {
      setSaving(true);

      const moment = await createMomentWithMedia({
        fileUri: selectedMediaUri,
        mime: selectedMimeType,

        type,
        title,
        note,
        momentDate: date.toISOString(),
        hasReminder,
        reminderConfig: hasReminder ? { notifyPartner } : null,
        isPrivate,
      });

      if (hasReminder) {
        await createReminderForMoment(moment.$id, {
          triggerAt: date.toISOString(),
          notifyPartner,
        });
      }

      onSaved(moment);

      // reset form
      setTitle("");
      setNote("");
      setSelectedMediaUri(null);
      setSelectedMimeType(null);

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    temporarilyIgnoreAppLock();
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        console.log("Media permission denied");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        // allowsEditing: true,
      });

      if (res.canceled) return;

      const asset = res.assets[0];

      setSelectedMediaUri(asset.uri);
      setSelectedMimeType(asset.mimeType ?? "image/jpeg");
    } catch (err) {
      console.log("Image pick failed:", err);
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.3} />
  );

  return (
    <>
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#e5d4d8", width: 48 }}
        backgroundStyle={{ borderRadius: 28, backgroundColor: "#faf8f8" }}
        enableDynamicSizing={false}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-base font-medium text-foreground/80">
              Capture a moment
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={22} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <TextInput
            placeholder="What's this moment about?"
            value={title}
            onChangeText={setTitle}
            className="bg-card rounded-xl px-4 py-3.5 mb-4 text-foreground border border-primary/30 h-12"
            placeholderTextColor="#aaa"
          />

          {/* Note */}
          <TextInput
            placeholder="A little note to your future self…(optional)"
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
            className="bg-card rounded-xl px-4 py-3.5 mb-6 text-foreground border border-primary/30 h-20"
            placeholderTextColor="#aaa"
          />

          {/* Media picker */}
          <TouchableOpacity
            onPress={pickImage}
            className="flex-row items-center gap-2 bg-card rounded-xl px-4 py-3 mb-3"
          >
            <Camera size={16} color="#9f6f78" />
            <Text className="text-sm text-foreground/80">
              {selectedMediaUri ? "Change photo" : "Add a photo"}
            </Text>
          </TouchableOpacity>

          {/* Image preview */}
          {selectedMediaUri && (
            <TouchableOpacity
              onPress={() => setPreviewOpen(true)}
              className="flex-row items-center justify-between bg-card px-4 py-2 mb-4 rounded-xl border border-primary/20"
            >
              <Text className="text-sm text-foreground/80">
                📷 {selectedMediaUri.split("/").pop()} (Tap to preview)
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedMediaUri(null)}
                className="bg-card rounded-full w-7 h-7 items-center justify-center border border-muted"
              >
                <Text className="text-xs">✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Type */}
          <Text className="text-sm text-mutedForeground mb-2 font-normal">
            Kind of moment
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-5">
            {momentTypes.map((m) => {
              const Icon = m.icon;
              const active = type === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setType(m.value as MomentsDocument["type"])}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl ${
                    active ? "bg-primary/25" : "bg-accent/60"
                  }`}
                >
                  <Icon size={15} color={active ? "#bc8f97" : "#999"} />
                  <Text
                    className={`text-sm ${active ? "text-foreground" : "text-mutedForeground/50"}`}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date picker */}
          <View className="space-y-2 mb-5">
            <Text className="text-sm text-mutedForeground mb-2 font-normal">
              Moment date
            </Text>

            <TouchableOpacity
              onPress={() => setDatePickerOpen(true)}
              className="flex-row items-center gap-2 bg-card rounded-xl px-4 py-3"
            >
              <CalendarIcon size={16} color={date ? "#bc8f97" : "#aaa"} />
              <Text className="text-sm text-foreground/80">
                {date ? dayjs(date).format("MMM D, YYYY") : "Choose a date"}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={datePickerOpen}
              date={date.toDate ? date.toDate() : new Date()}
              mode="date"
              onConfirm={(selectedDate) => {
                setDate(dayjs(selectedDate));
                setDatePickerOpen(false);
              }}
              onCancel={() => setDatePickerOpen(false)}
            />
          </View>

          {/* Reminder + Notify Partner */}
          <View className="bg-card rounded-xl mb-5 overflow-hidden">
            {/* Reminder toggle */}
            <TouchableOpacity
              onPress={() => setHasReminder((v) => !v)}
              className="flex-row items-center gap-3 px-4 py-3"
            >
              <Bell size={16} color={hasReminder ? "#bc8f97" : "#aaa"} />
              <View className="flex-1">
                <Text className="text-sm text-foreground/80">
                  {hasReminder
                    ? "Reminder enabled"
                    : "Enable a gentle reminder"}
                </Text>
              </View>
              <Switch value={hasReminder} onValueChange={setHasReminder} />
            </TouchableOpacity>

            {/* Notify partner, visible only if reminder is enabled */}
            {hasReminder && (
              <Animated.View
                style={{
                  maxHeight: reminderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 60], // adjust height
                  }),
                  opacity: reminderAnim,
                  overflow: "hidden",
                }}
              >
                <View className="flex-row justify-between items-center px-10 py-3 border-t border-primary/10">
                  <Text className="text-sm text-foreground/70">
                    Notify partner
                  </Text>
                  <Switch
                    value={notifyPartner}
                    onValueChange={setNotifyPartner}
                  />
                </View>
              </Animated.View>
            )}
          </View>

          {/* Privacy */}
          <View className="flex-row justify-between items-center bg-card rounded-xl px-4 py-3 mb-6">
            <Text className="text-sm text-foreground/70">
              Keep this private
            </Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} />
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!title.trim() || saving}
            className="bg-primary rounded-full py-4 items-center"
            style={{ opacity: title.trim() && !saving ? 1 : 0.4 }}
          >
            {saving ? (
              <View className="flex-row gap-2 items-center">
                <Text className="text-white font-medium">Saving</Text>

                <ActivityIndicator color="white" />
              </View>
            ) : (
              <Text className="text-white font-medium">Save this moment</Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
      {/* Fullscreen image preview */}
      <Modal visible={previewOpen} transparent={true}>
        <View className="flex-1 bg-black items-center justify-center">
          <TouchableOpacity
            className="absolute top-10 right-10 z-10"
            onPress={() => setPreviewOpen(false)}
          >
            <X size={30} color="white" />
          </TouchableOpacity>
          {selectedMediaUri && (
            <Image
              source={{ uri: selectedMediaUri }}
              style={{ width: "90%", height: "70%", resizeMode: "contain" }}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default CreateMomentSheet;
