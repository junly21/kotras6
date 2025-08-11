import { useState, useCallback } from "react";
import { RouteSearchService } from "@/services/routeSearchService";
import { RouteSearchFilter, RouteSearchResult } from "@/types/routeSearch";

export function useRouteSearch() {
  // 상태 관리
  const [searchResults, setSearchResults] = useState<RouteSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 경로탐색 결과 조회 - useCallback으로 최적화
  const searchRoutes = useCallback(async (searchFilters: RouteSearchFilter) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      const result = await RouteSearchService.getRouteSearchResults(
        searchFilters
      );
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        setSearchError(result.error || "경로탐색에 실패했습니다.");
      }
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "경로탐색 중 오류가 발생했습니다."
      );
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 경로탐색 실행 - useCallback으로 최적화
  const handleSearch = useCallback(
    async (searchFilters: RouteSearchFilter) => {
      await searchRoutes(searchFilters);
    },
    [searchRoutes]
  );

  return {
    // 상태
    searchResults,

    // 로딩 상태
    searchLoading,

    // 에러 상태
    searchError,

    // 액션
    handleSearch,
  };
}
