import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
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

      case "locked":
        if (!inLock) {
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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
