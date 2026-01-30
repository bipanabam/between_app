import { account, ensureUserDocument } from "@/lib/appwrite";
import { UserDocument } from "@/types/type";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  loading: boolean;
  isAuthenticated: boolean;
  user?: UserDocument | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthenticated: false,
  user: null,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserDocument | null>(null);

  const bootstrap = async () => {
    try {
      await account.get();
      const userDoc = await ensureUserDocument();
      setUser(userDoc as UserDocument);
      console.log(user);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle magic link
  // const handleMagicLink = async (url: string) => {
  //   const { queryParams } = Linking.parse(url);

  //   const userId = queryParams?.userId as string;
  //   const secret = queryParams?.secret as string;

  //   if (!userId || !secret) return;

  //   try {
  //     // Create session
  //     await account.createSession(userId, secret);

  //     // Ensure user doc
  //     const userDoc = await ensureUserDocument();

  //     setUser(userDoc as UserDocument);
  //     setIsAuthenticated(true);
  //   } catch (err) {
  //     console.error("Magic link auth failed", err);
  //     setUser(null);
  //     setIsAuthenticated(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const refreshUser = async () => {
    const userDoc = await ensureUserDocument();
    setUser(userDoc as UserDocument);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
