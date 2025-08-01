"use client";

import { useState } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { routeSearchFilterConfig } from "@/features/routeSearch/filterConfig";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import { RouteSearchFilter } from "@/types/routeSearch";
import Spinner from "@/components/Spinner";

// 검증 스키마
const routeSearchSchema = z.object({
  RIDE_STN_ID: z.string().min(1, "출발역을 선택해주세요"),
  ALGH_STN_ID: z.string().min(1, "도착역을 선택해주세요"),
});

// 기본값
const defaultValues: RouteSearchFilter = {
  RIDE_STN_ID: "",
  ALGH_STN_ID: "",
};

export default function RouteSearchResultPage() {
  const {
    searchResults,
    stationLoading,
    searchLoading,
    stationError,
    searchError,
    handleSearch,
  } = useRouteSearch();

  const [filters, setFilters] = useState<RouteSearchFilter>(defaultValues);

  // 필터 변경 핸들러
  const handleFilterChange = (values: RouteSearchFilter) => {
    setFilters(values);
  };

  // 검색 핸들러
  const handleSearchSubmit = (values: RouteSearchFilter) => {
    handleSearch(values);
  };

  // 전체 로딩 상태
  const isLoading = stationLoading || searchLoading;

  // 에러 상태
  const hasError = stationError || searchError;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">경로탐색 결과조회</h1>
      </div>

      {/* 전체 페이지 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">
              {stationLoading
                ? "역 목록을 불러오는 중..."
                : "경로를 탐색하는 중..."}
            </p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{stationError || searchError}</p>
        </div>
      )}

      {/* 필터 폼 */}
      <FilterForm
        fields={routeSearchFilterConfig}
        defaultValues={defaultValues}
        schema={routeSearchSchema}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearchSubmit}
        className="bg-gray-50"
      />

      {/* 결과 표시 */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">탐색 결과</h2>
          <div className="bg-white border rounded-lg p-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(searchResults, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 결과가 없을 때 */}
      {!isLoading &&
        !hasError &&
        searchResults.length === 0 &&
        filters.RIDE_STN_ID &&
        filters.ALGH_STN_ID && (
          <div className="text-center py-8">
            <p className="text-gray-500">해당 경로에 대한 결과가 없습니다.</p>
          </div>
        )}
    </div>
  );
}
