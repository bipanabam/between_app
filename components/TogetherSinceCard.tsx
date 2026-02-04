import { daysSince, formatDate } from "@/lib/date";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import PulseHeart from "@/components/PulseHeart";
import { Calendar } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const StatusBadge = ({ label }: { label: string }) => (
  <View className="self-start px-3 py-1 rounded-full bg-primary/15 mb-3">
    <Text className="text-primary text-xs font-semibold">{label}</Text>
  </View>
);

const TogetherSinceCard = ({ pair, meId, onPropose, onConfirm }: any) => {
  const [open, setOpen] = useState(false);

  const confirmed = pair?.relationshipStartDateConfirmed;
  const pending = pair?.relationshipStartDatePending;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="bg-card rounded-3xl p-5 mt-8 flex-row justify-between items-center"
      >
        <View className="flex-row gap-3 items-center">
          <View className="bg-muted p-3 rounded-xl">
            <Calendar size={18} color="#8a8075" />
          </View>

          <View>
            <Text className="text-mutedForeground text-sm">Together since</Text>
            <Text className="text-foreground font-medium">
              {confirmed
                ? formatDate(pair.relationshipStartDate)
                : pending
                  ? `${formatDate(pair.relationshipStartDatePending)}`
                  : "Tap to set"}
            </Text>
          </View>
        </View>
        {confirmed && (
          <View className="flex-col items-center">
            <Text className="text-primary font-semibold text-lg">
              {daysSince(pair.relationshipStartDate)}
            </Text>
            <Text className="text-mutedForeground text-sm">days</Text>
          </View>
        )}
        {pending && <StatusBadge label="Pending" />}
      </Pressable>

      <TogetherSinceSheet
        open={open}
        onClose={() => setOpen(false)}
        pair={pair}
        meId={meId}
        onPropose={onPropose}
        onConfirm={onConfirm}
      />
    </>
  );
};

const TogetherSinceSheet = ({
  open,
  onClose,
  pair,
  meId,
  onPropose,
  onConfirm,
}: any) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  //   const snapPoints = useMemo(() => ["20%"], []);
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
  const [saving, setSaving] = useState(false);
  const togglePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const snapPoints = useMemo(
    () => (showPicker ? ["68%"] : proposedByMe ? ["28%"] : ["35%"]),
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
            <Text className="text-lg font-semibold text-center">
              Your journey together since
            </Text>

            <Text className="mt-2 text-mutedForeground text-center text-s">
              This date is locked after both confirmed
            </Text>

            {/* Highlighted date */}
            <View className="mt-5 items-center">
              <View className="px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Text className="text-xl font-semibold text-primary text-center">
                  {formatDate(pair.relationshipStartDate)}
                </Text>
              </View>

              <Text className="mt-3 text-sm text-mutedForeground">
                {daysSince(pair.relationshipStartDate)} days together
              </Text>
            </View>
          </View>
        )}

        {!confirmed && !pending && (
          <>
            <Text className="text-lg font-semibold">Set your start date</Text>

            <Pressable
              className="bg-primary rounded-xl py-4 mt-4"
              onPress={togglePicker}
            >
              <Text className="text-center text-white">
                {showPicker ? "Hide calendar" : "Pick a date"}
              </Text>
            </Pressable>
            <Pressable
              disabled={saving}
              className="bg-primary rounded-xl py-4 mt-3 flex-row justify-center"
              onPress={() => handlePropose(new Date())}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white">Use today</Text>
              )}
            </Pressable>
          </>
        )}

        {pending && proposedByMe && (
          <>
            {/* <Text className="text-lg font-semibold">
              Waiting for confirmation
            </Text> */}

            <Text className="text-mutedForeground mt-2">
              You proposed {formatDate(pair.relationshipStartDatePending)}
            </Text>

            <Pressable
              disabled={saving}
              className="bg-primary rounded-xl  py-4 mt-4"
              onPress={togglePicker}
            >
              {saving ? (
                <View className="items-center justify-center flex-row">
                  <ActivityIndicator color="white" />
                  <Text className="text-white text-lg font-medium ml-3">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-white">
                  {showPicker ? "Cancel change" : "Change date"}
                </Text>
              )}
            </Pressable>
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
                className="bg-primary rounded-xl py-4 mt-5 flex-row justify-center"
                onPress={handleConfirm}
              >
                {saving ? (
                  <View className="items-center justify-center flex-row">
                    <ActivityIndicator color="white" />
                    <Text className="text-white text-lg font-medium ml-3">
                      Confirming...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white">Confirm date</Text>
                )}
              </Pressable>
            </Animated.View>
          </>
        )}

        {/* DATE PICKER */}
        {showPicker && (
          <View className="mt-4">
            {hasPendingDate && (
              <Text className="text-xs text-mutedForeground mb-2">
                Showing proposed month
              </Text>
            )}

            <View className="rounded-2xl overflow-hidden">
              <RNCalendar
                current={calendarInitialKey}
                maxDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day) => {
                  const picked = new Date(day.timestamp);
                  setDate(picked);
                  handlePropose(picked);
                }}
                markedDates={markedDates}
              />
            </View>
          </View>
        )}

        {showPicker && (
          <Pressable
            onPress={() => setShowPicker(false)}
            className="mt-3 py-3 rounded-xl bg-muted"
          >
            <Text className="text-center text-mutedForeground">Cancel</Text>
          </Pressable>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TogetherSinceCard;
