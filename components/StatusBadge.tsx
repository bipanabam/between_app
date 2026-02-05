import { Text, View } from "react-native";

const StatusBadge = ({ label }: { label: string }) => (
  <View className="self-start px-3 py-1 rounded-full bg-primary/15 mb-2">
    <Text className="text-primary text-xs font-semibold">{label}</Text>
  </View>
);

export default StatusBadge;
