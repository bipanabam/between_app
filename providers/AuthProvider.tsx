import { account, ensureUserDocument } from "@/lib/appwrite";
import { UserDocument } from "@/types/type";
import React, { createContext, useContext, useEffect, useState } from "react";

type AppStatus =
  | "loading"
  | "unauthenticated"
  | "needsProfile"
  | "needsPairing"
  | "ready";

type AuthContextType = {
  loading: boolean;
  isAuthenticated: boolean;
  user?: UserDocument | null;
  refreshUser: () => Promise<void>;
  status: AppStatus;
};

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthenticated: false,
  user: null,
  refreshUser: async () => {},
  status: "loading",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AppStatus>("loading");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDocument | null>(null);

  const computeStatus = (
    isAuthenticated: boolean,
    user?: UserDocument | null,
  ): AppStatus => {
    if (!isAuthenticated) return "unauthenticated";

    if (!user?.passcodeHash || !user?.nickname) {
      return "needsProfile";
    }

    if (!user?.pairId) {
      return "needsPairing";
    }

    return "ready";
  };

  const bootstrap = async () => {
    try {
      await account.get();
      const userDoc = await ensureUserDocument();
      console.log(userDoc);

      setUser(userDoc as UserDocument);
      setIsAuthenticated(true);

      setStatus(computeStatus(true, userDoc));
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      setStatus("unauthenticated");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const userDoc = await ensureUserDocument();
    setUser(userDoc as UserDocument);
    setStatus(computeStatus(true, userDoc));
  };

  useEffect(() => {
    bootstrap();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated,
        user,
        refreshUser,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
