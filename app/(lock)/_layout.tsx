import { Stack } from "expo-router";
import React from "react";

// Authenticated but not paired
const _LockLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ animation: "fade" }} />
    </Stack>
  );
};

export default _LockLayout;
