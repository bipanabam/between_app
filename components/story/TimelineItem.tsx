import { View } from "react-native";

const TimelineItem = ({
  children,
  isLast = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) => {
  return (
    <View className={`flex-row ${isLast ? "mb-6" : "mb-12"}`}>
      {/* Left side (dot + connector) */}
      <View className="w-10 items-center mr-4">
        {/* Dot */}
        <View
          className={`w-3 h-3 rounded-full ${
            isLast ? "border-2 border-primary bg-white scale-110" : "bg-primary"
          }`}
        />
        {/* Connector (only if not last) */}
        {!isLast && <View className="flex-1 w-px bg-primary/40 mt-2" />}
      </View>

      {/* Right side (content) */}
      <View className="flex-1 pr-4">{children}</View>
    </View>
  );
};

export default TimelineItem;
