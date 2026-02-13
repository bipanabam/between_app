import { moodGroups } from "@/constant/moodGoups";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";

export type MoodItem = {
  emoji: string;
  label: string;
};

type Props = {
  isOpen: boolean;
  onSelect: (mood: MoodItem) => void;
  onClose: () => void;
};

const MoodBottomSheet = ({ isOpen, onSelect, onClose }: Props) => {
  const ref = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["70%"], []);

  // open / close control
  React.useEffect(() => {
    if (isOpen) ref.current?.present();
    else ref.current?.dismiss();
  }, [isOpen]);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} opacity={0.2} disappearsOnIndex={-1} />
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backgroundStyle={{
        borderRadius: 28,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#d4c4c7",
        width: 48,
      }}
    >
      <View className="px-6 pb-8">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground">
            How are you feeling?
          </Text>
          <Text className="text-sm text-mutedForeground/70 mt-1">
            Share a quiet signal
          </Text>
        </View>

        {/* Mood groups */}
        {moodGroups.map((group) => (
          <View key={group.label} className="mb-5">
            <Text className="text-xs text-mutedForeground/50 mb-2 ml-1">
              {group.label}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {group.moods.map((mood) => (
                <Pressable
                  key={mood.label}
                  onPress={() => onSelect(mood)}
                  className="w-[22%] aspect-square rounded-2xl bg-muted/40 items-center justify-center p-2"
                >
                  <Text style={{ fontSize: 26 }}>{mood.emoji}</Text>
                  <Text className="text-[10px] text-mutedForeground/60 mt-1 text-center">
                    {mood.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Footer microcopy */}
        <Text className="text-center text-xs text-mutedForeground/40 mt-2">
          They’ll see this on your avatar
        </Text>
      </View>
    </BottomSheetModal>
  );
};

export default MoodBottomSheet;
