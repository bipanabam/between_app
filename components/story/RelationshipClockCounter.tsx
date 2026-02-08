import { PairDocument } from "@/types/type";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";

function diffFromElapsed(elapsedSec: number) {
  const days = Math.floor(elapsedSec / 86400);
  const hours = Math.floor((elapsedSec % 86400) / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const seconds = elapsedSec % 60;
  return { days, hours, minutes, seconds };
}

const RelationshipClockCounter = ({ pair }: { pair: PairDocument }) => {
  const baseDate = pair.relationshipStartDate ?? pair.pairFormedAt ?? null;

  const startMs = useMemo(
    () => (baseDate ? new Date(baseDate).getTime() : null),
    [baseDate],
  );

  const [elapsed, setElapsed] = useState(() =>
    startMs ? Math.floor((Date.now() - startMs) / 1000) : 0,
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startMs) return;

    setElapsed(Math.floor((Date.now() - startMs) / 1000));

    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startMs]);

  const parts = useMemo(() => diffFromElapsed(elapsed), [elapsed]);

  if (!startMs) return null;

  return (
    <View className="items-center my-7">
      <Text className="text-xs text-mutedForeground mb-2">
        Growing side by side
      </Text>

      <Text className="text-5xl font-bold text-primary">{parts.days}</Text>

      <Text className="text-mutedForeground mb-4">days shared</Text>

      <View className="flex-row gap-6">
        <TimeBox label="hrs" value={parts.hours} />
        <TimeBox label="min" value={parts.minutes} />
        <TimeBox label="sec" value={parts.seconds} />
      </View>
      <Text className="text-xs text-mutedForeground/50 mt-4 text-center">
        Every second counts when it’s with the right person
      </Text>
    </View>
  );
};

const TimeBox = ({ value, label }: any) => (
  <View className="items-center bg-card px-4 py-3 rounded-xl min-w-[64px]">
    <Text className="text-lg font-semibold">
      {String(value).padStart(2, "0")}
    </Text>
    <Text className="text-xs text-mutedForeground mt-1">{label}</Text>
  </View>
);

export default RelationshipClockCounter;
