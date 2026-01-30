import { Stack } from "expo-router";
import React from "react";

const _AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-up" options={{ animation: "fade" }} />
    </Stack>
  );
};

export default _AuthLayout;
