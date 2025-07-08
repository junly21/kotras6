"use client";
import { useState } from "react";
import { PayRecvService, PayRecvOperData } from "@/services/payRecvService";
import { ApiResponse } from "@/services/apiClient";

export default function TestApiPage() {
  const [result, setResult] = useState<ApiResponse<PayRecvOperData[]> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetOperList = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("API 테스트 시작...");
      const response = await PayRecvService.getOperList({ limit: 3 });

      console.log("API 응답:", response);
      setResult(response);
    } catch (err) {
      console.error("API 테스트 에러:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API 테스트 페이지</h1>

      <div className="mb-6">
        <button
          onClick={testGetOperList}
          disabled={loading}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? "테스트 중..." : "getOperList 테스트"}
        </button>
      </div>

      {error && (
        <div className="bg-error-100 border border-error-400 text-error-700 px-4 py-3 rounded mb-4">
          <strong>에러:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>성공!</strong> API 응답을 받았습니다.
        </div>
      )}

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">응답 결과:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
