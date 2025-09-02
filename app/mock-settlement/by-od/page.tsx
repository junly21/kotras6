"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { mockSettlementByOdFilterConfig } from "@/features/mockSettlementByOd/filterConfig";
import {
  MockSettlementByOdFilters,
  MockSettlementByOdData,
  MockSettlementByOdDetailData,
} from "@/types/mockSettlementByOd";
import { MockSettlementResultData } from "@/types/mockSettlementResult";
import { MockSettlementByOdService } from "@/services/mockSettlementByOdService";
import { MockSettlementControlService } from "@/services/mockSettlementControlService";
import { createMockSettlementByOdColDefs } from "@/features/mockSettlementByOd/gridConfig";
import { createMockSettlementByOdDetailColDefs } from "@/features/mockSettlementByOd/detailGridConfig";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import {
  SettlementNodeTooltip,
  SettlementLinkTooltip,
} from "@/components/NetworkMap/DefaultTooltips";
import { useNetworkData } from "@/hooks/useNetworkData";
import type { NetworkMapHighlight, Node, Link } from "@/types/network";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { MockSettlementConfirmDialog } from "@/components/MockSettlementConfirmDialog";
import { MockSettlementDetailModal } from "@/components/MockSettlementDetailModal";
import { MockSettlementResultService } from "@/services/mockSettlementResultService";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마
const mockSettlementByOdSchema = z
  .object({
    STN_ID1: z.string().min(1, "출발역을 선택해주세요"),
    STN_ID2: z.string().min(1, "도착역을 선택해주세요"),
  })
  .refine((data) => data.STN_ID1 !== data.STN_ID2, {
    message: "출발역과 도착역은 같을 수 없습니다.",
    path: ["STN_ID2"], // 에러를 도착역 필드에 표시
  });

// 기본값
const defaultValues = {
  STN_ID1: "",
  STN_ID2: "",
};

