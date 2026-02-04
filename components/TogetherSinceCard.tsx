import { daysSince, formatDate } from "@/lib/date";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Calendar } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";

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

        <Text className="text-primary font-semibold">
          {confirmed
            ? `${daysSince(pair.relationshipStartDate)} days`
            : pending
              ? "Pending confirmation"
              : ""}
        </Text>
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

  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleConfirm = async () => {
    try {
      setSaving(true);
      await onConfirm();
      onClose();
    } finally {
      setSaving(false);
    }
  };
  const snapPoints = useMemo(() => {
    if (showPicker) {
      return ["65%"];
    }
    return ["20%"];
  }, [showPicker]);

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
      <BottomSheetView className="px-6 pb-10">
        {confirmed && (
          <>
            <Text className="text-lg font-semibold">Relationship date</Text>
            <Text className="mt-2 text-mutedForeground">
              Locked after both confirmed 💞
            </Text>
            <Text className="mt-3 font-medium">
              {formatDate(pair.relationshipStartDate)}
            </Text>
          </>
        )}

        {!confirmed && !pending && (
          <>
            <Text className="text-lg font-semibold">Set your start date</Text>

            <Pressable
              className="bg-primary rounded-xl py-4 mt-4"
              onPress={() => setShowPicker(true)}
            >
              <Text className="text-center">Pick a date</Text>
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
            <Text className="text-lg font-semibold">
              Waiting for confirmation
            </Text>

            <Text className="text-mutedForeground mt-2">
              You proposed {formatDate(pair.relationshipStartDatePending)}
            </Text>

            <Pressable
              disabled={saving || showPicker}
              className="bg-primary rounded-xl  py-4 mt-4"
              onPress={() => setShowPicker(true)}
            >
              {saving ? (
                <View className="items-center justify-center flex-row">
                  <ActivityIndicator color="white" />
                  <Text className="text-white text-lg font-medium ml-3">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-white">Change date</Text>
              )}
            </Pressable>
          </>
        )}

        {pending && !proposedByMe && (
          <>
            <Text className="text-lg font-semibold">
              Confirm your start date
            </Text>

            <Text className="mt-2">
              {formatDate(pair.relationshipStartDatePending)}
            </Text>

            <Pressable
              disabled={saving}
              className="bg-primary rounded-xl py-4 mt-4 flex-row justify-center"
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
          </>
        )}

        {/* DATE PICKER */}
        {/* {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            maximumDate={new Date()}
            onChange={(e, selected) => {
              if (Platform.OS === "android") {
                setShowPicker(false);
              }
              // ONLY proceed if user confirmed
              if (e.type === "set" && selected) {
                setDate(selected);
                handlePropose(selected);
              }
            }}
          />
        )} */}
        {showPicker && (
          <View className="mt-4 rounded-2xl overflow-hidden">
            <RNCalendar
              maxDate={new Date().toISOString().split("T")[0]}
              onDayPress={(day) => {
                const picked = new Date(day.timestamp);
                setDate(picked);
                handlePropose(picked);
              }}
              markedDates={{
                [date.toISOString().split("T")[0]]: {
                  selected: true,
                  selectedColor: "#8a8075",
                },
              }}
            />
          </View>
        )}

        {/* <Pressable
          disabled={saving}
          onPress={handleClose}
          className="mt-4 rounded-xl bg-muted py-4"
        >
          <Text className="text-center text-mutedForeground">Close</Text>
        </Pressable> */}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TogetherSinceCard;
