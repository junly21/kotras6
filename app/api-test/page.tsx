"use client";

import { useState } from "react";

export default function ApiTest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testApi = async (type: string) => {
    setLoading(true);
    console.log(`API 테스트 시작: ${type}`);

    try {
      const response = await fetch("/api/main", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      console.log(`API 응답 상태: ${response.status}`);
      console.log(
        `API 응답 헤더:`,
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log(`API 응답 데이터:`, data);

      setResults((prev: any) => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`API 테스트 실패 (${type}):`, error);
      setResults((prev: any) => ({
        ...prev,
        [type]: {
          error: "API 호출 실패",
          details: error instanceof Error ? error.message : String(error),
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API 테스트</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => testApi("network-nodes")}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
          네트워크 노드 테스트
        </button>

        <button
          onClick={() => testApi("network-lines")}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 ml-2">
          네트워크 링크 테스트
        </button>

        <button
          onClick={() => testApi("card-stats")}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50 ml-2">
          권종별 통행수 테스트
        </button>

        <button
          onClick={() => testApi("od-pair-stats")}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50 ml-2">
          OD Pair 통계 테스트
        </button>
      </div>

      {loading && <div className="text-blue-500">로딩 중...</div>}

      {Object.keys(results).length === 0 && !loading && (
        <div className="text-gray-500 text-center py-8">
          위 버튼을 클릭하여 API를 테스트해보세요.
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(results).map(([type, data]) => (
          <div key={type} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{type}</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
