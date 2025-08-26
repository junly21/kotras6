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
import CsvExportButton from "@/components/CsvExportButton";
import Spinner from "@/components/Spinner";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import {
  SettlementNodeTooltip,
  SettlementLinkTooltip,
} from "@/components/NetworkMap/DefaultTooltips";
import { useNetworkData } from "@/hooks/useNetworkData";
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

  // 컬럼 정의
  const columnDefs = useMemo(() => {
    return createSettlementByOdColDefs();
  }, []);

  const detailColumnDefs = useMemo(() => {
    return createSettlementByOdDetailColDefs();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (values: SettlementByOdFilters) => {
    setFilters(values);
  };

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

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: SettlementByOdFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

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
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
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
        <h1 className="text-2xl font-bold">OD별 정산결과 조회</h1>
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
        fields={settlementByOdFilterConfig}
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
          {!isLoading && searchResults.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">OD별 정산결과</h3>
                {/* CSV Export 버튼 */}
                {hasSearched && searchResults.length > 0 && (
                  <div className="flex justify-end">
                    <CsvExportButton
                      gridRef={gridRef}
                      fileName="OD별_정산결과.csv"
                      className="bg-blue-600 hover:bg-blue-700"
                    />
                  </div>
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                <div className="h-[150px]">
                  <TestGrid
                    rowData={searchResults}
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
                      onRowClicked: (event: { data: SettlementByOdData }) => {
                        handleRowClick(event.data);
                      },
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

          {/* 경유지 상세정보 영역 */}
          {selectedRow && selectedRow.path_detail !== "-" && (
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
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* 네트워크 맵 영역 */}
          {selectedRow &&
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
                        }}
                        highlights={pathHighlights}
                        tooltips={customTooltips}
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
