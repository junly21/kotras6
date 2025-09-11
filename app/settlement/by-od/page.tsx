"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { settlementByOdFilterConfig } from "@/features/settlementByOd/filterConfig";
import {
  SettlementByOdFilters,
  SettlementByOdData,
  SettlementByOdDetailData,
} from "@/types/settlementByOd";
import { SettlementByOdService } from "@/services/settlementByOdService";
import { createSettlementByOdColDefs } from "@/features/settlementByOd/gridConfig";
import { createSettlementByOdDetailColDefs } from "@/features/settlementByOd/detailGridConfig";
import TestGrid from "@/components/TestGrid";

import Spinner from "@/components/Spinner";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import {
  SettlementNodeTooltip,
  SettlementLinkTooltip,
} from "@/components/NetworkMap/DefaultTooltips";
import { useNetworkData } from "@/hooks/useNetworkData";
import { useDestinationOptions } from "@/hooks/useDestinationOptions";
import type { NetworkMapHighlight, Node, Link } from "@/types/network";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마
const settlementByOdSchema = z
  .object({
    STN_ID1: z.string().min(1, "출발역을 선택해주세요"),
    STN_ID2: z.string().min(1, "도착역을 선택해주세요"),
  })
  .refine((data) => data.STN_ID1 !== data.STN_ID2, {
    message: "출발역과 도착역은 같을 수 없습니다.",
    path: ["STN_ID2"], // 에러를 도착역 필드에 표시
  });

// 기본값
const defaultValues: SettlementByOdFilters = {
  STN_ID1: "",
  STN_ID2: "",
};

