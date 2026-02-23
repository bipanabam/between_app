import { formatDate, isAnniversary } from "@/lib/date";
import { PairDocument, UserDocument } from "@/types/type";
import { Text, View } from "react-native";
import PulseHeart from "../PulseHeart";

type Props = {
  pair: PairDocument;
  partner: UserDocument;
  me: UserDocument;
};

const StoryHero = ({ pair, partner, me }: Props) => {
  const start = pair.relationshipStartDate ?? pair.pairFormedAt;
  const anniversary = isAnniversary(pair.relationshipStartDate);

  return (
    <View className="bg-background rounded-3xl p-6 shadow-md border border-border items-center">
      {/* Anniversary Badge */}
      {anniversary && (
        <Text className="text-xs mb-2 text-amber-500 font-medium tracking-wide">
          ✨ Anniversary Day
        </Text>
      )}

      <View className="bg-primary/15 p-3 rounded-full mb-4">
        <PulseHeart active />
      </View>

      <Text className="text-sm text-mutedForeground text-center">
        {partner.nickname} & {me.nickname}
      </Text>

      <Text className="text-2xl font-semibold text-primary mt-1 text-center">
        {start ? formatDate(start) : "Recently"}
      </Text>

      <Text className="text-mutedForeground mt-3 text-center leading-6">
        A space you’ve been quietly building together.
      </Text>

      <Text className="text-mutedForeground/60 text-center mt-2 text-xs italic">
        Still being written ✨
      </Text>
    </View>
  );
};

export default StoryHero;
