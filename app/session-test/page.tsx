"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSessionContext } from "@/contexts/SessionContext";
import { useAgencyOptions } from "@/hooks/useFilterOptions";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import Spinner from "@/components/Spinner";
import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
const sessionTestSchema = z.object({
  agency: z.string().min(1, "기관을 선택해주세요"),
});

type SessionTestFilters = z.infer<typeof sessionTestSchema>;

// 필터 필드 설정
const sessionTestFields: FieldConfig[] = [
  {
    name: "agency",
    label: "기관명",
    type: "select",
    required: true,
    placeholder: "기관명을 선택하세요",
    optionsEndpoint: "/api/common/agencies",
  },
];

export default function SessionTestPage() {
  const {
    session,
    isInitialized,
    isLoading: sessionLoading,
    refreshSession,
    clearSession: clearLocalSession,
  } = useSessionContext();

  const [filters, setFilters] = useState<SessionTestFilters>({
    agency: "",
  });

  const [isClearingSession, setIsClearingSession] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 로그 추가 함수
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString("ko-KR");
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50)); // 최근 50개만 유지
  }, []);

  // 토스트 상태
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "info",
  });

  // 기관 옵션 훅 사용
  const handleAgencyChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, agency: value }));
      addLog(`기관 선택됨: ${value}`);
    },
    [addLog]
  );

  const {
    options: agencyOptions,
    isLoading: isAgencyLoading,
    isAllOptionsLoaded: isAgencyLoaded,
    errors: agencyErrors,
  } = useAgencyOptions(handleAgencyChange);

  // 세션 상태 변경 시 로그
  useEffect(() => {
    if (isInitialized) {
      if (session.sessionId) {
        addLog(`✅ 세션 초기화 완료: ${session.sessionId}`);
      } else {
        addLog(`❌ 세션 없음`);
      }
    }
  }, [isInitialized, session.sessionId, addLog]);

  // 기관 옵션 로드 시 로그
  useEffect(() => {
    if (isAgencyLoaded) {
      const count = agencyOptions.agency?.length || 0;
      addLog(`✅ 기관 옵션 로드 완료: ${count}개`);
    }
  }, [isAgencyLoaded, agencyOptions.agency, addLog]);

  // 기관 옵션 에러 시 로그
  useEffect(() => {
    if (agencyErrors.agency) {
      addLog(`❌ 기관 옵션 로드 실패: ${agencyErrors.agency}`);
    }
  }, [agencyErrors.agency, addLog]);

  // 첫 번째 기관 자동 선택
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (
      agencyOptions.agency &&
      agencyOptions.agency.length > 0 &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      const firstAgency = agencyOptions.agency[0].value;
      setFilters((prev) => ({ ...prev, agency: firstAgency }));
    }
  }, [agencyOptions.agency]);

  const handleSearch = useCallback(
    (values: SessionTestFilters) => {
      setFilters(values);
      addLog(`🔍 검색 실행: ${values.agency}`);
      setToast({
        isVisible: true,
        message: `검색 완료: ${values.agency}`,
        type: "success",
      });
    },
    [addLog]
  );

  // 세션 초기화 (clearSession.do 호출)
  const handleClearSession = useCallback(async () => {
    if (!session.sessionId) {
      setToast({
        isVisible: true,
        message: "초기화할 세션이 없습니다.",
        type: "error",
      });
      return;
    }

    setIsClearingSession(true);
    addLog(`🔄 세션 초기화 요청 시작...`);

    try {
      const response = await fetch("/api/common/clear-session", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        addLog(`✅ 서버 세션 초기화 성공`);

        // 로컬 세션도 클리어
        clearLocalSession();
        addLog(`✅ 로컬 세션 클리어 완료`);

        setToast({
          isVisible: true,
          message: "세션이 초기화되었습니다. 5초 후 새로고침됩니다.",
          type: "success",
        });

        // 5초 후 페이지 새로고침
        setTimeout(() => {
          addLog(`🔄 페이지 새로고침 시작...`);
          window.location.reload();
        }, 5000);
      } else {
        throw new Error(data.error || "세션 초기화 실패");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      addLog(`❌ 세션 초기화 실패: ${errorMessage}`);
      setToast({
        isVisible: true,
        message: `세션 초기화 실패: ${errorMessage}`,
        type: "error",
      });
    } finally {
      setIsClearingSession(false);
    }
  }, [session.sessionId, clearLocalSession, addLog]);

  // 세션 새로고침
  const handleRefreshSession = useCallback(async () => {
    addLog(`🔄 세션 새로고침 시작...`);
    try {
      await refreshSession();
      addLog(`✅ 세션 새로고침 완료`);
      setToast({
        isVisible: true,
        message: "세션이 새로고침되었습니다.",
        type: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      addLog(`❌ 세션 새로고침 실패: ${errorMessage}`);
      setToast({
        isVisible: true,
        message: `세션 새로고침 실패: ${errorMessage}`,
        type: "error",
      });
    }
  }, [refreshSession, addLog]);

  // 기관 옵션 강제 새로고침
  const handleRefreshAgencies = useCallback(async () => {
    addLog(`🔄 기관 옵션 강제 새로고침 시작...`);
    try {
      const response = await fetch("/api/common/agencies", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.options) {
        addLog(`✅ 기관 옵션 새로고침 완료: ${data.options.length}개`);
        setToast({
          isVisible: true,
          message: `기관 옵션이 새로고침되었습니다. (${data.options.length}개)`,
          type: "success",
        });
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      addLog(`❌ 기관 옵션 새로고침 실패: ${errorMessage}`);
      setToast({
        isVisible: true,
        message: `기관 옵션 새로고침 실패: ${errorMessage}`,
        type: "error",
      });
    }
  }, [addLog]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">세션 테스트 페이지</h1>

      {/* 세션 상태 정보 */}
      <div className="bg-gray-100 p-4 rounded-lg space-y-2">
        <h2 className="text-xl font-semibold mb-2">세션 상태</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">초기화 여부:</span>{" "}
            {isInitialized ? (
              <span className="text-green-600">✅ 완료</span>
            ) : (
              <span className="text-yellow-600">⏳ 진행중</span>
            )}
          </div>
          <div>
            <span className="font-semibold">세션 ID:</span>{" "}
            {session.sessionId ? (
              <span className="text-green-600">{session.sessionId}</span>
            ) : (
              <span className="text-red-600">없음</span>
            )}
          </div>
          <div>
            <span className="font-semibold">기관 코드:</span>{" "}
            {session.agencyCode || "없음"}
          </div>
          <div>
            <span className="font-semibold">기관 옵션 수:</span>{" "}
            {agencyOptions.agency?.length || 0}개
          </div>
        </div>
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleRefreshSession}
          disabled={sessionLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {sessionLoading ? "처리중..." : "세션 새로고침"}
        </button>
        <button
          onClick={handleRefreshAgencies}
          disabled={isAgencyLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isAgencyLoading ? "로딩중..." : "기관 옵션 새로고침"}
        </button>
        <button
          onClick={handleClearSession}
          disabled={isClearingSession || !session.sessionId}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isClearingSession ? "초기화중..." : "세션 초기화 (clearSession.do)"}
        </button>
      </div>

      {/* 필터 폼 */}
      <div className="relative">
        {isAgencyLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
            <Spinner />
          </div>
        )}
        <FilterForm<SessionTestFilters>
          fields={sessionTestFields}
          defaultValues={filters}
          values={filters}
          schema={sessionTestSchema}
          onSearch={handleSearch}
        />
      </div>

      {/* 로그 */}
      <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
        <h3 className="text-white font-bold mb-2">실시간 로그</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">로그가 없습니다.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      {/* 테스트 시나리오 안내 */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">📝 테스트 시나리오</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>
            페이지 로드 시 세션이 자동으로 초기화되고 기관 옵션이 로드됩니다.
          </li>
          <li>"세션 초기화" 버튼을 클릭하면 clearSession.do가 호출됩니다.</li>
          <li>
            세션이 초기화되면 ext_sid 쿠키가 삭제되고 5초 후 페이지가
            새로고침됩니다.
          </li>
          <li>
            새로고침 후 다시 세션이 생성되고 기관 옵션이 로드되는지 확인합니다.
          </li>
          <li>로그에서 전체 흐름과 에러 여부를 확인할 수 있습니다.</li>
        </ol>
      </div>

      {/* 401 자동 새로고침 안내 */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 className="font-bold text-green-900 mb-2">
          ✅ 401 에러 자동 새로고침
        </h3>
        <div className="space-y-2 text-sm text-green-800">
          <p>
            <strong>
              세션 갱신 시 401 에러가 발생하면 자동으로 페이지가 새로고침됩니다.
            </strong>
          </p>
          <div className="bg-white p-3 rounded border border-green-300 mt-2">
            <p className="font-mono text-xs mb-1">동작 흐름:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>세션 갱신 요청 → 401 응답 감지</li>
              <li>콘솔에 에러 로그 출력</li>
              <li>1초 후 자동 새로고침 (window.location.reload)</li>
              <li>새 세션 생성 → 정상 복구</li>
            </ol>
          </div>
          <p className="mt-2">
            <strong>테스트 방법:</strong> "세션 초기화" 버튼 클릭 후 5초
            기다리지 않고 "세션 새로고침" 버튼을 즉시 클릭하면 401 에러가 발생할
            수 있습니다.
          </p>
        </div>
      </div>

      {/* 토스트 알림 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
