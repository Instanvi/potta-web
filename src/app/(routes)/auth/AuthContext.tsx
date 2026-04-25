"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * A legacy-bridge provider that wraps next-auth useSession() to support 
 * existing components that depend on the custom useAuth() hook.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const value: AuthContextType = {
    user: (session?.user as User) || null,
    token: (session?.user as User)?.accessToken || null,
    status: status as any,
    isLoading: status === "loading",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback if not inside provider, though AppProviders should cover it.
    // For now, returning a mock to avoid crashes.
    return {
        user: null,
        token: null,
        status: "unauthenticated",
        isLoading: false
    } as AuthContextType;
  }
  return context;
};
