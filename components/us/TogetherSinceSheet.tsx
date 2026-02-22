import PulseHeart from "@/components/PulseHeart";
import StatusBadge from "@/components/StatusBadge";
import { daysSince, formatDate } from "@/lib/date";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import { CalendarIcon } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const TogetherSinceSheet = ({
  open,
  onClose,
  pair,
  meId,
  onPropose,
  onConfirm,
}: any) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const pending = pair.relationshipStartDatePending;
  const proposedByMe = pair.relationshipStartDateProposedBy === meId;
  const confirmed = pair.relationshipStartDateConfirmed;
  const [date, setDate] = useState<Date>(
    pair.relationshipStartDatePending
      ? new Date(pair.relationshipStartDatePending)
      : new Date(),
  );
  const hasPendingDate = !!pair.relationshipStartDatePending;

  const [showPicker, setShowPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const togglePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const snapPoints = useMemo(
    () => (showPicker ? ["45%"] : proposedByMe ? ["32%"] : ["35%"]),
    [showPicker, proposedByMe],
  );

  useEffect(() => {
    if (open) sheetRef.current?.present();
  }, [open]);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.6}
      // Custom component for blur
    />
  );

  const handlePropose = async (d: Date) => {
    try {
      setSaving(true);
      await onPropose(d);
      setShowPicker(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      //   onClose(); // auto close
      //   sheetRef.current?.dismiss();
    } finally {
      setSaving(false);
    }
  };

  //Confirming the date proposed
  const confirmScale = useSharedValue(1);

  const confirmStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
  }));
  const handleConfirm = async () => {
    confirmScale.value = withSequence(
      withTiming(0.92, { duration: 120 }),
      withTiming(1.06, { duration: 160 }),
      withTiming(1, { duration: 120 }),
    );

    try {
      setSaving(true);
      await onConfirm();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Initializing the calender
  const calendarInitialDate = useMemo(() => {
    if (pair.relationshipStartDatePending) {
      return new Date(pair.relationshipStartDatePending);
    }
    return date;
  }, [pair.relationshipStartDatePending, date]);
  const calendarInitialKey = calendarInitialDate.toISOString().split("T")[0];

  const selectedKey = date.toISOString().split("T")[0];
  const pendingKey = pair.relationshipStartDatePending
    ? new Date(pair.relationshipStartDatePending).toISOString().split("T")[0]
    : null;

  const markedDates = {
    ...(pendingKey && {
      [pendingKey]: {
        marked: true,
        dotColor: "#bc8f97",
      },
    }),
    [selectedKey]: {
      selected: true,
      selectedColor: "#8a8075",
    },
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      backgroundStyle={{
        borderRadius: 32,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#bc8f97",
        width: 40,
      }}
      onDismiss={onClose}
    >
      <BottomSheetView className="px-6 pb-10 mt-4">
        {/* Sheet status header */}
        {pending && proposedByMe && (
          <StatusBadge label="Awaiting confirmation" />
        )}

        {pending && !proposedByMe && (
          <StatusBadge label="Needs your confirmation" />
        )}

        {confirmed && <StatusBadge label="Confirmed together 💞" />}

        {confirmed && (
          <View className="items-center">
            <View className="items-center mb-2">
              <PulseHeart active />
            </View>

            {/* Title */}
            <Text className="text-xl font-semibold text-center">
              Your love, sealed on
            </Text>

            <Text className="mt-2 text-mutedForeground text-center text-sm px-6">
              This day is now part of your shared story. You can update it
              anytime — together.
            </Text>

            {/* Highlighted date */}
            <View className="mt-5 items-center">
              <View className="px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Text className="text-xl font-semibold text-primary text-center">
                  {formatDate(pair.relationshipStartDate)}
                </Text>
              </View>

              <Text className="mt-3 text-sm text-mutedForeground">
                {daysSince(pair.relationshipStartDate)} days in love
              </Text>
            </View>
          </View>
        )}

        {!confirmed && !pending && (
          <>
            <View className="items-center mb-6">
              <PulseHeart active />

              <Text className="text-xl font-semibold mt-3 text-center">
                Choose the day your story began
              </Text>

              <Text className="text-mutedForeground text-center mt-2 text-sm px-4">
                This will become your shared anniversary.
              </Text>
            </View>
            {!showPicker && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  togglePicker();
                }}
                className="mt-6"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <View className="bg-primary rounded-3xl py-5 items-center shadow-sm">
                  <Text className="text-white text-center">
                    Choose our beginning
                  </Text>
                </View>
              </Pressable>
            )}
          </>
        )}

        {pending && proposedByMe && (
          <>
            <Text className="text-mutedForeground mt-2">
              You proposed {formatDate(pair.relationshipStartDatePending)}
            </Text>

            {!showPicker && (
              <Pressable
                disabled={saving}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  togglePicker();
                }}
                className="mt-6"
                style={({ pressed }) => [
                  { transform: [{ scale: pressed && !saving ? 0.97 : 1 }] },
                ]}
              >
                <View className="bg-primary rounded-3xl py-4 items-center">
                  <Text className="text-white font-semibold">Change date</Text>
                </View>
              </Pressable>
            )}
          </>
        )}
        {pending && !proposedByMe && (
          <>
            <View className="items-center mb-2">
              <PulseHeart active />
            </View>

            <Text className="text-lg font-semibold text-center">
              Your partner proposed a date
            </Text>

            {/* Highlighted date */}
            <View className="mt-4 items-center">
              <Text className="text-xs text-mutedForeground mb-1">
                Proposed date
              </Text>

              <View className="px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Text className="text-lg font-semibold text-primary text-center">
                  {formatDate(pair.relationshipStartDatePending)}
                </Text>
              </View>
            </View>

            <Animated.View style={confirmStyle}>
              <Pressable
                disabled={saving}
                onPress={handleConfirm}
                className="mt-6"
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed && !saving ? 0.96 : 1 }],
                  },
                ]}
              >
                <View
                  className={`rounded-3xl py-5 items-center ${
                    saving ? "bg-primary/60" : "bg-primary"
                  }`}
                >
                  {saving ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" />
                      <Text className="text-white text-lg font-semibold ml-3">
                        Confirming...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-lg font-semibold">
                      Confirm this day 💞
                    </Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          </>
        )}

        {/* DATE PICKER */}
        {showPicker && (
          <View className="mt-8">
            <Text className="text-xs text-mutedForeground mb-3 text-center uppercase tracking-widest">
              Selected date
            </Text>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setShowDatePicker(true);
              }}
              className="rounded-3xl px-6 py-5 bg-white border border-primary/20"
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="bg-primary/10 p-3 rounded-2xl">
                    <CalendarIcon size={20} color="#bc8f97" />
                  </View>

                  <View>
                    <Text className="text-xs text-mutedForeground">
                      Tap to change
                    </Text>
                    <Text className="text-lg font-semibold">
                      {dayjs(date).format("MMMM D, YYYY")}
                    </Text>
                  </View>
                </View>

                <Text className="text-primary text-lg">›</Text>
              </View>
            </Pressable>

            {/* ACTION BUTTONS */}
            <View className="flex-row gap-4 mt-6">
              {/* Cancel */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowPicker(false);
                }}
                className="flex-1"
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <View className="border border-primary/30 rounded-3xl py-5 items-center">
                  <Text className="text-primary font-semibold">Cancel</Text>
                </View>
              </Pressable>

              {/* Propose */}
              <Pressable
                disabled={saving}
                onPress={() => handlePropose(date)}
                className="flex-1"
                style={({ pressed }) => [
                  { transform: [{ scale: pressed && !saving ? 0.97 : 1 }] },
                ]}
              >
                <View
                  className={`rounded-3xl py-5 items-center ${
                    saving ? "bg-primary/60" : "bg-primary"
                  }`}
                >
                  {saving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Propose 💍</Text>
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            maximumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (selected) {
                setDate(selected);
                Haptics.selectionAsync();
              }
            }}
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TogetherSinceSheet;
