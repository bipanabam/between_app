import { Text, View } from "react-native";
import ConversationStory from "./ConverstionStory";
import GrowthSentence from "./GrowthSentence";
import MemoryStory from "./MemoryStory";
import StoryHero from "./StoryHero";
import Timeline from "./Timeline";
import TimelineItem from "./TimelineItem";
import VoiceStory from "./VoiceStory";

const ChapterDivider = ({ title }: { title: string }) => (
  <View className="items-center my-12">
    <Text className="text-xs tracking-[3px] uppercase text-mutedForeground/40">
      {title}
    </Text>
    <View className="w-16 h-[1px] bg-mutedForeground/20 mt-3" />
  </View>
);

const StoryChapters = ({ pair, partner, me, stats }: any) => {
  return (
    <Timeline>
      {/* Beginning */}
      <TimelineItem>
        <StoryHero pair={pair} partner={partner} me={me} />
      </TimelineItem>

      {/* Chapters */}
      <TimelineItem>
        <ConversationStory stats={stats} />
      </TimelineItem>

      <TimelineItem>
        <MemoryStory stats={stats} />
      </TimelineItem>

      <TimelineItem>
        <VoiceStory stats={stats} />
      </TimelineItem>

      {/* Reflection (Last) */}
      <TimelineItem isLast>
        <GrowthSentence stats={stats} />
      </TimelineItem>
    </Timeline>
  );
};

export default StoryChapters;
