import { useState, useCallback } from "react";
import {
  RouteSearchKeyFilter,
  RouteSearchTestResult,
} from "@/types/routeSearch";

interface UseRouteSearchKeyReturn {
  searchResults: RouteSearchTestResult[];
  searchLoading: boolean;
  searchError: string | null;
  handleSearch: (filters: RouteSearchKeyFilter) => Promise<void>;
}

export const useRouteSearchKey = (): UseRouteSearchKeyReturn => {
  const [searchResults, setSearchResults] = useState<RouteSearchTestResult[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback(async (filters: RouteSearchKeyFilter) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      // TODO: 실제 외부 API 호출로 변경 필요
      // 엔드포인트: selectPathResultInputTex.do
      // 현재는 임시로 key 엔드포인트 사용
      const response = await fetch("/api/route-search/key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "검색 요청이 실패했습니다.");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("경로탐색 Key 검색 오류:", error);
      setSearchError(
        error instanceof Error ? error.message : "검색 중 오류가 발생했습니다."
      );
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    handleSearch,
  };
};
