import { useState, useEffect, useCallback, useRef } from "react";

interface SessionData {
  sessionId: string | null;
  agencyInfo: string | null;
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
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분 (밀리초)
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5분 전에 갱신 시도

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<SessionData>({
    sessionId: null,
    agencyInfo: null,
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

  // 세션 초기화 (initSession)
  const initializeSession = useCallback(async () => {
    // 이미 초기화 중이거나 완료된 경우 중복 호출 방지
    if (isInitializingRef.current || hasInitializedRef.current || isLoading) {
      console.log("세션 초기화 중복 호출 방지");
      return;
    }

    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log("세션 초기화 시작...");

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
        setSession({
          sessionId: data.data?.sessionId || "unknown",
          agencyInfo: data.data?.agencyInfo || null,
          isActive: true,
          lastActivity: now,
        });

        console.log("세션 초기화 성공:", data.data);

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
          console.log("세션 초기화 재시도...");
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
      console.log("세션 갱신 시작...");

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
        setSession((prev) => ({
          ...prev,
          sessionId: data.data?.sessionId || prev.sessionId,
          agencyInfo: data.data?.agencyInfo || prev.agencyInfo,
          lastActivity: now,
        }));

        console.log("세션 갱신 성공:", data.data);

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
          console.log("세션 재초기화 시도...");
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

      console.log(`세션 갱신 예약: ${Math.round(delay / 1000)}초 후`);

      refreshTimerRef.current = setTimeout(() => {
        console.log("세션 갱신 타이머 실행");
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
        console.log("세션이 만료되었습니다. 자동 갱신 시도...");
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
      isActive: false,
      lastActivity: 0,
    });
    setError(null);
    setIsInitialized(false);

    console.log("세션이 클리어되었습니다.");
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
  };
}