export default function SettlementByOdPage() {
  const [filters, setFilters] = useState<SettlementByOdFilters>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SettlementByOdData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 경유지 상세정보 상태
  const [detailData, setDetailData] = useState<SettlementByOdDetailData[]>([]);
  const [selectedRow, setSelectedRow] = useState<SettlementByOdData | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([]);

  // 네트워크 데이터 로드
  const {
    nodes,
    links,
    svgText,
    isLoading: isMapLoading,
    error: mapError,
    findNodeIdsByStationName,
  } = useNetworkData();

  // 도착역 옵션 관리
  const {
    destinationOptions,
    fetchDestinationOptions,
    clearDestinationOptions,
  } = useDestinationOptions();

  // AG Grid refs
  const gridRef = useRef(null);
  const detailGridRef = useRef(null);

  // 경로 하이라이트 계산
  const pathHighlights = useMemo((): NetworkMapHighlight[] => {
    console.log("경로 하이라이트 계산 시작:", {
      selectedPathIdsLength: selectedPathIds.length,
      nodesLength: nodes.length,
    });

    if (selectedPathIds.length === 0 || nodes.length === 0) {
      console.log("경로 하이라이트: 선택된 경로 없음");
      return [];
    }

    // 실제 존재하는 노드 ID들만 필터링
    const validNodeIds = selectedPathIds.filter((id) =>
      nodes.some((node) => node.id === id)
    );
    console.log("유효한 노드 ID들:", validNodeIds);

    if (validNodeIds.length === 0) {
      console.log("경로 하이라이트: 매칭되는 노드 없음");
      return [];
    }

    // 경로 하이라이트의 경우 선택된 노드들만 표시
    const result = [
      {
        type: "path" as const,
        value: validNodeIds,
        priority: 1, // 선택된 경로는 우선순위 1로 설정
      },
    ];

    console.log("최종 하이라이트 설정:", result);
    return result;
  }, [selectedPathIds, nodes]);

  // 정산 데이터를 노드별로 매핑
  const settlementDataMap = useMemo(() => {
    const map = new Map<
      string,
      { base_amt: number; ubrw_amt: number; km: number }
    >();

    detailData.forEach((detail) => {
      if (detail.stn_nm !== "-") {
        const nodeIds = findNodeIdsByStationName(detail.stn_nm);
        nodeIds.forEach((nodeId) => {
          map.set(nodeId, {
            base_amt: detail.base_amt,
            ubrw_amt: detail.ubrw_amt,
            km: detail.km,
          });
        });
      }
    });

    return map;
  }, [detailData, findNodeIdsByStationName]);

  // 그리드 높이 동적 계산
  const gridHeight = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return 150;

    const baseHeight = 150; // 기본 높이 (1-2개 행일 때)

    let calculatedHeight: number;

    if (searchResults.length <= 2) {
      // 1-2개 행: 기본 높이
      calculatedHeight = baseHeight;
    } else if (searchResults.length <= 9) {
      // 3-9개 행: 기본 높이의 1.5배
      calculatedHeight = baseHeight * 1.5;
    } else {
      // 9개 이상: 기본 높이의 2배
      calculatedHeight = baseHeight * 2;
    }

    return calculatedHeight;
  }, [searchResults]);

  // 동적 필터 설정 (도착역 옵션 포함)
  const dynamicFilterConfig = useMemo(() => {
    return settlementByOdFilterConfig.map((field) => {
      if (field.name === "STN_ID2") {
        return {
          ...field,
          options: destinationOptions, // 페이지에서 관리하는 도착역 옵션
        };
      }
      return field;
    });
  }, [destinationOptions]);

  // 컬럼 정의
  const columnDefs = useMemo(() => {
    return createSettlementByOdColDefs();
  }, []);

  const detailColumnDefs = useMemo(() => {
    return createSettlementByOdDetailColDefs();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (values: SettlementByOdFilters) => {
      setFilters(values);

      // 승차역이 변경되었을 때 도착역 옵션 재조회
      if (values.STN_ID1 !== filters.STN_ID1) {
        if (values.STN_ID1) {
          fetchDestinationOptions(values.STN_ID1);
        } else {
          clearDestinationOptions();
        }
      }
    },
    [filters.STN_ID1, fetchDestinationOptions, clearDestinationOptions]
  );

  // 경유지 상세정보 조회 핸들러
  const fetchDetailData = useCallback(
    async (pathKey: string, pathId: string) => {
      setIsDetailLoading(true);
      try {
        const response = await SettlementByOdService.getSettlementDetailData(
          pathKey,
          pathId
        );
        if (response.success && response.data) {
          setDetailData(response.data);
        } else {
          console.error("상세정보 조회 실패:", response.error);
          setDetailData([]);
        }
      } catch (err) {
        console.error("상세정보 조회 에러:", err);
        setDetailData([]);
      } finally {
        setIsDetailLoading(false);
      }
    },
    []
  );

  // 행 클릭 핸들러
  const handleRowClick = useCallback(
    (rowData: SettlementByOdData) => {
      setSelectedRow(rowData);
      // 소계 행이 아닌 경우에만 상세정보 조회 및 경로 ID 설정
      if (rowData.path_detail !== "-") {
        fetchDetailData(rowData.path_key, rowData.path_id);

        // path_id_list 파싱하여 경로 ID 설정
        if (rowData.path_id_list && rowData.path_id_list !== "-") {
          const pathIds = rowData.path_id_list
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);
          setSelectedPathIds(pathIds);
          console.log("선택된 경로 ID들:", pathIds);
        } else {
          setSelectedPathIds([]);
        }
      } else {
        setSelectedPathIds([]);
      }
    },
    [fetchDetailData]
  );

  // OD별 조회 결과 데이터 가공 - 그룹의 첫 번째 행에만 번호와 확정경로 표시
  const processedResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];

    let groupNumber = 1;

    return searchResults.map((result, index) => {
      // 현재 행이 그룹의 첫 번째 행인지 확인
      // 첫 번째 행이거나 이전 행이 소계 행(path_detail === '-')인 경우가 새로운 그룹의 시작
      const isFirstInGroup =
        index === 0 ||
        (index > 0 && searchResults[index - 1].path_detail === "-");

      // 새로운 그룹이 시작되면 그룹 번호 증가
      if (isFirstInGroup && result.path_detail !== "-") {
        groupNumber++;
      }

      return {
        ...result,
        // 그룹의 첫 번째 행이 아닌 경우 번호와 확정경로를 null로 설정
        // 단, 소계 행(path_detail === '-')은 번호 컬럼에 "소계" 표시하고 확정경로는 빈 셀
        rn:
          isFirstInGroup && result.path_detail !== "-"
            ? groupNumber - 1
            : result.path_detail === "-"
            ? "소계"
            : null,
        confirmed_path: isFirstInGroup ? result.confirmed_path : null,
      };
    });
  }, [searchResults]);

  // 그룹별 배경색 계산
  const getGroupBackgroundColor = useCallback(
    (rowIndex: number) => {
      if (!processedResults || processedResults.length === 0) return "";

      let groupIndex = 0;
      for (let i = 0; i <= rowIndex; i++) {
        // 첫 번째 행이거나 이전 행이 소계 행인 경우가 새로운 그룹의 시작
        if (i === 0 || (i > 0 && processedResults[i - 1].path_detail === "-")) {
          groupIndex++;
        }
      }

      // 그룹별로 다른 배경색 적용 (3가지 옅은 색상)
      const groupColors = [
        "#f0f8f0", // 옅은 초록색
        "#fff8f0", // 옅은 주황색
        "#f8f0f8", // 옅은 보라색
      ];

      return groupColors[groupIndex % groupColors.length];
    },
    [processedResults]
  );

  // 선택된 행 스타일 적용 함수
  const getRowStyle = useCallback(
    (params: { rowIndex: number; data: SettlementByOdData }) => {
      const style: React.CSSProperties = {};

      // 그룹별 배경색 적용 (소계 행 포함)
      const groupColor = getGroupBackgroundColor(params.rowIndex);
      if (groupColor) {
        style.backgroundColor = groupColor;
      }

      // 소계 행인 경우 클릭 불가능함을 시각적으로 표시
      if (params.data?.path_detail === "-") {
        style.cursor = "not-allowed";
      } else {
        style.cursor = "pointer";
      }

      // selectedRow가 있고, 현재 행이 선택된 행과 동일한 경우 파란색 배경과 테두리 적용
      if (
        params.data &&
        selectedRow &&
        params.data.path_key === selectedRow.path_key &&
        params.data.path_id === selectedRow.path_id
      ) {
        style.backgroundColor = "#e3f2fd"; // 선택된 행은 파란색 배경
        style.border = "2px solid #1976d2"; // 파란색 테두리
        style.borderRadius = "4px"; // 모서리 둥글게
        style.boxShadow = "0 2px 4px rgba(25, 118, 210, 0.2)"; // 그림자 효과
      }

      return style;
    },
    [selectedRow, getGroupBackgroundColor]
  );

  // 경유지 상세정보 그리드 행 스타일 함수
  const getDetailRowStyle = useCallback(
    (params: { rowIndex: number }) => {
      // 마지막 행인 경우 footer 스타일 적용
      if (params.rowIndex === detailData.length - 1) {
        return {
          backgroundColor: "#f8f9fa",
          fontWeight: "bold",
          borderTop: "2px solid #dee2e6",
        };
      }
      return {};
    },
    [detailData.length]
  );

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: SettlementByOdFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

      // 검색 시작 시 이전 데이터 초기화
      setSearchResults([]);
      setSelectedRow(null);
      setDetailData([]);
      setSelectedPathIds([]);

      try {
        const response = await SettlementByOdService.getSettlementData(values);
        if (response.success && response.data) {
          setSearchResults(response.data);

          // 첫 번째 행(소계가 아닌)에 대해 자동으로 상세정보 조회
          const firstValidRow = response.data.find(
            (row) => row.path_detail !== "-"
          );
          if (firstValidRow) {
            setSelectedRow(firstValidRow);
            fetchDetailData(firstValidRow.path_key, firstValidRow.path_id);

            // 첫 번째 행의 path_id_list 설정
            if (
              firstValidRow.path_id_list &&
              firstValidRow.path_id_list !== "-"
            ) {
              const pathIds = firstValidRow.path_id_list
                .split(",")
                .map((id: string) => id.trim())
                .filter((id: string) => id.length > 0);
              setSelectedPathIds(pathIds);
              console.log("첫 번째 행 경로 ID들:", pathIds);
            } else {
              setSelectedPathIds([]);
            }
          }
        } else {
          setError(response.error || "데이터 조회에 실패했습니다.");
          // 데이터가 없을 때도 명시적으로 빈 배열로 설정
          setSearchResults([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        // 에러 발생 시에도 빈 배열로 설정
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchDetailData]
  );

  // 커스텀 툴팁 함수들
  const customTooltips = useMemo(
    () => ({
      node: (node: Node) => {
        const settlementData = settlementDataMap.get(node.id);
        return (
          <SettlementNodeTooltip node={node} settlementData={settlementData} />
        );
      },
      link: (link: Link) => {
        return <SettlementLinkTooltip link={link} />;
      },
    }),
    [settlementDataMap]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">정산결과 OD별 조회</h1>
      </div>

      {/* 전체 페이지 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">정산 데이터를 조회하는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 네트워크 맵 에러 메시지 */}
      {mapError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">노선도 로드 실패: {mapError}</p>
        </div>
      )}

      {/* 필터 폼 */}
      <FilterForm
        fields={dynamicFilterConfig}
        defaultValues={defaultValues}
        schema={settlementByOdSchema}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearchSubmit}
      />

      {/* 결과 영역 */}
      {!hasSearched && (
        <div className="bg-gray-50 flex flex-col justify-center items-center h-[590px] border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">조회 결과</p>
            <p className="text-sm">
              출발역과 도착역을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && processedResults.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">OD별 정산결과</h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                <div style={{ height: `${gridHeight}px` }}>
                  <TestGrid
                    rowData={processedResults}
                    columnDefs={columnDefs}
                    gridRef={gridRef}
                    gridOptions={{
                      headerHeight: 40,
                      suppressCellFocus: true,
                      suppressMovableColumns: true,
                      suppressMenuHide: true,
                      rowSelection: {
                        enableClickSelection: false,
                      },
                      defaultColDef: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        suppressMovable: true,
                      },
                      onRowClicked: (event: {
                        data: SettlementByOdData;
                        rowIndex: number;
                      }) => {
                        // 소계 행(path_detail이 "-")은 클릭 비활성화
                        if (event.data.path_detail === "-") {
                          return;
                        }
                        handleRowClick(event.data);
                      },
                      getRowStyle: getRowStyle, // 행 클릭 시 스타일 적용
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {!isLoading && searchResults.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">조회된 데이터가 없습니다.</p>
            </div>
          )}

          {/* 경유지 상세정보 영역 - 데이터가 있고 선택된 행이 있을 때만 표시 */}
          {searchResults.length > 0 &&
            selectedRow &&
            selectedRow.path_detail !== "-" && (
              <>
                <h3 className="text-lg font-semibold mb-4">경유지 상세정보</h3>
                <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                  {isDetailLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Spinner />
                      <p className="ml-2 text-gray-600">
                        상세정보를 조회하는 중...
                      </p>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <TestGrid
                        rowData={detailData}
                        columnDefs={detailColumnDefs}
                        gridRef={detailGridRef}
                        gridOptions={{
                          headerHeight: 40,
                          suppressCellFocus: true,
                          suppressMovableColumns: true,
                          suppressMenuHide: true,
                          rowSelection: {
                            enableClickSelection: false,
                          },
                          defaultColDef: {
                            sortable: false,
                            filter: false,
                            resizable: false,
                            suppressMovable: true,
                          },
                          getRowStyle: getDetailRowStyle, // 마지막 행 스타일 적용
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

          {/* 네트워크 맵 영역 - 데이터가 있고 선택된 행이 있을 때만 표시 */}
          {searchResults.length > 0 &&
            selectedRow &&
            selectedRow.path_detail !== "-" &&
            !isDetailLoading && (
              <>
                <h3 className="text-lg font-semibold mb-4">경로 시각화</h3>
                <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                  {isMapLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Spinner />
                      <p className="ml-2 text-gray-600">
                        노선도를 불러오는 중...
                      </p>
                    </div>
                  ) : (
                    <div className="h-[450px]">
                      <NetworkMap
                        nodes={nodes}
                        links={links}
                        svgText={svgText}
                        config={{
                          width: "100%",
                          height: "100%",
                          showZoomControls: true,
                          showTooltips: true,
                          showLegend: true,
                        }}
                        highlights={pathHighlights}
                        tooltips={customTooltips}
                        startStationId={filters.STN_ID1}
                        endStationId={filters.STN_ID2}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      )}
    </div>
  );
}
