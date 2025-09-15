"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { routeSearchTestFilterConfig } from "@/features/routeSearch/testFilterConfig";
import { createRouteSearchTestColDefs } from "@/features/routeSearch/testGridConfig";
import { processRouteSearchTestResults } from "@/features/routeSearch/testDataProcessor";
import { useRouteSearchTest } from "@/hooks/useRouteSearchTest2";
import { RouteSearchTestFilter, RouteSearchResult } from "@/types/routeSearch";
import Spinner from "@/components/Spinner";
import TestGrid from "@/components/TestGrid";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight } from "@/types/network";
import { RouteDetailDialog } from "@/components/routeSearch/RouteDetailDialog";
import { getRouteIdentifier } from "@/utils/routeIdentifier";
import CsvExportButton from "@/components/CsvExportButton";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마
const routeSearchTestSchema = z.object({
  PAGE: z.string().min(1, "페이지 번호를 입력해주세요"),
  PAGESIZE: z.string().min(1, "페이지 크기를 입력해주세요"),
});

// 기본값
const defaultValues: RouteSearchTestFilter = {
  PAGE: "1",
  PAGESIZE: "10",
};

export default function RouteSearchTestPage() {
  const gridRef = useRef<AgGridReact>(null);

  const { searchResults, searchLoading, searchError, handleSearch } =
    useRouteSearchTest();

  const [filters, setFilters] = useState<RouteSearchTestFilter>(defaultValues);
  const [selectedPaths, setSelectedPaths] = useState<RouteSearchResult[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRouteForDetail, setSelectedRouteForDetail] =
    useState<RouteSearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 필터 변경 핸들러 - useCallback으로 최적화
  const handleFilterChange = useCallback((values: RouteSearchTestFilter) => {
    setFilters(values);
  }, []);

  // 검색 핸들러 - useCallback으로 최적화
  const handleSearchSubmit = useCallback(
    (values: RouteSearchTestFilter) => {
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
        setSelectedPaths((prev) =>
          prev.filter((path) => {
            const pathId = getRouteIdentifier(path);
            const routeId = getRouteIdentifier(route);
            return !(pathId && routeId && pathId === routeId);
          })
        );
      }
    },
    []
  );

  // 전체선택/전체해제 핸들러 - useCallback으로 최적화
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        // 전체 선택
        setSelectedPaths([...searchResults]);
      } else {
        // 전체 해제
        setSelectedPaths([]);
      }
    },
    [searchResults]
  );

  // 상세 정보 Dialog 열기 - useCallback으로 최적화
  const handleDetailClick = useCallback((route: RouteSearchResult) => {
    setSelectedRouteForDetail(route);
    setDetailDialogOpen(true);
  }, []);

  // 행 더블클릭 핸들러 - useCallback으로 최적화
  const onRowDoubleClicked = useCallback(
    (event: { data: { originalData: RouteSearchResult }; event: Event }) => {
      // 상세정보 버튼 더블클릭 시에는 체크박스 토글하지 않음
      const target = event.event.target as HTMLElement;
      if (target.closest('button[data-action="detail"]')) {
        return;
      }

      // 체크박스 토글
      const route = event.data.originalData;
      const isCurrentlySelected = selectedPaths.some((path) => {
        const pathId = getRouteIdentifier(path);
        const routeId = getRouteIdentifier(route);
        return pathId && routeId && pathId === routeId;
      });
      handleCheckboxChange(route, !isCurrentlySelected);
    },
    [selectedPaths, handleCheckboxChange]
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
          pathId: getRouteIdentifier(route),
        };
      })
      .filter(Boolean) as NetworkMapHighlight[];
  }, [selectedPaths]);

  // 경로탐색 결과 데이터 가공 - useMemo로 최적화
  const processedResults = useMemo(() => {
    return processRouteSearchTestResults(searchResults, selectedPaths);
  }, [searchResults, selectedPaths]);

  // 전체선택 상태 계산 - useMemo로 최적화
  const selectAllState = useMemo(() => {
    if (processedResults.length === 0) {
      return { isAllSelected: false, isIndeterminate: false };
    }

    const selectedCount = selectedPaths.length;
    const totalCount = processedResults.length;

    return {
      isAllSelected: selectedCount === totalCount,
      isIndeterminate: selectedCount > 0 && selectedCount < totalCount,
    };
  }, [selectedPaths.length, processedResults.length]);

  // 그룹별 배경색 계산 - path_key 기준으로 그룹화
  const getGroupBackgroundColor = useCallback(
    (rowIndex: number) => {
      if (!processedResults || processedResults.length === 0) return "";

      let groupIndex = 0;
      let currentPathKey = "";

      for (let i = 0; i <= rowIndex; i++) {
        const pathKey = processedResults[i].originalData.path_key || "";
        if (pathKey !== currentPathKey) {
          currentPathKey = pathKey;
          groupIndex++;
        }
      }

      // 그룹별로 다른 배경색 적용 (5가지 옅은 색상)
      const groupColors = [
        "#f0f8f0", // 옅은 초록색
        "#fff8f0", // 옅은 주황색
        "#f8f0f8", // 옅은 보라색
        "#f0f0f8", // 옅은 파란색
        "#f8f8f0", // 옅은 노란색
      ];

      return groupColors[groupIndex % groupColors.length];
    },
    [processedResults]
  );

  // 행 스타일 적용 함수
  const getRowStyle = useCallback(
    (params: { rowIndex: number; data: { groupNo: number } }) => {
      const style: React.CSSProperties = {};

      // 그룹별 배경색 적용
      const groupColor = getGroupBackgroundColor(params.rowIndex);
      if (groupColor) {
        style.backgroundColor = groupColor;
      }

      return style;
    },
    [getGroupBackgroundColor]
  );

  // 그리드 컬럼 정의 - useMemo로 최적화
  const colDefs = useMemo(() => {
    return createRouteSearchTestColDefs(
      handleCheckboxChange,
      handleDetailClick,
      handleSelectAllChange,
      selectAllState.isAllSelected,
      selectAllState.isIndeterminate
    );
  }, [
    handleCheckboxChange,
    handleDetailClick,
    handleSelectAllChange,
    selectAllState.isAllSelected,
    selectAllState.isIndeterminate,
  ]);

  // 그리드 높이 동적 계산 - useMemo로 최적화
  const gridHeight = useMemo(() => {
    if (!processedResults || processedResults.length === 0) return 200;

    const baseHeight = 700; // 기본 높이 (1-2개 행일 때)
    return baseHeight;
    // let calculatedHeight: number;

    // if (processedResults.length <= 2) {
    //   // 1-2개 행: 기본 높이
    //   calculatedHeight = baseHeight;
    // } else if (processedResults.length <= 8) {
    //   // 3-9개 행: 기본 높이의 2배
    //   calculatedHeight = baseHeight * 1.5;
    // } else {
    //   // 9개 이상: 기본 높이의 2배의 2배 (4배)
    //   calculatedHeight = baseHeight * 3;
    // }

    // return calculatedHeight;
  }, [processedResults]);

  // 전체 로딩 상태
  const isLoading = searchLoading;

  // 에러 상태
  const hasError = searchError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">경로탐색 테스트</h1>
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
        fields={routeSearchTestFilterConfig}
        defaultValues={defaultValues}
        schema={routeSearchTestSchema}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearchSubmit}
      />

      {/* 결과 그리드 */}
      <div className="space-y-4">
        {!hasSearched ? (
          // 조회 전 안내 메시지
          <div className="bg-blue-50 flex flex-col justify-center items-center border h-[590px] border-blue-200 rounded-[24px] p-8 text-center">
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
              경로 탐색 테스트
            </h2>
            <p className="text-blue-600">
              페이지 번호와 페이지 크기를 입력한 후 &quot;조회&quot; 버튼을
              클릭해주세요.
            </p>
          </div>
        ) : processedResults.length > 0 ? (
          // 검색 결과가 있는 경우
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                탐색 결과 ({processedResults.length}개)
              </h2>
              <CsvExportButton
                gridRef={gridRef}
                fileName="경로탐색_결과.csv"
                className="ml-4"
              />
            </div>
            <TestGrid
              rowData={processedResults}
              columnDefs={colDefs}
              gridRef={gridRef}
              height={gridHeight}
              gridOptions={{
                onRowClicked: onRowDoubleClicked,
                rowSelection: "none", // 체크박스 사용하므로 단일 선택 비활성화
                suppressScrollOnNewData: true, // 데이터 변경 시 스크롤 위치 유지
                getRowStyle: getRowStyle, // 그룹별 배경색 적용
                // 셀 병합 기능 활성화
                enableCellSpan: true,
                // 셀 병합을 위한 추가 설정
                suppressColumnVirtualisation: true,
                suppressRowGroupHidesColumns: true,
                defaultColDef: {
                  // 모든 셀의 배경색을 부모 요소(행)로부터 상속받도록 설정
                  cellStyle: {
                    backgroundColor: "inherit",
                  },
                },
                // 행 클릭 비활성화 (더블클릭만 사용)
                suppressRowClickSelection: true,
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
            <p className="text-gray-500">해당 페이지에 대한 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 네트워크 맵 */}
      {hasSearched && processedResults.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white h-[1400px] rounded-[24px] p-4">
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
                  defaultZoom: 0.25,
                  defaultPan: { x: 100, y: -650 },
                }}
              />
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
