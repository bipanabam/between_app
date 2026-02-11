import { CycleConfig } from "@/types/type";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CycleConfig) => void;
  initial?: CycleConfig;
  saving?: boolean;
};

const offsetOptions = [
  { label: "2 days before", value: -2 },
  { label: "Start day", value: 0 },
  { label: "2 days after", value: 2 },
];

const CycleSetupSheet = ({
  isOpen,
  onClose,
  onSave,
  initial,
  saving,
}: Props) => {
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["95%"], []);

  const [enabled, setEnabled] = useState(initial?.isEnabled ?? true);
  const [length, setLength] = useState(initial?.avgCycleLength ?? 28);
  const [offsets, setOffsets] = useState<number[]>(
    initial?.offsets ?? [-2, 0, 2],
  );
  const [notifyPartner, setNotifyPartner] = useState(
    initial?.notifyPartner ?? true,
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [lastStartDate, setLastStartDate] = useState<Date>(
    initial?.lastStartDate ? new Date(initial.lastStartDate) : new Date(),
  );

  useEffect(() => {
    if (isOpen) ref.current?.present();
    else ref.current?.dismiss();
  }, [isOpen]);

  const toggleOffset = (v: number) => {
    setOffsets((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.3} />
  );

  /** Generate marked dates for calendar (selected + offsets) */
  const markedDates: Record<string, any> = {};
  const baseDate = dayjs(lastStartDate);
  const baseKey = baseDate.format("YYYY-MM-DD");

  markedDates[baseKey] = {
    selected: true,
    selectedColor: "#bc8f97",
    marked: offsets.includes(0),
    dotColor: "#FBBF24",
  };

  offsets.forEach((o) => {
    if (o === 0) return; // skip

    const d = baseDate.add(o, "day").format("YYYY-MM-DD");

    markedDates[d] = {
      marked: true,
      dotColor: "#FBBF24",
    };
  });

  return (
    <>
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#d4c4c7", width: 48 }}
        backgroundStyle={{ borderRadius: 28, backgroundColor: "#f5f5f5" }}
        enableDynamicSizing={false}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-medium text-foreground/80">
              Gentle cycle care
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
              className="p-1"
            >
              <X size={22} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Enable */}
          <View className="mb-5 flex-row justify-between items-center">
            <Text className="text-md text-mutedForeground font-normal">
              Enable remainders
            </Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              disabled={saving}
            />
          </View>

          {/* Length */}
          <Text className="text-md text-mutedForeground mb-2 font-normal">
            Cycle length (days)
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {[26, 28, 30].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setLength(d)}
                className={`gap-1.5 px-3.5 py-2.5 rounded-full ${
                  length === d ? "bg-primary/40" : "bg-accent/80"
                }`}
              >
                <Text
                  className={`${length === d ? "text-foreground" : "text-mutedForeground/80"}`}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Last start date */}
          <Text className="text-xs text-gray-400 mb-2 font-normal">
            Last cycle start
          </Text>
          <View className="mb-2 bg-white rounded-2xl overflow-hidden shadow-sm">
            <View style={{ height: 300 }}>
              <Calendar
                current={lastStartDate.toISOString().split("T")[0]}
                minDate={dayjs().subtract(2, "year").format("YYYY-MM-DD")}
                maxDate={dayjs().add(1, "year").format("YYYY-MM-DD")}
                onDayPress={(day: { dateString: string }) => {
                  setLastStartDate(new Date(day.dateString));
                }}
                markedDates={markedDates}
                theme={{
                  todayTextColor: "#F43F5E",
                  arrowColor: "#F43F5E",
                  monthTextColor: "#111827",
                  textDayFontFamily: "System",
                  textMonthFontWeight: "600",

                  textDayFontSize: 14,
                  textDayHeaderFontSize: 12,
                  textMonthFontSize: 15,
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center gap-4 mt-1 mb-4">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-full bg-primary" />
              <Text className="text-xs text-mutedForeground">Cycle start</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-amber-400" />
              <Text className="text-xs text-mutedForeground">
                Care reminder
              </Text>
            </View>
          </View>

          {/* Offsets */}
          <Text className="text-md text-mutedForeground mb-2 font-normal">
            Care reminder days
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {offsetOptions.map((o) => {
              const active = offsets.includes(o.value);
              return (
                <TouchableOpacity
                  key={o.value}
                  onPress={() => toggleOffset(o.value)}
                  className={`gap-1.5 px-3.5 py-2.5 rounded-full ${
                    active ? "bg-primary/40" : "bg-accent/80"
                  }`}
                >
                  <Text
                    className={`${active ? "text-foreground" : "text-mutedForeground/80"}`}
                  >
                    {o.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Partner notify */}
          <View className="mb-5 flex-row justify-between items-center">
            <Text className="text-md text-mutedForeground mb-2 font-normal">
              Notify partner
            </Text>
            <Switch
              value={notifyPartner}
              onValueChange={setNotifyPartner}
              disabled={saving}
            />
          </View>
          <TouchableOpacity
            disabled={saving}
            onPress={() =>
              onSave({
                isEnabled: enabled,
                avgCycleLength: length,
                offsets,
                notifyPartner,
                lastStartDate: lastStartDate.toISOString(),
              })
            }
            className={`rounded-full py-4 items-center justify-center ${
              saving ? "bg-primary/60" : "bg-primary"
            }`}
          >
            {saving ? (
              <View className="flex-row gap-2 items-center">
                <Text className="text-white font-medium">Saving</Text>

                <ActivityIndicator color="white" />
              </View>
            ) : (
              <Text className="text-white font-medium">Save care setup</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetModal>
    </>
  );
};

export default CycleSetupSheet;
