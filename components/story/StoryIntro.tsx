import { Text, View } from "react-native";
import StoryHero from "./StoryHero";
import StoryReveal from "./StoryReveal";

const StoryIntro = ({ pair, partner, me }: any) => {
  return (
    <View>
      <View className="px-8 pt-16 pb-10">
        <Text className="text-4xl font-light tracking-tight text-foreground">
          Your Story
        </Text>

        <Text className="text-mutedForeground mt-3 text-base leading-relaxed">
          Not just messages. Not just moments.
          <Text className="italic"> A life slowly unfolding.</Text>
        </Text>

        <Text className="text-5xl font-light tracking-tight mt-12 opacity-70">
          {new Date(pair.relationshipStartDate).getFullYear()}
        </Text>
      </View>

      <Text className="text-center text-xs text-mutedForeground/50 mt-2">
        This is the story you’ve been writing together
      </Text>

      <StoryReveal delay={0}>
        <StoryHero pair={pair} partner={partner} me={me} />
      </StoryReveal>
    </View>
  );
};

export default StoryIntro;
