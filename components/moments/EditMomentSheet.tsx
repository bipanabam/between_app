import { editMomentWithMedia } from "@/lib/appwrite";
import { useAuth } from "@/providers/AuthProvider";
import { MomentsDocument } from "@/types/type";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { Bell, CalendarIcon, Camera, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import DatePicker from "react-native-date-picker";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  moment: MomentsDocument | null;
  onUpdated: (moment: MomentsDocument) => void;
};

const momentTypes = [
  { value: "memory", label: "Memory", icon: Camera },
  { value: "date-night", label: "Date night", icon: Bell },
  { value: "anniversary", label: "Anniversary", icon: Bell },
  { value: "milestone", label: "Milestone", icon: Bell },
];

const EditMomentSheet = ({ isOpen, onClose, moment, onUpdated }: Props) => {
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const { temporarilyIgnoreAppLock } = useAuth();

  // form state
  const [title, setTitle] = useState(moment?.title ?? "");
  const [note, setNote] = useState(moment?.note ?? "");
  const [type, setType] = useState<MomentsDocument["type"]>(
    moment?.type ?? "memory",
  );
  const [date, setDate] = useState(moment ? dayjs(moment.momentDate) : dayjs());
  const [hasReminder, setHasReminder] = useState(moment?.hasReminder ?? false);
  const [notifyPartner, setNotifyPartner] = useState(true);
  const [isPrivate, setIsPrivate] = useState(moment?.isPrivate ?? false);

  const [selectedMediaUri, setSelectedMediaUri] = useState(
    moment?.mediaUrl ?? null,
  );
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [baseTime, setBaseTime] = useState<Date>(() => {
    if (moment?.reminderConfig?.triggerAt) {
      const triggerAt = moment.reminderConfig.triggerAt;
      const d = new Date(triggerAt);
      return d;
    }
    return new Date(); // fallback
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const reminderAnim = useRef(new Animated.Value(hasReminder ? 1 : 0)).current;

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

  useEffect(() => {
    // reset when moment changes
    setTitle(moment?.title ?? "");
    setNote(moment?.note ?? "");
    setType(moment?.type ?? "memory");
    setDate(moment ? dayjs(moment.momentDate) : dayjs());
    setHasReminder(moment?.hasReminder ?? false);
    setIsPrivate(moment?.isPrivate ?? false);
    setSelectedMediaUri(moment?.mediaUrl ?? null);
  }, [moment]);

  const pickImage = async () => {
    temporarilyIgnoreAppLock();
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
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

  const handleSave = async () => {
    if (!moment || !title.trim() || saving) return;
    setSaving(true);

    try {
      // Prepare reminder config if reminder is enabled
      let reminderConfig = undefined;
      if (hasReminder) {
        reminderConfig = {
          triggerAt: dayjs(date)
            .hour(dayjs(baseTime).hour())
            .minute(dayjs(baseTime).minute())
            .second(0)
            .toISOString(),
          notifyPartner,
          momentTitle: title,
          momentNote: note,
        };
      }

      const updatedMoment = await editMomentWithMedia(moment.$id, {
        title,
        note,
        type,
        momentDate: date.toISOString(),
        hasReminder,
        isPrivate,
        reminderConfig,
        fileUri: selectedMediaUri ?? undefined,
        mime: selectedMimeType ?? undefined,
      });

      if (updatedMoment) {
        onUpdated(updatedMoment);
        onClose();
      }
    } catch (err) {
      console.error("Failed to save moment:", err);
    } finally {
      setSaving(false);
    }
  };

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
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-base font-medium text-foreground/80">
              Edit moment
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

          {hasReminder && (
            <View className="mb-5">
              <Text className="text-sm text-mutedForeground mb-2 font-normal">
                Reminder time
              </Text>
              <TouchableOpacity
                onPress={() => setTimePickerOpen(true)}
                className="flex-row items-center gap-2 bg-card rounded-xl px-4 py-3"
              >
                <Text className="text-sm text-foreground/80">
                  ⏰ {dayjs(baseTime).format("h:mm A")}
                </Text>
              </TouchableOpacity>

              <DatePicker
                modal
                mode="time"
                open={timePickerOpen}
                date={baseTime}
                onConfirm={(t) => {
                  setBaseTime(t);
                  setTimePickerOpen(false);
                }}
                onCancel={() => setTimePickerOpen(false)}
              />
            </View>
          )}

          {/* Reminder toggle */}
          <View className="bg-card rounded-xl mb-5 overflow-hidden">
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

            {hasReminder && (
              <Animated.View
                style={{
                  maxHeight: reminderAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 60],
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

          {/* Save button */}
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
              <Text className="text-white font-medium">Save changes</Text>
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

export default EditMomentSheet;
