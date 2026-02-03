import { Stack } from "expo-router";
import React from "react";

{/* email + otp → passcode reset only */}
const _ResetLayout = () => {
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

export default _ResetLayout;
