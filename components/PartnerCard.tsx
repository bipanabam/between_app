import { Text, View } from "react-native";

const PartnerCard = ({ name, status, emoji, mood, color }: any) => {
  return (
    <View className="items-center">
      <View
        className="w-24 h-24 rounded-full items-center justify-center"
        style={{
          borderWidth: 2,
          borderColor: color + "33",
          backgroundColor: color + "11",
        }}
      >
        <Text style={{ fontSize: 30 }}>{emoji}</Text>
        {/* {avatar ? (
          <Image source={{ uri: avatar }} className="w-14 h-14 rounded-full" />
        ) : (
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Text>👤</Text>
          </View>
        )} */}

        {/* presence dot */}
        <View className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
      </View>

      <Text className="mt-4 font-medium text-foreground">{name}</Text>
      <Text style={{ fontSize: 20 }}>{mood}</Text>
      <Text className="text-mutedForeground/50 text-sm mt-1">{status}</Text>
    </View>
  );
};

export default PartnerCard;
