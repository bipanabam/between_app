import { formatDate } from "@/lib/date";
import { MomentsDocument } from "@/types/type";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ChevronRight } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

const LastMemoryCard = ({
  moment,
  onPress,
}: {
  moment: MomentsDocument | null;
  onPress: () => void;
}) => {
  if (!moment) {
    return (
      <View className="bg-background rounded-3xl p-6 mt-6 shadow-sm items-center">
        <Text className="text-mutedForeground text-sm">
          Your first memory is waiting ✨
        </Text>
        <Text className="text-xs text-mutedForeground/60 mt-2">
          Capture something meaningful today
        </Text>
      </View>
    );
  }

  const hasMedia = !!moment.mediaUrl;

  return (
    <Pressable
      onPress={onPress}
      className="mt-6 rounded-3xl bg-background overflow-hidden shadow-md"
      android_ripple={{ color: "rgba(0,0,0,0.08)" }}
      style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
    >
      <View className="flex-row justify-between px-5 pt-5">
        <View className="flex-row items-center gap-2">
          <View className="bg-muted p-2 rounded-xl">
            <Camera size={16} color="#8a8075" />
          </View>
          <Text className="text-mutedForeground text-base">Last memory</Text>
        </View>
        <ChevronRight size={18} color="#8a8075" />
      </View>
      {hasMedia ? (
        <View className="mt-4">
          <Image
            source={{ uri: moment.mediaUrl! }}
            style={{
              width: "100%",
              height: 260,
            }}
            resizeMode="cover"
          />

          {/* Soft bottom gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              justifyContent: "flex-end",
              padding: 20,
            }}
          >
            <Text className="text-white text-lg font-semibold">
              {moment.title}
            </Text>

            <Text className="text-white/80 text-xs mt-1">
              {formatDate(moment.momentDate)}
            </Text>
          </LinearGradient>
        </View>
      ) : (
        <View className="px-5 pb-5 pt-3">
          <Text className="text-foreground font-medium">{moment.title}</Text>
          <Text className="text-mutedForeground text-xs mt-1">
            {formatDate(moment.momentDate)}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default LastMemoryCard;
