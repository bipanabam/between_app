import { Stack } from "expo-router";
import React from "react";

// Authenticated but not paired
const _PairingLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ animation: "fade" }} />
      <Stack.Screen name="invite" options={{ animation: "fade" }} />
      <Stack.Screen name="enter-code" options={{ animation: "fade" }} />
      <Stack.Screen name="success" options={{ animation: "fade" }} />
    </Stack>
  );
};

export default _PairingLayout;
