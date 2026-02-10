import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CycleConfig) => void;
  initial?: CycleConfig;
};

export type CycleConfig = {
  isEnabled: boolean;
  lastStartDate: string | null;
  avgCycleLength: number;
  offsets: number[];
  notifyPartner: boolean;
};

const offsetOptions = [
  { label: "2 days before", value: -2 },
  { label: "Start day", value: 0 },
  { label: "2 days after", value: 2 },
];

const CycleSetupSheet = ({ isOpen, onClose, onSave, initial }: Props) => {
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%"], []);

  const [enabled, setEnabled] = useState(initial?.isEnabled ?? true);
  const [length, setLength] = useState(initial?.avgCycleLength ?? 28);
  const [offsets, setOffsets] = useState<number[]>(
    initial?.offsets ?? [-2, 0, 2],
  );
  const [notifyPartner, setNotifyPartner] = useState(
    initial?.notifyPartner ?? true,
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

  return (
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
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-medium text-foreground/80">
            Gentle cycle care
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Enable */}
        <View className="mb-6 flex-row justify-between items-center">
          <Text className="text-md text-mutedForeground mb-2 font-normal">
            Enable care support
          </Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>

        {/* Length */}
        <Text className="text-md text-mutedForeground mb-2 font-normal">
          Cycle length (days)
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
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
        <View className="mb-8 flex-row justify-between items-center">
          <Text className="text-md text-mutedForeground mb-2 font-normal">
            Notify partner
          </Text>
          <Switch value={notifyPartner} onValueChange={setNotifyPartner} />
        </View>

        <TouchableOpacity
          onPress={() =>
            onSave({
              isEnabled: enabled,
              avgCycleLength: length,
              offsets,
              notifyPartner,
              lastStartDate: new Date().toISOString(),
            })
          }
          className="bg-primary rounded-full py-4"
        >
          <Text className="text-white text-center font-medium">
            Save care setup
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  );
};

export default CycleSetupSheet;
