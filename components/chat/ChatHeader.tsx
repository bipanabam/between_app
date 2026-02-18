import { Animated, Image, Text, View } from "react-native";

const ChatHeader = ({ name, status, online, avatar, color }: any) => {
  return (
    <View className="flex-row items-center px-4 py-3 gap-3">
      {/* Avatar */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          borderWidth: 2,
          borderColor: color + "33",
          backgroundColor: color + "11",
        }}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-7 h-7 rounded-full" />
        ) : (
          <View className="w-7 h-7 rounded-full bg-white items-center justify-center">
            <Text>👤</Text>
          </View>
        )}

        {/* presence dot */}
        <Animated.View
          style={{ opacity: online ? 1 : 0.7 }}
          className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white ${
            online ? "bg-emerald-400" : "bg-gray-400"
          }`}
        />
      </View>

      {/* Text block */}
      <View className="flex-1 justify-center">
        <Text className="font-semibold text-base text-foreground">{name}</Text>

        <Text className="text-mutedForeground/60 text-sm">{status}</Text>
      </View>
    </View>
  );
};

export default ChatHeader;
