import {
  account,
  ensurePairDocument,
  ensureUserDocument,
} from "@/lib/appwrite";
import { PairDocument, UserDocument } from "@/types/type";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";

type AppStatus =
  | "loading"
  | "unauthenticated"
  | "needsProfile"
  | "needsPairing"
  | "pairingInProgress"
  | "ready"
  | "locked";

type AuthContextType = {
  loading: boolean;
  isAuthenticated: boolean;
  user?: UserDocument | null;
  refreshUser: () => Promise<void>;
  lockApp: () => void;
  unlockApp: () => Promise<void>;
  status: AppStatus;
};

const computeStatus = (
  isAuthenticated: boolean,
  user?: UserDocument | null,
  pair?: PairDocument | null,
  isLocked?: boolean,
): AppStatus => {
  if (!isAuthenticated) return "unauthenticated";

  // User must finish onboarding first
  if (!user?.passcodeHash || !user?.nickname) {
    return "needsProfile";
  }

  // Lock only applies if passcode exists
  if (isLocked && user?.passcodeHash) return "locked";

  if (!user?.pairId) {
    return "needsPairing";
  }
  // Pair exists but partner missing
  if (pair && !pair.partnerTwo) {
    return "pairingInProgress";
  }

  return "ready";
};

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthenticated: false,
  user: null,
  refreshUser: async () => {},
  lockApp: () => {},
  unlockApp: async () => {},
  status: "loading",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDocument | null>(null);
  const [pair, setPair] = useState<PairDocument | null>(null);
  const status = computeStatus(isAuthenticated, user, pair, isLocked);
  const router = useRouter();

  const lockApp = () => {
    setIsLocked(true);
  };

  const unlockApp = async () => {
    setIsLocked(false);
  };

  const bootstrap = async () => {
    try {
      await account.get();
      const userDoc = await ensureUserDocument();

      setUser(userDoc as UserDocument);
      setIsAuthenticated(true);

      // preload passcode hash locally
      if (userDoc.passcodeHash) {
        await SecureStore.setItemAsync(
          "between_passcode_hash",
          userDoc.passcodeHash,
        );
        setIsLocked(true);
      }

      const pairDoc = await ensurePairDocument();
      if (pairDoc) {
        setPair(pairDoc as PairDocument);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setBootstrapped(true);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const userDoc = await ensureUserDocument();
    setUser(userDoc as UserDocument);
    // keep SecureStore synced
    if (userDoc.passcodeHash) {
      await SecureStore.setItemAsync(
        "between_passcode_hash",
        userDoc.passcodeHash,
      );
    }
    // Also refresh pair
    const pairDoc = await ensurePairDocument();
    setPair(pairDoc as PairDocument | null);
  };

  useEffect(() => {
    bootstrap();
  }, []);

  // Detect App Background/Resume
  useEffect(() => {
    let previousState = AppState.currentState;

    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        previousState.match(/inactive|background/) &&
        nextState === "active"
      ) {
        if (user?.passcodeHash) {
          setIsLocked(true);
        }
      }

      previousState = nextState;
      // console.log("APP STATE CHANGED", previousState, "→", nextState);
    });

    return () => sub.remove();
  }, [user?.passcodeHash]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated,
        user,
        refreshUser,
        status,
        lockApp,
        unlockApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
