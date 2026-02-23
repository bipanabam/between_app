import { Text, View } from "react-native";
import RelationshipClockCounter from "./RelationshipClockCounter";
import StoryReveal from "./StoryReveal";

const StoryTimeline = ({ pair }: any) => {
  return (
    <View className="my-5">
      <Text className="text-center text-mutedForeground/60 mt-5 mb-3">
        Your story so far ✨
      </Text>

      <StoryReveal delay={120}>
        <RelationshipClockCounter pair={pair} />
      </StoryReveal>
    </View>
  );
};

export default StoryTimeline;
