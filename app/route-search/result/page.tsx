"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { routeSearchFilterConfig } from "@/features/routeSearch/filterConfig";
import { createRouteSearchColDefs } from "@/features/routeSearch/gridConfig";
import { processRouteSearchResults } from "@/features/routeSearch/dataProcessor";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import {
  RouteSearchFilter,
  RouteSearchResult,
  StationOption,
} from "@/types/routeSearch";
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
const routeSearchSchema = z
  .object({
    RIDE_STN_ID: z.string().min(1, "출발역을 선택해주세요"),
    ALGH_STN_ID: z.string().min(1, "도착역을 선택해주세요"),
  })
  .refine((data) => data.RIDE_STN_ID !== data.ALGH_STN_ID, {
    message: "출발역과 도착역은 같을 수 없습니다.",
    path: ["ALGH_STN_ID"], // 에러를 도착역 필드에 표시
  });

// 기본값
const defaultValues: RouteSearchFilter = {
  RIDE_STN_ID: "",
  ALGH_STN_ID: "",
};

export default function RouteSearchResultPage() {
  const gridRef = useRef<AgGridReact>(null);

  const { searchResults, searchLoading, searchError, handleSearch } =
    useRouteSearch();

  const [filters, setFilters] = useState<RouteSearchFilter>(defaultValues);
  const [selectedPaths, setSelectedPaths] = useState<RouteSearchResult[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRouteForDetail, setSelectedRouteForDetail] =
    useState<RouteSearchResult | null>(null);
  const [arrivalStationOptions, setArrivalStationOptions] = useState<
    StationOption[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 필터 변경 핸들러 - useCallback으로 최적화
  const handleFilterChange = useCallback(
    (values: RouteSearchFilter) => {
      setFilters(values);

      // 출발역이 선택되면 도착역 옵션 로드
      if (values.RIDE_STN_ID && values.RIDE_STN_ID !== filters.RIDE_STN_ID) {
        console.log(
          "출발역 선택됨, 도착역 옵션 로드 시작:",
          values.RIDE_STN_ID
        );

        // 도착역 옵션 API 호출
        fetch("/api/route-search/stations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ RIDE_STN_ID: values.RIDE_STN_ID }),
        })
          .then((res) => res.json())
          .then((data: { options: StationOption[] }) => {
            console.log(
              "도착역 옵션 로드 완료:",
              data.options?.length || 0,
              "개"
            );
            setArrivalStationOptions(data.options || []);
            // 도착역 값 초기화
            setFilters((prev) => ({ ...prev, ALGH_STN_ID: "" }));
          })
          .catch((error) => {
            console.error("도착역 옵션 로드 실패:", error);
          });
      }
    },
    [filters.RIDE_STN_ID]
  );

  // 검색 핸들러 - useCallback으로 최적화
  const handleSearchSubmit = useCallback(
    (values: RouteSearchFilter) => {
      handleSearch(values);
      setSelectedPaths([]);
      setHasSearched(true);
    },
    [handleSearch]
  );

  // 체크박스 변경 핸들러 - useCallback으로 최적화
  const handleCheckboxChange = useCallback(
    (route: RouteSearchResult, checked: boolean) => {
      if (checked) {
        setSelectedPaths((prev) => [...prev, route]);
      } else {
        setSelectedPaths((prev) => prev.filter((path) => path.id !== route.id));
      }
    },
    []
  );

  // 상세 정보 Dialog 열기 - useCallback으로 최적화
  const handleDetailClick = useCallback((route: RouteSearchResult) => {
    setSelectedRouteForDetail(route);
    setDetailDialogOpen(true);
  }, []);

  // 행 클릭 핸들러 - useCallback으로 최적화
  const onRowClicked = useCallback(
    (event: { data: { originalData: RouteSearchResult } }) => {
      console.log("행 클릭 이벤트 (비활성화):", event);
    },
    []
  );

  // 네트워크 데이터 로드
  const {
    nodes,
    links,
    svgText,
    isLoading: isMapLoading,
    error: mapError,
  } = useNetworkData();

  // 체크된 경로들의 하이라이트 계산 - useMemo로 최적화
  const routeHighlights = useMemo((): NetworkMapHighlight[] => {
    if (!selectedPaths || selectedPaths.length === 0) {
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
          priority: 1,
          rgb: route.rgb || "#3B82F6",
          pathId: route.id.toString(),
        };
      })
      .filter(Boolean) as NetworkMapHighlight[];
  }, [selectedPaths]);

  // 경로탐색 결과 데이터 가공 - useMemo로 최적화
  const processedResults = useMemo(() => {
    return processRouteSearchResults(searchResults, selectedPaths);
  }, [searchResults, selectedPaths]);

  // 그리드 컬럼 정의 - useMemo로 최적화
  const colDefs = useMemo(() => {
    return createRouteSearchColDefs(handleCheckboxChange, handleDetailClick);
  }, [handleCheckboxChange, handleDetailClick]);

  // 그리드 높이 동적 계산 - useMemo로 최적화
  const gridHeight = useMemo(() => {
    if (!processedResults || processedResults.length === 0) return 200;
    const rowHeight = 48;
    const headerHeight = 48;
    const minHeight = 200;
    const maxHeight = 480;
    const calculatedHeight = Math.min(
      Math.max(processedResults.length * rowHeight + headerHeight, minHeight),
      maxHeight
    );
    return calculatedHeight;
  }, [processedResults]);

  // 동적 필터 설정 생성 - useMemo로 최적화
  const dynamicFilterConfig = useMemo(() => {
    return routeSearchFilterConfig.map((field) => {
      if (field.name === "ALGH_STN_ID") {
        return {
          ...field,
          options: arrivalStationOptions,
          disabled: !filters.RIDE_STN_ID,
        };
      }
      return field;
    });
  }, [arrivalStationOptions, filters.RIDE_STN_ID]);

  // 전체 로딩 상태
  const isLoading = searchLoading;

  // 에러 상태
  const hasError = searchError;

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
            <p className="mt-4 text-gray-600">경로를 탐색하는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{searchError}</p>
        </div>
      )}

      {/* 필터 폼 */}
      <FilterForm
        fields={dynamicFilterConfig}
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
          <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-8 text-center">
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
          <div className="bg-gray-50 border border-gray-200 rounded-[24px] p-8 text-center">
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
          <div className="bg-white rounded-[24px] p-4">
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
