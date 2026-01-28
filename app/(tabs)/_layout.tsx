import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

// Authenticated and paired
const TabIcon = ({ focused, name, title }: any) => {
  return (
    <View className="flex-1 px-1">
      {focused ? (
        <View className="flex-row h-14 w-full min-w-[120px] items-center justify-center rounded-2xl bg-muted">
          <Feather name={name} size={22} color="#bc8f97" />
          <Text className="text-primary text-base ml-2">{title}</Text>
        </View>
      ) : (
        <View className="flex-row min-w-[45px] h-14 items-center justify-center rounded-2xl">
          <Feather name={name} size={20} color="#8a8075" />
          <Text className="text-mutedForeground text-base ml-2">{title}</Text>
        </View>
      )}
    </View>
  );
};

const _Layout = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <Redirect href="/(pairing)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          flexDirection: "row",
          borderRadius: 16,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 60,
          position: "absolute",
          backgroundColor: "#f7f5f2",
          paddingHorizontal: 4,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarInactiveTintColor: "#6A7C75",
        tabBarActiveTintColor: "#bc8f97",
      }}
    >
      <Tabs.Screen
        name="between"
        options={{
          title: "Between",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="users" title="Between" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="message-circle" title="Chat" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
