"use client";

import { useState, useMemo, useRef } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { routeSearchFilterConfig } from "@/features/routeSearch/filterConfig";
import { createRouteSearchColDefs } from "@/features/routeSearch/gridConfig";
import { processRouteSearchResults } from "@/features/routeSearch/dataProcessor";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import { RouteSearchFilter, RouteSearchResult } from "@/types/routeSearch";
import Spinner from "@/components/Spinner";
import TestGrid from "@/components/TestGrid";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight } from "@/types/network";
import { RouteDetailDialog } from "@/components/routeSearch/RouteDetailDialog";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

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
  const gridRef = useRef<AgGridReact>(null);

  const {
    searchResults,
    stationLoading,
    searchLoading,
    stationError,
    searchError,
    handleSearch,
  } = useRouteSearch();

  const [filters, setFilters] = useState<RouteSearchFilter>(defaultValues);

  // 체크박스 선택된 경로들 (스택 순서 유지)
  const [selectedPaths, setSelectedPaths] = useState<RouteSearchResult[]>([]);

  // 상세 정보 Dialog 상태
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRouteForDetail, setSelectedRouteForDetail] =
    useState<RouteSearchResult | null>(null);

  // 필터 변경 핸들러
  const handleFilterChange = (values: RouteSearchFilter) => {
    setFilters(values);
  };

  // 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // 검색 핸들러
  const handleSearchSubmit = (values: RouteSearchFilter) => {
    handleSearch(values);
    // 검색 시 선택된 경로 초기화
    setSelectedPaths([]);
    // 검색 수행 상태 설정
    setHasSearched(true);
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (route: RouteSearchResult, checked: boolean) => {
    if (checked) {
      // 체크박스 선택: 스택에 추가
      setSelectedPaths((prev) => [...prev, route]);
    } else {
      // 체크박스 해제: 스택에서 제거
      setSelectedPaths((prev) => prev.filter((path) => path.id !== route.id));
    }
  };

  // 상세 정보 Dialog 열기
  const handleDetailClick = (route: RouteSearchResult) => {
    setSelectedRouteForDetail(route);
    setDetailDialogOpen(true);
  };

  // 전체 로딩 상태
  const isLoading = stationLoading || searchLoading;

  // 에러 상태
  const hasError = stationError || searchError;

  // 네트워크 데이터 로드
  const {
    nodes,
    links,
    svgText,
    isLoading: isMapLoading,
    error: mapError,
  } = useNetworkData();

  // 체크된 경로들의 하이라이트 계산 (스택 순서대로)
  const routeHighlights = useMemo((): NetworkMapHighlight[] => {
    console.log("경로탐색 하이라이트 계산:", {
      selectedPathsCount: selectedPaths.length,
      totalResults: searchResults.length,
    });

    if (!selectedPaths || selectedPaths.length === 0) {
      console.log("경로탐색 하이라이트: 선택된 경로 없음");
      return [];
    }

    return selectedPaths
      .map((route) => {
        if (!route.path_num) return null;

        const nodeIds = route.path_num
          .split(", ")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        return {
          type: "path" as const,
          value: nodeIds,
          priority: 1, // 모든 체크된 경로는 우선순위 1
          rgb: route.rgb || "#3B82F6", // RGB 값 사용, 없으면 기본 파란색
          pathId: route.id.toString(), // 경로 ID
        };
      })
      .filter(Boolean) as NetworkMapHighlight[];
  }, [selectedPaths, searchResults]);

  // 경로탐색 결과 데이터 가공
  const processedResults = useMemo(() => {
    return processRouteSearchResults(searchResults, selectedPaths);
  }, [searchResults, selectedPaths]);

  // 그리드 컬럼 정의
  const colDefs = useMemo(() => {
    return createRouteSearchColDefs(handleCheckboxChange, handleDetailClick);
  }, [handleCheckboxChange, handleDetailClick]);

  // 행 클릭 핸들러 제거 (상세정보 버튼으로 대체)
  const onRowClicked = (event: {
    data: { originalData: RouteSearchResult };
  }) => {
    // 행 클릭 시 아무 동작 안함 (상세정보 버튼으로 대체)
    console.log("행 클릭 이벤트 (비활성화):", event);
  };

  // 그리드 높이 동적 계산
  const gridHeight = useMemo(() => {
    if (!processedResults || processedResults.length === 0) return 200;
    const rowHeight = 48; // AG Grid 기본 행 높이
    const headerHeight = 48; // 헤더 높이
    const minHeight = 200;
    const maxHeight = 480; // 최대 10행
    const calculatedHeight = Math.min(
      Math.max(processedResults.length * rowHeight + headerHeight, minHeight),
      maxHeight
    );
    return calculatedHeight;
  }, [processedResults]);

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

      {/* 결과 그리드 */}
      <div className="space-y-4">
        {!hasSearched ? (
          // 조회 전 안내 메시지
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-blue-600 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              경로 탐색
            </h2>
            <p className="text-blue-600">
              출발역과 도착역을 선택한 후 &quot;조회&quot; 버튼을 클릭하여
              경로를 탐색해주세요.
            </p>
          </div>
        ) : processedResults.length > 0 ? (
          // 검색 결과가 있는 경우
          <>
            <h2 className="text-xl font-semibold">
              탐색 결과 ({processedResults.length}개)
            </h2>
            <TestGrid
              rowData={processedResults}
              columnDefs={colDefs}
              gridRef={gridRef}
              height={gridHeight}
              gridOptions={{
                onRowClicked: onRowClicked,
                rowSelection: "none", // 체크박스 사용하므로 단일 선택 비활성화
              }}
            />
          </>
        ) : (
          // 검색 결과가 없는 경우
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              검색 결과 없음
            </h2>
            <p className="text-gray-500">해당 경로에 대한 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 네트워크 맵 */}
      {hasSearched && processedResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">지하철 노선도</h2>
          <div className="bg-white border rounded-lg p-4">
            {isMapLoading ? (
              <div className="flex items-center justify-center h-64">
                <Spinner />
                <p className="ml-2 text-gray-600">노선도를 불러오는 중...</p>
              </div>
            ) : mapError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">노선도 로드 실패: {mapError}</p>
              </div>
            ) : (
              <NetworkMap
                nodes={nodes}
                links={links}
                svgText={svgText}
                highlights={routeHighlights}
                config={{
                  width: "100%",
                  height: 600,
                  showZoomControls: true,
                  showTooltips: true,
                  defaultZoom: 1,
                  defaultPan: { x: -2400, y: -2500 },
                }}
              />
            )}
            {!isMapLoading && !mapError && (
              <div className="mt-4 text-sm text-gray-600">
                {selectedPaths.length > 0 ? (
                  <>
                    <p>
                      • <span className="font-medium">체크된 경로</span>: 각
                      경로의 RGB 색상으로 표시
                    </p>
                    <p>
                      • <span className="font-medium">선택 순서</span>: 체크박스
                      선택 순서대로 색상 적용
                    </p>
                  </>
                ) : (
                  <p>
                    • <span className="font-medium">체크박스</span>를 선택하면
                    해당 경로가 노선도에 표시됩니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 상세 정보 Dialog */}
      <RouteDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        route={selectedRouteForDetail}
      />
    </div>
  );
}