export default function MockSettlementByOdPage() {
  const [filters, setFilters] = useState<MockSettlementByOdFilters>({
    settlementName: "",
    STN_ID1: "",
    STN_ID2: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<MockSettlementByOdData[]>(
    []
  );
  const [hasSearched, setHasSearched] = useState(false);

  // 모의정산 정보 상태
  const [settlementInfo, setSettlementInfo] = useState<
    MockSettlementResultData[]
  >([]);

  // 경유지 상세정보 상태
  const [detailData, setDetailData] = useState<MockSettlementByOdDetailData[]>(
    []
  );
  const [selectedRow, setSelectedRow] = useState<MockSettlementByOdData | null>(
    null
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([]);

  // 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<{
    simStmtGrpId: string;
    data: MockSettlementResultData;
  } | null>(null);

  // 모의정산 실행여부 체크 관련 상태
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
  const infoGridRef = useRef(null);

  // 정산명 목록을 가져와서 첫 번째 항목을 자동으로 선택하는 함수
  const initializeSettlementName = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/mock-settlement/settlement-names-select"
      );
      const data = await response.json();

      if (data.options && data.options.length > 0) {
        const firstSettlementName = data.options[0].value;
        // 정산명만 자동으로 설정하고, 조회는 실행하지 않음
        setFilters((prev) => ({
          ...prev,
          settlementName: firstSettlementName,
        }));
      }
    } catch (error) {
      console.error("정산명 목록 조회 실패:", error);
      setError("정산명 목록을 가져오는데 실패했습니다.");
    }
  }, []);

  // 컴포넌트 마운트 시 정산명만 자동으로 설정
  useEffect(() => {
    initializeSettlementName();
  }, [initializeSettlementName]);

  // 그룹별 배경색 계산
  const getGroupBackgroundColor = useCallback(
    (rowIndex: number) => {
      if (!searchResults || searchResults.length === 0) return "";

      let groupIndex = 0;
      for (let i = 0; i <= rowIndex; i++) {
        if (searchResults[i].rn === 1) {
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
    [searchResults]
  );

  // 선택된 행 스타일 적용 함수
  const getRowStyle = useCallback(
    (params: { data: MockSettlementByOdData; rowIndex: number }) => {
      const style: {
        backgroundColor?: string;
        cursor?: string;
        border?: string;
        borderRadius?: string;
        boxShadow?: string;
      } = {};

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

  // 페이지 로드 시 정산명과 역 목록 자동 로드
  useEffect(() => {
    // 정산명 목록은 FilterForm에서 자동으로 로드됨
    // 역 목록은 useNetworkData에서 자동으로 로드됨
  }, []);

  // 경로 하이라이트 계산
  const pathHighlights = useMemo((): NetworkMapHighlight[] => {
    console.log("경로 하이라이트 계산 시작:", {
      selectedPathIdsLength: selectedPathIds.length,
      selectedPathIds: selectedPathIds,
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
    console.log(
      "전체 노드들:",
      nodes.map((n) => ({ id: n.id, name: n.name }))
    );

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

  // 상단 그리드 컬럼 정의 (모의정산 정보) - by-route와 동일한 설정
  const mockSettlementColumnDefs = [
    {
      headerName: "정산명",
      field: "settlementName",
      flex: 1,
      minWidth: 150,
      resizable: false,
    },
    {
      headerName: "거래일자",
      field: "transactionDate",
      flex: 1,
      minWidth: 120,
      resizable: false,
    },
    {
      headerName: "태그기관",
      field: "tagAgency",
      flex: 1,
      minWidth: 120,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "초승노선",
      field: "initialLine",
      flex: 1,
      minWidth: 120,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "노선동등",
      field: "lineSection",
      flex: 1,
      minWidth: 120,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "인.km",
      field: "distanceKm",
      flex: 1,
      minWidth: 100,
      resizable: false,
      valueFormatter: (params: { value: number }) => {
        return params.value.toLocaleString();
      },
      cellStyle: { textAlign: "right" },
    },
  ];

  // 그리드 높이 동적 계산
  const gridHeight = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return 230;

    const baseHeight = 230; // 기본 높이 (1-2개 행일 때)

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

  // 컬럼 정의
  const columnDefs = useMemo(() => {
    return createMockSettlementByOdColDefs();
  }, []);

  const detailColumnDefs = useMemo(() => {
    return createMockSettlementByOdDetailColDefs();
  }, []);

  // 경유지 상세정보 조회 핸들러
  const fetchDetailData = useCallback(
    async (pathKey: string, pathId: string) => {
      setIsDetailLoading(true);
      try {
        const response =
          await MockSettlementByOdService.getSettlementDetailData(
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

  // 모의정산 정보 행 더블클릭 핸들러
  const handleInfoRowDoubleClick = useCallback(
    (event: { data: MockSettlementResultData }) => {
      console.log("by-od 모의정산 정보 행 더블클릭 이벤트 발생:", event);
      const { data } = event;
      console.log("by-od 더블클릭된 데이터:", data);
      console.log("by-od 데이터의 simStmtGrpId:", data?.simStmtGrpId);
      console.log("by-od 데이터의 settlementName:", data?.settlementName);

      if (data && (data.simStmtGrpId || data.settlementName)) {
        console.log("by-od 선택된 모의정산 정보:", data);
        setSelectedSettlement({
          simStmtGrpId: data.simStmtGrpId || data.settlementName,
          data: data,
        });
        setIsDetailModalOpen(true);
      } else {
        console.log("by-od settlementName이 없습니다:", data);
      }
    },
    []
  );

  // 상세 모달 닫기 핸들러
  const handleDetailModalClose = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSettlement(null);
  }, []);

  // 행 클릭 핸들러
  const handleRowClick = useCallback(
    (rowData: MockSettlementByOdData) => {
      console.log("행 클릭된 데이터:", rowData);
      setSelectedRow(rowData);
      // 소계 행이 아닌 경우에만 상세정보 조회 및 경로 ID 설정
      if (rowData.path_detail !== "-") {
        fetchDetailData(rowData.path_key, rowData.path_id);

        // path_id_list 파싱하여 경로 ID 설정
        console.log("path_id_list 원본:", rowData.path_id_list);
        if (rowData.path_id_list && rowData.path_id_list !== "-") {
          const pathIds = rowData.path_id_list
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);
          setSelectedPathIds(pathIds);
          console.log("선택된 경로 ID들:", pathIds);
        } else {
          console.log("path_id_list가 비어있거나 '-'입니다");
          setSelectedPathIds([]);
        }
      } else {
        console.log("소계 행이므로 경로 ID 설정하지 않음");
        setSelectedPathIds([]);
      }
    },
    [fetchDetailData]
  );

  // 실제 검색 실행 함수
  const executeSearch = useCallback(
    async (values: MockSettlementByOdFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

      try {
        // 두 개의 API 호출로 각각 데이터 조회 (다른 페이지들과 동일한 방식)
        console.log("by-od 검색 시작:", values);
        const [mockResponse, byOdResponse] = await Promise.all([
          MockSettlementResultService.getMockSettlementInfoData(
            values.settlementName
          ),
          MockSettlementByOdService.getSettlementData(values),
        ]);

        console.log("by-od 모의정산 정보 응답:", mockResponse);
        console.log("by-od OD별 조회 응답:", byOdResponse);

        if (mockResponse.success && mockResponse.data) {
          setSettlementInfo(mockResponse.data);
        } else {
          console.error("모의정산 정보 조회 실패:", mockResponse.error);
          setSettlementInfo([]);
        }

        if (byOdResponse.success && byOdResponse.data) {
          setSearchResults(byOdResponse.data);

          // 첫 번째 행(소계가 아닌)에 대해 자동으로 상세정보 조회
          const firstValidRow = byOdResponse.data.find(
            (row: MockSettlementByOdData) => row.path_detail !== "-"
          );
          if (firstValidRow) {
            console.log("첫 번째 유효한 행:", firstValidRow);
            setSelectedRow(firstValidRow);
            fetchDetailData(firstValidRow.path_key, firstValidRow.path_id);

            // 첫 번째 행의 path_id_list 설정
            console.log(
              "첫 번째 행 path_id_list 원본:",
              firstValidRow.path_id_list
            );
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
              console.log("첫 번째 행 path_id_list가 비어있거나 '-'입니다");
              setSelectedPathIds([]);
            }
          } else {
            console.log("유효한 행을 찾을 수 없습니다");
          }
        } else {
          setError(byOdResponse.error || "데이터 조회에 실패했습니다.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters.settlementName, fetchDetailData]
  );

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: MockSettlementByOdFilters) => {
      // 모의정산 실행여부 체크
      const isRunningResponse =
        await MockSettlementControlService.checkIsRunning();

      if (isRunningResponse.success && isRunningResponse.data === true) {
        // 모의정산이 실행 중인 경우 확인 다이얼로그 표시
        setPendingAction(() => () => executeSearch(values));
        setIsConfirmDialogOpen(true);
        return;
      }

      // 모의정산이 실행 중이 아닌 경우 바로 검색 진행
      executeSearch(values);
    },
    [executeSearch]
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
        <h1 className="text-2xl font-bold">모의정산 OD별 조회</h1>
      </div>

      {/* 전체 페이지 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">
              모의정산 데이터를 조회하는 중...
            </p>
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
      <FilterForm<MockSettlementByOdFilters>
        fields={mockSettlementByOdFilterConfig.map((field) =>
          field.name === "settlementName" ? { ...field, disabled: true } : field
        )}
        defaultValues={filters}
        schema={z
          .object({
            settlementName: z.string().optional(),
            STN_ID1: z.string().min(1, "출발역을 선택해주세요"),
            STN_ID2: z.string().min(1, "도착역을 선택해주세요"),
          })
          .refine((data) => data.STN_ID1 !== data.STN_ID2, {
            message: "출발역과 도착역은 같을 수 없습니다.",
            path: ["STN_ID2"],
          })}
        values={filters}
        onChange={(values) => setFilters((prev) => ({ ...prev, ...values }))}
        onSearch={handleSearchSubmit}
      />

      {/* 모의정산 정보 그리드 - 항상 표시 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">모의정산 정보</h3>
        {!hasSearched ? (
          <div className="bg-gray-50 border flex flex-col justify-center items-center h-[140px] border-2 border-dashed border-gray-300 rounded-lg p-16">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">모의정산 정보</p>
              <p className="text-sm">
                정산명, 출발역, 도착역을 선택하고 조회 버튼을 누르면 모의정산
                정보가 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            {settlementInfo.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                <div className="h-32">
                  <TestGrid
                    rowData={settlementInfo}
                    columnDefs={mockSettlementColumnDefs}
                    gridRef={infoGridRef}
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
                      onRowDoubleClicked: handleInfoRowDoubleClick,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 결과 영역 */}
      {!hasSearched && (
        <div className="bg-gray-50 flex flex-col justify-center items-center h-[450px] border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">OD별 조회 결과</p>
            <p className="text-sm">
              정산명, 출발역, 도착역을 선택하고 조회 버튼을 누르면 OD별
              정산결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && searchResults.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">OD별 정산결과</h3>{" "}
              </div>
              <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                <div style={{ height: `${gridHeight}px` }}>
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
                        enableClickSelection: true,
                        suppressRowDeselection: true,
                      },
                      defaultColDef: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        suppressMovable: true,
                      },
                      onRowClicked: (event: {
                        data: MockSettlementByOdData;
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
                        getRowStyle: getDetailRowStyle, // 마지막 행 스타일 적용
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
                          showLegend: true,
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

      {/* 모의정산 상세 모달 */}
      {selectedSettlement && (
        <MockSettlementDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          simStmtGrpId={selectedSettlement.simStmtGrpId}
          gridData={selectedSettlement.data}
        />
      )}

      {/* 모의정산 실행중 확인 다이얼로그 */}
      <MockSettlementConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          if (pendingAction) {
            // 모의정산 강제종료
            const stopResponse =
              await MockSettlementControlService.stopSimulation();
            if (stopResponse.success) {
              // 강제종료 성공 시 pending action 실행
              pendingAction();
            } else {
              setError(
                "모의정산 강제종료에 실패했습니다: " + stopResponse.error
              );
            }
          }
          setIsConfirmDialogOpen(false);
          setPendingAction(null);
        }}
        actionType="조회"
      />
    </div>
  );
}
