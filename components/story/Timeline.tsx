import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

const Timeline = ({ children }: { children: React.ReactNode }) => {
  return (
    <View className="relative px-6 my-6">
      {children}

      {/* Bottom fade */}
      <LinearGradient
        colors={["transparent", "#F8F2F4"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
        }}
        pointerEvents="none"
      />
    </View>
  );
};

export default Timeline;
