import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";
import React from "react";

// Authenticated but not paired
const _PairingLayout = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user?.passcodeHash || !user?.nickname) {
    return <Redirect href="/(auth)/sign-up" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ animation: "fade" }} />
      <Stack.Screen name="invite" options={{ animation: "fade" }} />
      <Stack.Screen name="enter-code" options={{ animation: "fade" }} />
    </Stack>
  );
};

export default _PairingLayout;
