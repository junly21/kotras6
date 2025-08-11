"use client";

import { useState } from "react";

interface ApiResult {
  success?: boolean;
  data?: unknown;
  error?: string;
  details?: string;
}

interface Results {
  [key: string]: ApiResult;
}

export default function SessionApiTest() {
  const [results, setResults] = useState<Results>({});
  const [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<
    "none" | "created" | "retrieved"
  >("none");

  const testInitSession = async () => {
    setLoading(true);
    console.log("세션 생성 API 테스트 시작 (빈 바디)");

    try {
      const response = await fetch("/api/common/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 포함
      });

      console.log(`세션 생성 API 응답 상태: ${response.status}`);
      console.log(
        `세션 생성 API 응답 헤더:`,
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log(`세션 생성 API 응답 데이터:`, data);

      if (data.success) {
        setSessionStatus("created");
        console.log("세션이 성공적으로 생성되었습니다.");
      }

      setResults((prev: Results) => ({ ...prev, initSession: data }));
    } catch (error) {
      console.error("세션 생성 API 테스트 실패:", error);
      setResults((prev: Results) => ({
        ...prev,
        initSession: {
          error: "API 호출 실패",
          details: error instanceof Error ? error.message : String(error),
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const testGetSession = async () => {
    if (sessionStatus === "none") {
      alert("먼저 세션을 생성해주세요.");
      return;
    }

    setLoading(true);
    console.log("세션 조회 API 테스트 시작");

    try {
      const response = await fetch("/api/common/sessions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 포함
      });

      console.log(`세션 조회 API 응답 상태: ${response.status}`);
      console.log(
        `세션 조회 API 응답 헤더:`,
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log(`세션 조회 API 응답 데이터:`, data);

      if (data.success) {
        setSessionStatus("retrieved");
      }

      setResults((prev: Results) => ({ ...prev, getSession: data }));
    } catch (error) {
      console.error("세션 조회 API 테스트 실패:", error);
      setResults((prev: Results) => ({
        ...prev,
        getSession: {
          error: "API 호출 실패",
          details: error instanceof Error ? error.message : String(error),
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSessionStatus("none");
    setResults({});
    console.log("세션 상태 초기화");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">세션 API 테스트 (쿠키 기반)</h1>

      {/* 세션 상태 표시 */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">현재 세션 상태</h3>
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-2 rounded-full text-sm font-medium ${
              sessionStatus === "none"
                ? "bg-red-100 text-red-800"
                : sessionStatus === "created"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}>
            {sessionStatus === "none"
              ? "❌ 세션 없음"
              : sessionStatus === "created"
              ? "🟡 세션 생성됨"
              : "✅ 세션 조회됨"}
          </div>
          <button
            onClick={resetSession}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">
            상태 초기화
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          세션은 HttpOnly 쿠키로 관리되며, 브라우저에서 직접 접근할 수 없습니다.
        </p>
      </div>

      {/* API 테스트 버튼들 */}
      <div className="space-y-4 mb-8">
        <button
          onClick={testInitSession}
          disabled={loading}
          className="px-6 py-3 bg-green-500 text-white rounded-lg disabled:opacity-50 hover:bg-green-600 font-medium">
          🚀 세션 생성 테스트 (POST /initSession.do - 빈 바디)
        </button>

        <button
          onClick={testGetSession}
          disabled={loading || sessionStatus === "none"}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 font-medium ml-2">
          🔍 세션 조회 테스트 (GET /getSession.do)
        </button>
      </div>

      {loading && (
        <div className="text-blue-500 text-center py-4 text-lg">
          ⏳ API 호출 중... 잠시만 기다려주세요.
        </div>
      )}

      {/* 결과 표시 */}
      {Object.keys(results).length === 0 && !loading && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg">
            위 버튼을 클릭하여 세션 API를 테스트해보세요.
          </p>
          <p className="text-sm mt-2">
            1. &quot;세션 생성 테스트&quot; 버튼을 클릭하여 /initSession.do
            API를 호출합니다 (빈 바디)
          </p>
          <p className="text-sm">
            2. 세션이 생성되면 &quot;세션 조회 테스트&quot; 버튼을 클릭합니다
          </p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(results).map(([type, data]) => (
          <div key={type} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">
              {type === "initSession"
                ? "🚀 세션 생성 결과"
                : "🔍 세션 조회 결과"}
            </h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 border">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {/* 사용법 안내 */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2 text-yellow-800">
          📖 사용법 (쿠키 기반)
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>
            &quot;세션 생성 테스트&quot; 버튼을 클릭하여 /initSession.do API를
            호출합니다 (빈 바디)
          </li>
          <li>
            백엔드에서 JSESSIONID를 받아 우리 서버의 ext_sid 쿠키로 저장합니다
          </li>
          <li>세션 상태가 &quot;생성됨&quot;으로 변경됩니다</li>
          <li>
            &quot;세션 조회 테스트&quot; 버튼을 클릭하여 /getSession.do API를
            호출합니다
          </li>
          <li>
            우리 서버가 ext_sid 쿠키를 JSESSIONID로 변환하여 외부 서버에
            전송합니다
          </li>
          <li>
            브라우저 개발자 도구 Console에서 상세한 로그를 확인할 수 있습니다
          </li>
        </ol>
      </div>

      {/* 기술적 설명 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-800">
          🔧 기술적 동작 방식
        </h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            <strong>1. 세션 생성:</strong> 외부 서버 → JSESSIONID → 우리 ext_sid
            쿠키
          </p>
          <p>
            <strong>2. 세션 조회:</strong> 우리 ext_sid 쿠키 → JSESSIONID → 외부
            서버
          </p>
          <p>
            <strong>3. 보안:</strong> HttpOnly 쿠키로 XSS 공격 방지, 도메인 격리
          </p>
          <p>
            <strong>4. 세션 지속:</strong> 30분 TTL, 자동 만료 처리
          </p>
        </div>
      </div>
    </div>
  );
}
