import { useState, useCallback } from "react";
import {
  RouteSearchTestFilter,
  RouteSearchTestResult,
} from "@/types/routeSearch";

interface UseRouteSearchTestReturn {
  searchResults: RouteSearchTestResult[];
  searchLoading: boolean;
  searchError: string | null;
  handleSearch: (filters: RouteSearchTestFilter) => Promise<void>;
}

export const useRouteSearchTest = (): UseRouteSearchTestReturn => {
  const [searchResults, setSearchResults] = useState<RouteSearchTestResult[]>(
    []
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback(async (filters: RouteSearchTestFilter) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await fetch("/api/route-search/test2", {
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
      console.error("경로탐색 테스트 검색 오류:", error);
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
