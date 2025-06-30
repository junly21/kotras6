import { useState, useEffect, useCallback } from "react";
import { ApiResponse } from "../services/apiClient";

interface UseApiOptions<T> {
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useApi<T = unknown>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { autoFetch = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const executeApiCall = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();

      if (result.success && result.data) {
        setData(result.data);
        onSuccess?.(result.data);
      } else {
        const errorMessage = result.error || "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "API 호출 중 오류가 발생했습니다.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      executeApiCall();
    }
  }, [executeApiCall, autoFetch]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    data,
    error,
    loading,
    refetch: executeApiCall,
    mutate,
  };
}

// 특정 API를 위한 편의 훅들
export function usePayRecvOperList(oper_id: string = "test") {
  const { PayRecvService } = require("../services/payRecvService");

  return useApi(() => PayRecvService.getOperList({ oper_id }), {
    autoFetch: true,
  });
}
