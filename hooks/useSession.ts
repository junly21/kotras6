import { useState, useEffect, useCallback, useRef } from "react";
import { AgencyInfo, FeaturePermissions } from "../types/agency";
import {
  hasPermission,
  getFeaturePermissions,
  getAgencyInfo,
  getAgencyDisplayName,
} from "../utils/agencyPermissions";

interface SessionData {
  sessionId: string | null;
  agencyInfo: string | null;
  agencyName: string | null;
  agencyCode: string | null; // OPER_CODE_NM_DECR 값
  agency: AgencyInfo | null; // 기관 정보
  permissions: FeaturePermissions | null; // 권한 정보
  isActive: boolean;
  lastActivity: number;
}

interface UseSessionReturn {
  session: SessionData;
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

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분 (밀리초)
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5분 전에 갱신 시도

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData>({
    sessionId: null,
    agencyInfo: null,
    agencyName: null,
    agencyCode: null, // 기관 코드 초기값 추가
    agency: null, // 기관 정보 초기값 추가
    permissions: null, // 권한 정보 초기값 추가
    isActive: false,
    lastActivity: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false); // 초기화 중복 방지
  const hasInitializedRef = useRef(false); // 한 번만 초기화

  // 권한 체크 함수
  const canAccess = useCallback(
    (feature: keyof FeaturePermissions): boolean => {
      if (!session.agencyCode) return false;
      return hasPermission(session.agencyCode, feature);
    },
    [session.agencyCode]
  );

  // 기관명 표시 함수
  const getDisplayName = useCallback((): string => {
    if (!session.agencyCode) return "정보를 불러오는중..";
    return getAgencyDisplayName(session.agencyCode);
  }, [session.agencyCode]);

  // 기관 레벨 반환 함수
  const getAgencyLevel = useCallback((): string | null => {
    if (!session.agency) return null;
    return session.agency.level;
  }, [session.agency]);

  // 세션 초기화 (initSession)
  const initializeSession = useCallback(async () => {
    // 이미 초기화 중이거나 완료된 경우 중복 호출 방지
    if (isInitializingRef.current || hasInitializedRef.current || isLoading) {
      return;
    }

    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/common/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`세션 초기화 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const now = Date.now();

        // 세션 초기화 시에도 기관명 파싱
        let agencyName = null;
        let agencyCode = null;
        let agency: AgencyInfo | null = null;
        let permissions: FeaturePermissions | null = null;

        try {
          if (data.data?.sessionData?.OPER_CODE_NM_DECR) {
            agencyCode = data.data.sessionData.OPER_CODE_NM_DECR;
            agencyName = data.data.sessionData.OPER_CODE_NM_DECR;

            // 기관 정보와 권한 설정
            agency = getAgencyInfo(agencyCode);
            permissions = getFeaturePermissions(agency.level);
          }
        } catch (parseError) {
          console.warn("세션 초기화 시 기관명 파싱 실패:", parseError);
        }

        setSession({
          sessionId: data.data?.sessionId || "unknown",
          agencyInfo: data.data?.agencyInfo || null,
          agencyName: agencyName,
          agencyCode: agencyCode, // 기관 코드 설정
          agency: agency, // 기관 정보 설정
          permissions: permissions, // 권한 정보 설정
          isActive: true,
          lastActivity: now,
        });

        // 세션 갱신 타이머 설정
        scheduleSessionRefresh(now);

        // 사용자 활동 감지 타이머 설정
        setupActivityDetection();

        // 초기화 완료 표시
        hasInitializedRef.current = true;
      } else {
        throw new Error(data.error || "세션 초기화 실패");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류";
      setError(errorMessage);
      console.error("세션 초기화 오류:", err);

      // 실패 시 재시도 (5초 후) - 한 번만
      if (!hasInitializedRef.current) {
        setTimeout(() => {
          isInitializingRef.current = false;
          initializeSession();
        }, 5000);
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      isInitializingRef.current = false;
    }
  }, [isLoading]);

  // 세션 갱신 (getSession)
  const refreshSession = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/common/sessions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`세션 갱신 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const now = Date.now();

        // 외부 API 응답에서 기관명 파싱
        let agencyName = null;
        let agencyCode = null;
        let agency: AgencyInfo | null = null;
        let permissions: FeaturePermissions | null = null;

        try {
          if (data.data?.externalData?.OPER_CODE_NM_DECR) {
            agencyCode = data.data.externalData.OPER_CODE_NM_DECR;
            agencyName = data.data.externalData.OPER_CODE_NM_DECR;

            // 기관 정보와 권한 설정
            agency = getAgencyInfo(agencyCode);
            permissions = getFeaturePermissions(agency.level);
          } else if (data.data?.message) {
            // fallback: message에서 직접 파싱
            const externalData = JSON.parse(data.data.message);
            agencyCode = externalData.OPER_CODE_NM_DECR || null;
            agencyName = externalData.OPER_CODE_NM_DECR || null;

            if (agencyCode) {
              agency = getAgencyInfo(agencyCode);
              permissions = getFeaturePermissions(agency.level);
            }
          }
        } catch (parseError) {
          console.warn("외부 API 응답 파싱 실패:", parseError);
        }

        setSession((prev) => ({
          ...prev,
          sessionId: data.data?.sessionId || prev.sessionId,
          agencyInfo: data.data?.agencyInfo || prev.agencyInfo,
          agencyName: agencyName || prev.agencyName,
          agencyCode: agencyCode || prev.agencyCode, // 기관 코드 설정
          agency: agency || prev.agency, // 기관 정보 설정
          permissions: permissions || prev.permissions, // 권한 정보 설정
          lastActivity: now,
        }));

        // 세션 갱신 타이머 재설정
        scheduleSessionRefresh(now);
      } else {
        throw new Error(data.error || "세션 갱신 실패");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류";
      setError(errorMessage);
      console.error("세션 갱신 오류:", err);

      // 갱신 실패 시 세션을 비활성화하고 재초기화 시도 (한 번만)
      if (hasInitializedRef.current) {
        setSession((prev) => ({ ...prev, isActive: false }));

        // 3초 후 재초기화 시도
        setTimeout(() => {
          hasInitializedRef.current = false;
          isInitializingRef.current = false;
          initializeSession();
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, initializeSession]);

  // 세션 갱신 타이머 스케줄링
  const scheduleSessionRefresh = useCallback(
    (lastActivity: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const timeUntilRefresh = SESSION_TIMEOUT - REFRESH_THRESHOLD;
      const timeSinceLastActivity = Date.now() - lastActivity;
      const delay = Math.max(0, timeUntilRefresh - timeSinceLastActivity);

      refreshTimerRef.current = setTimeout(() => {
        refreshSession();
      }, delay);
    },
    [refreshSession]
  );

  // 사용자 활동 감지 설정
  const setupActivityDetection = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    // 1분마다 활동 상태 체크
    activityTimerRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - session.lastActivity;

      // 세션이 만료되었는지 확인
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        refreshSession();
      }
    }, 60000); // 1분마다 체크
  }, [session.lastActivity, refreshSession]);

  // 사용자 활동 감지
  const updateActivity = useCallback(() => {
    setSession((prev) => ({ ...prev, lastActivity: Date.now() }));
  }, []);

  // 세션 클리어
  const clearSession = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
    }

    // 초기화 상태 리셋
    hasInitializedRef.current = false;
    isInitializingRef.current = false;

    setSession({
      sessionId: null,
      agencyInfo: null,
      agencyName: null,
      agencyCode: null, // 기관 코드 초기화 추가
      agency: null, // 기관 정보 초기화 추가
      permissions: null, // 권한 정보 초기화 추가
      isActive: false,
      lastActivity: 0,
    });
    setError(null);
    setIsInitialized(false);
  }, []);

  // 컴포넌트 마운트 시 세션 초기화 (한 번만)
  useEffect(() => {
    if (!hasInitializedRef.current && !isInitializingRef.current) {
      initializeSession();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // 사용자 활동 이벤트 리스너
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  return {
    session,
    isInitialized,
    isLoading,
    error,
    refreshSession,
    clearSession,
    canAccess, // 권한 체크 함수 추가
    getDisplayName, // 기관명 표시 함수 추가
    getAgencyLevel, // 기관 레벨 반환 함수 추가
  };
}
