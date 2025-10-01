"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { routeSearchFilterConfig } from "@/features/routeSearch/filterConfig";
import { createPathKeyColDefs } from "@/features/routeSearch/view2GridConfig";
import { processView2Results } from "@/features/routeSearch/view2GridDataProcessor";
import { useRouteSearchPathKey } from "@/hooks/useRouteSearch";
import {
  RouteSearchFilter,
  RouteSearchResult,
  StationOption,
} from "@/types/routeSearch";
import Spinner from "@/components/Spinner";
import TestGrid from "@/components/TestGrid";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { RouteDetailPanel } from "@/components/routeSearch/RouteDetailPanel";
import { useNetworkData } from "@/hooks/useNetworkData";

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
  PATH_GRP_ID: "",
  RIDE_STN_ID: "",
  ALGH_STN_ID: "",
};

export default function PathKeyPage() {
  const gridRef = useRef<AgGridReact>(null);

  const { searchResults, searchLoading, searchError, handleSearch } =
    useRouteSearchPathKey();

  const [filters, setFilters] = useState<RouteSearchFilter>(defaultValues);
  const [selectedRouteForDetail, setSelectedRouteForDetail] =
    useState<RouteSearchResult | null>(null);
  const [selectedRow, setSelectedRow] = useState<RouteSearchResult | null>(
    null
  );
  const [arrivalStationOptions, setArrivalStationOptions] = useState<
    StationOption[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 필터 변경 핸들러 - useCallback으로 최적화
  const handleFilterChange = useCallback(
    (values: RouteSearchFilter) => {
      setFilters(values);

      // 경로탐색 그룹이 변경되면 출발역과 도착역 초기화
      if (values.PATH_GRP_ID && values.PATH_GRP_ID !== filters.PATH_GRP_ID) {
        console.log("경로탐색 그룹 선택됨:", values.PATH_GRP_ID);
        setFilters((prev) => ({
          ...prev,
          RIDE_STN_ID: "",
          ALGH_STN_ID: "",
        }));
        setArrivalStationOptions([]);
        return;
      }

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
          body: JSON.stringify({
            PATH_GRP_ID: values.PATH_GRP_ID,
            RIDE_STN_ID: values.RIDE_STN_ID,
          }),
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
    [filters.PATH_GRP_ID, filters.RIDE_STN_ID]
  );

  // 검색 핸들러 - useCallback으로 최적화
  const handleSearchSubmit = useCallback(
    (values: RouteSearchFilter) => {
      // 현재 filters 상태를 사용 (PATH_GRP_ID가 확실히 포함됨)
      const searchData = {
        PATH_GRP_ID: filters.PATH_GRP_ID,
        RIDE_STN_ID: values.RIDE_STN_ID || filters.RIDE_STN_ID,
        ALGH_STN_ID: values.ALGH_STN_ID || filters.ALGH_STN_ID,
      };

      handleSearch(searchData);
      setSelectedRouteForDetail(null); // 검색 시 선택된 경로 초기화
      setSelectedRow(null); // 검색 시 선택된 행 초기화
      setHasSearched(true);
    },
    [handleSearch, filters]
  );

  // 행 클릭 핸들러 - 상세 정보 패널에 표시
  const handleRowClick = useCallback((route: RouteSearchResult) => {
    setSelectedRouteForDetail(route);
    setSelectedRow(route); // 선택된 행 상태 업데이트
  }, []);

  // 행 클릭 핸들러 - useCallback으로 최적화
  const onRowClicked = useCallback(
    (event: { data: { originalData: RouteSearchResult } }) => {
      console.log("행 클릭 이벤트:", event);
      console.log("path_key:", event.data.originalData.path_key);
      handleRowClick(event.data.originalData);
    },
    [handleRowClick]
  );

  // 네트워크 데이터 로드 (상세경로에서 역명 변환용)
  const { nodes } = useNetworkData();

  // 경로탐색 결과 데이터 가공 - useMemo로 최적화
  const processedResults = useMemo(() => {
    return processView2Results(searchResults, nodes);
  }, [searchResults, nodes]);

  // 그룹별 배경색 계산 - OD별 조회 페이지 로직 참고
  const getGroupBackgroundColor = useCallback(
    (rowIndex: number) => {
      if (!processedResults || processedResults.length === 0) return "";

      let groupIndex = 0;
      let currentGroupNo = -1;

      for (let i = 0; i <= rowIndex; i++) {
        if (processedResults[i].groupNo !== currentGroupNo) {
          currentGroupNo = processedResults[i].groupNo;
          groupIndex++;
        }
      }

      // 그룹별로 다른 배경색 적용 (3가지 옅은 색상)
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
    (params: {
      rowIndex: number;
      data: { groupNo: number; originalData: RouteSearchResult };
    }) => {
      const style: React.CSSProperties = {};

      // 그룹별 배경색 적용
      const groupColor = getGroupBackgroundColor(params.rowIndex);
      if (groupColor) {
        style.backgroundColor = groupColor;
      }

      // 선택된 행 하이라이트 - view1과 동일한 id 기준으로 비교
      if (
        params.data &&
        selectedRow &&
        params.data.originalData.id === selectedRow.id
      ) {
        style.backgroundColor = "#e3f2fd"; // 선택된 행은 파란색 배경
        style.border = "3px solid #1976d2"; // 파란색 테두리
        style.borderRadius = "4px"; // 모서리 둥글게
      }

      return style;
    },
    [selectedRow, getGroupBackgroundColor]
  );

  // 그리드 컬럼 정의 - useMemo로 최적화
  const colDefs = useMemo(() => {
    return createPathKeyColDefs();
  }, []);

  // 그리드 높이 동적 계산 - useMemo로 최적화
  const gridHeight = useMemo(() => {
    if (!processedResults || processedResults.length === 0) return 200;

    const baseHeight = 160; // 기본 높이 (1-2개 행일 때)

    let calculatedHeight: number;

    if (processedResults.length <= 2) {
      // 1-2개 행: 기본 높이
      calculatedHeight = baseHeight;
    } else if (processedResults.length <= 8) {
      // 3-9개 행: 기본 높이의 2배
      calculatedHeight = baseHeight * 1.5;
    } else {
      // 9개 이상: 기본 높이의 2배의 2배 (4배)
      calculatedHeight = baseHeight * 3;
    }

    return calculatedHeight;
  }, [processedResults]);

  // 동적 필터 설정 생성 - useMemo로 최적화
  const dynamicFilterConfig = useMemo(() => {
    return routeSearchFilterConfig.map((field) => {
      if (field.name === "RIDE_STN_ID") {
        return {
          ...field,
          disabled: !filters.PATH_GRP_ID,
        };
      }
      if (field.name === "ALGH_STN_ID") {
        return {
          ...field,
          options: arrivalStationOptions,
          disabled: !filters.PATH_GRP_ID || !filters.RIDE_STN_ID,
        };
      }
      return field;
    });
  }, [arrivalStationOptions, filters.PATH_GRP_ID, filters.RIDE_STN_ID]);

  // 전체 로딩 상태
  const isLoading = searchLoading;

  // 에러 상태
  const hasError = searchError;

  return (
    <ProtectedRoute requiredPath="/route-search/view2">
      <div className="space-y-6">
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
                경로 탐색
              </h2>
              <p className="text-blue-600">
                네트워크를 선택한 후, 출발역과 도착역을 선택하여
                &quot;조회&quot; 버튼을 클릭해주세요.
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

        {/* 상세 정보 패널 - 하단에 간단한 레이아웃으로 배치 */}
        {hasSearched && processedResults.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">상세 정보</h2>
              <RouteDetailPanel route={selectedRouteForDetail} />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
