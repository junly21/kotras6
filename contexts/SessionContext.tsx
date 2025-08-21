"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSession } from "../hooks/useSession";
import { AgencyInfo, FeaturePermissions } from "../types/agency";
import {
  hasPermission,
  getAgencyDisplayName,
} from "../utils/agencyPermissions";

interface SessionContextType {
  session: {
    sessionId: string | null;
    agencyInfo: string | null;
    agencyName: string | null;
    agencyCode: string | null; // OPER_CODE_NM_DECR 값
    agency: AgencyInfo | null; // 기관 정보
    permissions: FeaturePermissions | null; // 권한 정보
    isActive: boolean;
    lastActivity: number;
  };
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
  // 권한 체크 함수들
  canAccess: (feature: keyof FeaturePermissions) => boolean;
  getDisplayName: () => string;
  getAgencyLevel: () => string | null;
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
