"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSession } from "../hooks/useSession";

interface SessionContextType {
  session: {
    sessionId: string | null;
    agencyInfo: string | null;
    agencyName: string | null; // 기관명 추가
    isActive: boolean;
    lastActivity: number;
  };
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const sessionData = useSession();

  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
