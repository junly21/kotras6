import { useState, useCallback } from "react";
import { RouteSearchService } from "@/services/routeSearchService";
import {
  RouteSearchFilter,
  RouteSearchResult,
  StationOption,
} from "@/types/routeSearch";
import React from "react"; // Added missing import

export function useRouteSearch() {
  const [filters, setFilters] = useState<RouteSearchFilter>({
    RIDE_STN_ID: "",
    ALGH_STN_ID: "",
  });

  // 상태 관리
  const [stationOptions, setStationOptions] = useState<StationOption[]>([]);
  const [searchResults, setSearchResults] = useState<RouteSearchResult[]>([]);
  const [stationLoading, setStationLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [stationError, setStationError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 역 목록 조회
  const fetchStations = useCallback(async () => {
    setStationLoading(true);
    setStationError(null);

    try {
      const result = await RouteSearchService.getStationOptions();
      if (result.success && result.data) {
        setStationOptions(result.data);
      } else {
        setStationError(result.error || "역 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setStationError(
        error instanceof Error
          ? error.message
          : "역 목록 조회 중 오류가 발생했습니다."
      );
    } finally {
      setStationLoading(false);
    }
  }, []);

  // 경로탐색 결과 조회
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

  // 경로탐색 실행
  const handleSearch = useCallback(
    async (searchFilters: RouteSearchFilter) => {
      setFilters(searchFilters);
      await searchRoutes(searchFilters);
    },
    [searchRoutes]
  );

  // 컴포넌트 마운트 시 역 목록 조회
  React.useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return {
    // 상태
    filters,
    stationOptions,
    searchResults,

    // 로딩 상태
    stationLoading,
    searchLoading,

    // 에러 상태
    stationError,
    searchError,

    // 액션
    handleSearch,
    refetchStations: fetchStations,
  };
}
