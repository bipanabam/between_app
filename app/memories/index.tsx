import MemoryCard from "@/components/memories/MemoryCard";
import { getAllMoments } from "@/lib/appwrite";
import { MomentsDocument } from "@/types/type";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

interface MonthSection {
  year: string;
  month: string;
  data: MomentsDocument[];
}

const buildSections = (moments: MomentsDocument[]): MonthSection[] => {
  const map: Record<string, Record<string, MomentsDocument[]>> = {};

  moments.forEach((m) => {
    const date = new Date(m.momentDate);

    const year = date.getUTCFullYear().toString();
    const monthIndex = date.getUTCMonth();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[monthIndex];

    if (!map[year]) map[year] = {};
    if (!map[year][month]) map[year][month] = [];

    map[year][month].push(m);
  });

  const sections: MonthSection[] = [];

  Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .forEach(([year, months]) => {
      Object.entries(months)
        .sort(
          (a, b) =>
            new Date(b[1][0].momentDate).getTime() -
            new Date(a[1][0].momentDate).getTime(),
        )
        .forEach(([month, items]) => {
          sections.push({
            year,
            month,
            data: items.sort(
              (a, b) =>
                new Date(b.momentDate).getTime() -
                new Date(a.momentDate).getTime(),
            ),
          });
        });
    });

  return sections;
};

const Memories = () => {
  const [moments, setMoments] = useState<MomentsDocument[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      const all = await getAllMoments();
      setMoments(all);
    };
    load();
  }, []);

  const sections = useMemo(() => buildSections(moments), [moments]);
  const topYear = sections.length > 0 ? sections[0].year : null;

  return (
    <LinearGradient colors={["#FDFBFF", "#F3E8FF"]} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <Animated.SectionList
          sections={sections}
          keyExtractor={(item) => item.$id}
          stickySectionHeadersEnabled // Month sticky
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="px-8 pt-16 pb-8">
              <Text className="text-4xl font-light tracking-tight text-black">
                Memory Lane
              </Text>
              <Text className="text-black/40 mt-3 text-base leading-relaxed">
                A quiet walk through your shared story.
              </Text>
              {topYear && (
                <Text className="text-5xl font-light tracking-tight text-black/80 mt-10">
                  {topYear}
                </Text>
              )}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.6)",
              }}
              className="px-8 py-4"
            >
              <Text className="text-xs tracking-[3px] uppercase text-black/50">
                {section.month}
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <View className="flex-row px-6">
              <View className="items-center mr-4">
                <View className="w-2 h-2 rounded-full bg-black/40 mt-6" />
                <View className="flex-1 w-px bg-black/10 mt-2" />
              </View>

              <View className="flex-1">
                <MemoryCard index={index} moment={item} scrollY={scrollY} />
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Memories;
