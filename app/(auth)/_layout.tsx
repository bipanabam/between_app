import { Redirect, Stack } from "expo-router";
import React, { useState } from "react";

const _AuthLayout = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <Redirect href="/(tabs)" />;
  }

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
