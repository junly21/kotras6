"use client";

import { useState, useMemo, useRef } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { routeSearchFilterConfig } from "@/features/routeSearch/filterConfig";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import { RouteSearchFilter, RouteSearchResult } from "@/types/routeSearch";
import Spinner from "@/components/Spinner";
import TestGrid from "@/components/TestGrid";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight } from "@/types/network";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // 검색 핸들러
  const handleSearchSubmit = (values: RouteSearchFilter) => {
    handleSearch(values);
    // 검색 시 선택된 경로 초기화
    setSelectedPaths([]);
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
  const handleRowClick = (route: RouteSearchResult) => {
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
    if (!searchResults || searchResults.length === 0) return [];

    return searchResults.map((result, index) => {
      // transfer_list 파싱 (JSON 문자열을 배열로 변환)
      let transferStations: string[] = [];
      try {
        if (result.transfer_list && result.transfer_list !== "[]") {
          transferStations = JSON.parse(result.transfer_list);
        }
      } catch {
        console.warn("transfer_list 파싱 실패:", result.transfer_list);
      }

      // 경로 구성: 출발역 + 환승역 + 도착역
      const pathComponents = [];

      // 출발역
      if (result.start_node) {
        const startStation = result.start_node.match(
          /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
        );
        if (startStation) {
          pathComponents.push(startStation[1]);
        }
      }

      // 환승역들
      transferStations.forEach((transfer) => {
        const transferStation = transfer.match(
          /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
        );
        if (transferStation) {
          pathComponents.push(transferStation[1]);
        }
      });

      // 도착역
      if (result.end_node) {
        const endStation = result.end_node.match(
          /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
        );
        if (endStation) {
          pathComponents.push(endStation[1]);
        }
      }

      return {
        id: result.id || index,
        rank: result.rn || index + 1,
        startStation: result.start_node
          ? result.start_node.match(/\([^)]+\)[^_]*_([^(]+)\([^)]+\)/)?.[1] ||
            ""
          : "",
        endStation: result.end_node
          ? result.end_node.match(/\([^)]+\)[^_]*_([^(]+)\([^)]+\)/)?.[1] || ""
          : "",
        path: pathComponents.join(" → "),
        transferCount: result.transfer_cnt || 0,
        isSelected: selectedPaths.some((path) => path.id === result.id),
        // 상세 정보는 원본 데이터에 저장
        originalData: result,
      };
    });
  }, [searchResults, selectedPaths]);

  // 그리드 컬럼 정의 (체크박스 추가)
  const colDefs = [
    {
      headerName: "선택",
      field: "isSelected",
      width: 100,
      sortable: false,
      cellRenderer: (params: {
        value: boolean;
        data: { originalData: RouteSearchResult };
      }) => {
        return (
          <input
            type="checkbox"
            checked={params.value}
            onChange={(e) =>
              handleCheckboxChange(params.data.originalData, e.target.checked)
            }
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4"
          />
        );
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
    },
    {
      headerName: "순번",
      field: "rank",
      width: 100,
      sortable: true,
      cellStyle: {
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
    },
    {
      headerName: "출발역",
      field: "startStation",
      width: 150,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
    },
    {
      headerName: "도착역",
      field: "endStation",
      width: 150,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
    },
    {
      headerName: "경로",
      field: "path",
      width: 400,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
      cellRenderer: (params: { value: string }) => {
        const pathParts = params.value.split(" → ");
        return (
          <div className="flex items-center gap-1">
            {pathParts.map((part: string, index: number) => (
              <span key={index} className="text-sm">
                {part}
                {index < pathParts.length - 1 && (
                  <span className="mx-2 text-gray-400">→</span>
                )}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      headerName: "환승",
      field: "transferCount",
      width: 200,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        height: "100%",
      },
      cellRenderer: (params: { value: number }) => {
        const count = params.value;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              count === 0
                ? "bg-green-100 text-green-800"
                : count <= 2
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}>
            {count}회
          </span>
        );
      },
    },
    {
      headerName: "상세정보",
      field: "detail",
      width: 150,
      sortable: false,
      cellRenderer: (params: { data: { originalData: RouteSearchResult } }) => {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(params.data.originalData);
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
            보기
          </button>
        );
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      },
    },
  ];

  // 행 클릭 핸들러 제거 (상세정보 버튼으로 대체)
  const onRowClicked = (event: {
    data: { originalData: RouteSearchResult };
  }) => {
    // 행 클릭 시 아무 동작 안함 (상세정보 버튼으로 대체)
    console.log("행 클릭 이벤트 (비활성화):", event);
  };

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
      {processedResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            탐색 결과 ({processedResults.length}개)
          </h2>
          <TestGrid
            rowData={processedResults}
            columnDefs={colDefs}
            gridRef={gridRef}
            height={400}
            gridOptions={{
              onRowClicked: onRowClicked,
              rowSelection: "none", // 체크박스 사용하므로 단일 선택 비활성화
            }}
          />
        </div>
      )}

      {/* 네트워크 맵 */}
      {processedResults.length > 0 && (
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
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>상세 경로 정보</DialogTitle>
          </DialogHeader>
          {selectedRouteForDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    거리
                  </h3>
                  <p className="text-lg font-semibold">
                    {selectedRouteForDetail.km?.toFixed(1)}km
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    소요시간
                  </h3>
                  <p className="text-lg font-semibold">
                    {Math.round(
                      (selectedRouteForDetail.sta_pass_sec || 0) / 60
                    )}
                    분
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    요금
                  </h3>
                  <p className="text-lg font-semibold">
                    {selectedRouteForDetail.cost?.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    환승
                  </h3>
                  <p className="text-lg font-semibold">
                    {selectedRouteForDetail.transfer_cnt || 0}회
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  운영사
                </h3>
                <p className="text-base">
                  {selectedRouteForDetail.oper_list || "-"}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  전체 경로
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    {selectedRouteForDetail.path_nm || "-"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  환승역
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedRouteForDetail.transfer_list &&
                  selectedRouteForDetail.transfer_list !== "[]" ? (
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedRouteForDetail.transfer_list).map(
                        (transfer: string, index: number) => {
                          const stationName = transfer.match(
                            /\([^)]+\)[^_]*_([^(]+)\([^)]+\)/
                          )?.[1];
                          return (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {stationName || transfer}
                            </span>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">환승역 없음</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 결과가 없을 때 */}
      {!isLoading &&
        !hasError &&
        processedResults.length === 0 &&
        filters.RIDE_STN_ID &&
        filters.ALGH_STN_ID && (
          <div className="text-center py-8">
            <p className="text-gray-500">해당 경로에 대한 결과가 없습니다.</p>
          </div>
        )}
    </div>
  );
}
