import { useAuth } from "@/providers/AuthProvider";
import { Redirect } from "expo-router";

const Index = () => {
  const { loading, status } = useAuth();

  if (loading) return null;

  switch (status) {
    case "unauthenticated":
      return <Redirect href="/(auth)/sign-up" />;

    case "needsProfile":
      return <Redirect href="/(auth)/sign-up" />;

    case "needsPairing":
      return <Redirect href="/(pairing)" />;

    case "ready":
      return <Redirect href="/(tabs)/between" />;
    default:
      return null;
  }
};

export default Index;
