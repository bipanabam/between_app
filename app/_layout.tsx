import "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

function RootLayoutNav() {
  const { loading, status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";
    const inPairing = segments[0] === "(pairing)";
    const inLock = segments[0] === "(lock)";
    const inReset = segments[0] === "(reset)";
    const inTabs = segments[0] === "(tabs)";

    switch (status) {
      case "unauthenticated":
      case "needsProfile":
        if (!inAuth) {
          router.replace("/(auth)/sign-up");
        }
        break;

      case "needsPairing":
        if (!inPairing) {
          router.replace("/(pairing)");
        }
        break;

      case "pairingInProgress":
        if (!inPairing) {
          router.replace("/(pairing)/invite");
        }
        break;

      case "locked":
        if (!inLock && !inReset) {
          router.replace("/(lock)");
        }
        break;

      case "ready":
        if (!inTabs) {
          router.replace("/(tabs)/between");
        }
        break;
    }
  }, [loading, status, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
