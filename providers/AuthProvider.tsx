import {
  account,
  ensurePairDocument,
  ensureUserDocument,
  updateUser,
} from "@/lib/appwrite";
import { registerForPushToken } from "@/lib/push";
import { PairDocument, UserDocument } from "@/types/type";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  refreshUser: () => Promise<UserDocument | null>;
  lockApp: () => void;
  unlockApp: () => Promise<void>;
  status: AppStatus;
  temporarilyIgnoreAppLock: () => void;
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
  refreshUser: async () => null,
  lockApp: () => {},
  unlockApp: async () => {},
  status: "loading",
  temporarilyIgnoreAppLock: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDocument | null>(null);
  const [pair, setPair] = useState<PairDocument | null>(null);
  const status = computeStatus(isAuthenticated, user, pair, isLocked);
  const hasBootstrapped = useRef(false);

  const ignoreNextAppState = useRef(false);

  const lockApp = () => {
    setIsLocked(true);
  };

  const unlockApp = async () => {
    setIsLocked(false);
  };

  const temporarilyIgnoreAppLock = () => {
    ignoreNextAppState.current = true;
    setTimeout(() => (ignoreNextAppState.current = false), 500); // small buffer
  };

  const bootstrap = async () => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    try {
      const acc = await account.get();

      const userDoc = await ensureUserDocument();
      const pairDoc = await ensurePairDocument();

      setIsAuthenticated(true);
      setUser(userDoc as UserDocument);
      setPair(pairDoc as PairDocument | null);

      if (userDoc.passcodeHash) {
        await SecureStore.setItemAsync(
          "between_passcode_hash",
          userDoc.passcodeHash,
        );
        setIsLocked(true);
      }
    } catch (e) {
      // console.log("BOOTSTRAP FAILED — no session");
      setIsAuthenticated(false);
      setUser(null);
      setPair(null);
    } finally {
      setBootstrapped(true);
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<UserDocument | null> => {
    try {
      await account.get(); // verify session alive
      setIsAuthenticated(true);

      const userDoc = await ensureUserDocument();
      const pairDoc = await ensurePairDocument();

      setUser(userDoc);
      setPair(pairDoc);

      if (userDoc.passcodeHash) {
        await SecureStore.setItemAsync(
          "between_passcode_hash",
          userDoc.passcodeHash,
        );
      }

      return userDoc;
    } catch (e) {
      console.log("refreshUser failed — session lost");
      setIsAuthenticated(false);
      setUser(null);
      setPair(null);
      return null;
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  // useEffect(() => {
  //   console.log("AUTH STATUS →", status, {
  //     isAuthenticated,
  //     passcode: !!user?.passcodeHash,
  //     nickname: !!user?.nickname,
  //     pair: !!user?.pairId,
  //     locked: isLocked,
  //   });
  // }, [status]);

  // Detect App Background/Resume
  useEffect(() => {
    let previousState = AppState.currentState;

    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        previousState.match(/inactive|background/) &&
        nextState === "active"
      ) {
        if (
          !ignoreNextAppState.current &&
          user?.passcodeHash &&
          status === "ready"
        ) {
          setIsLocked(true);
        }
      }
      previousState = nextState;
    });

    return () => sub.remove();
  }, [user?.passcodeHash]);

  useEffect(() => {
    if (status !== "ready") return;

    async function setupPush() {
      const token = await registerForPushToken();
      if (!token) return;

      await updateUser({
        pushToken: token,
        lastActiveAt: new Date().toISOString(),
      });
    }

    setupPush();
  }, [status]);

  // HeartBeat for Partner Online Indicator
  useEffect(() => {
    if (!user) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const sendHeartbeat = () => {
      updateUser({
        lastActiveAt: new Date().toISOString(),
      });
    };

    const handleState = (state: string) => {
      if (state === "active") {
        sendHeartbeat(); // immediate
        interval = setInterval(sendHeartbeat, 120000); // every 2 min
      } else {
        if (interval) clearInterval(interval);
        sendHeartbeat(); // mark last seen
      }
    };

    const sub = AppState.addEventListener("change", handleState);

    // start immediately if already active
    handleState(AppState.currentState);

    return () => {
      sub.remove();
      if (interval) clearInterval(interval);
    };
  }, [user]);

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
        temporarilyIgnoreAppLock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
