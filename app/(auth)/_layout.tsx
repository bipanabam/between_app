import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";
import React from "react";

const _AuthLayout = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user?.passcodeHash && user?.nickname) {
    return <Redirect href="/(pairing)" />;
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
