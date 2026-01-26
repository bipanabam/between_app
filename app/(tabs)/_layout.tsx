import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

const TabIcon = ({ focused, name }: any) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
    }}
  >
    <Feather
      name={name}
      size={focused ? 24 : 22}
      color={focused ? "#7FAE9A" : "#6A7C75"}
    />
  </View>
);

const _Layout = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          backgroundColor: "#e9e6e2",
          borderColor: "#1F2D28",
        },
      }}
    >
      <Tabs.Screen
        name="between"
        options={{
          title: "Between",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="users" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="message-circle" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
