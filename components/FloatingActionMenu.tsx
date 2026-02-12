import React, { useEffect, useState } from "react";
import {
    Animated,
    Pressable,
    StyleProp,
    Text,
    ViewStyle
} from "react-native";

export interface FloatingActionItem {
  label: string;
  onPress: () => void;
}

interface Props {
  items: FloatingActionItem[];
  bottom?: number;
  right?: number;
  fabStyle?: StyleProp<ViewStyle>;
}

const FloatingActionMenu = ({
  items,
  bottom = 20,
  right = 20,
  fabStyle,
}: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: showMenu ? 1 : 0,
      useNativeDriver: true,
      stiffness: 260,
      damping: 20,
    }).start();
  }, [showMenu]);

  const handleItemPress = (action: () => void) => {
    // Close menu first
    setShowMenu(false);

    // Animate closure smoothly before triggering action
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      action(); // Trigger the actual action after menu is closed
    });
  };

  return (
    <>
      {/* Backdrop */}
      {showMenu && (
        <Pressable
          onPress={() => setShowMenu(false)}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 20,
          }}
        />
      )}

      {/* Action Items */}
      <Animated.View
        pointerEvents={showMenu ? "auto" : "none"}
        style={{
          position: "absolute",
          bottom: bottom + 40,
          right,
          zIndex: 30,
          opacity: scaleAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => handleItemPress(item.onPress)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              marginBottom: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text style={{ color: "#333", fontSize: 14 }}>{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* FAB */}
      <Pressable
        onPress={() => setShowMenu((v) => !v)}
        style={[
          {
            position: "absolute",
            bottom,
            right,
            zIndex: 40,
            borderRadius: 999,
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          },
          fabStyle,
        ]}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "45deg"],
                }),
              },
            ],
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
            +
          </Text>
        </Animated.View>

        {!showMenu && <Text style={{ color: "white", fontSize: 12 }}>Add</Text>}
      </Pressable>
    </>
  );
};

export default FloatingActionMenu;
