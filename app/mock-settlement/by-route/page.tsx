"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MockSettlementByRouteService } from "@/services/mockSettlementByRouteService";
import { MockSettlementResultService } from "@/services/mockSettlementResultService";
import { MockSettlementControlService } from "@/services/mockSettlementControlService";
import {
  mockSettlementByRouteFilterConfig,
  mockSettlementByRouteSchema,
} from "@/features/mockSettlementByRoute/filterConfig";
import { createMockSettlementByRouteColDefs } from "@/features/mockSettlementByRoute/gridConfig";
import type {
  MockSettlementByRouteFilters,
  MockSettlementByRouteData,
} from "@/types/mockSettlementByRoute";
import { MockSettlementResultData } from "@/types/mockSettlementResult";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { MockSettlementConfirmDialog } from "@/components/MockSettlementConfirmDialog";
import { MockSettlementDetailModal } from "@/components/MockSettlementDetailModal";
import { z } from "zod";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function MockSettlementByRoutePage() {
  const mockSettlementGridRef = useRef<AgGridReact>(null);
  const byRouteGridRef = useRef<AgGridReact>(null);
  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MockSettlementByRouteFilters>({
    settlementName: "",
    agency: "",
  });
  const [mockSettlementData, setMockSettlementData] = useState<
    MockSettlementResultData[]
  >([]);
  const [byRouteData, setByRouteData] = useState<MockSettlementByRouteData[]>(
    []
  );

  // 토스트 상태
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "info",
  });

  // 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<{
    simStmtGrpId: string;
    data: MockSettlementResultData;
  } | null>(null);

  // 모의정산 실행여부 체크 관련 상태
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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

  // 실제 검색 실행 함수
  const executeSearch = useCallback(
    async (values: MockSettlementByRouteFilters) => {
      setHasSearched(true);
      setIsLoading(true);
      setError(null);

      try {
        // 두 개의 API 호출로 각각 데이터 조회
        const [mockResponse, byRouteResponse] = await Promise.all([
          MockSettlementResultService.getMockSettlementInfoData(
            values.settlementName
          ),
          MockSettlementByRouteService.getMockSettlementByRouteData(values),
        ]);

        if (mockResponse.success && mockResponse.data) {
          setMockSettlementData(mockResponse.data);
        } else {
          setError(
            mockResponse.error || "모의정산 정보 데이터 조회에 실패했습니다."
          );
        }

        if (byRouteResponse.success && byRouteResponse.data) {
          console.log("노선별 조회 데이터 성공:", byRouteResponse.data);
          setByRouteData(byRouteResponse.data);
        } else {
          console.error("노선별 조회 데이터 조회 실패:", byRouteResponse.error);
          console.error("노선별 조회 응답 전체:", byRouteResponse);
        }

        setToast({
          isVisible: true,
          message: "데이터를 성공적으로 조회했습니다.",
          type: "success",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setToast({
          isVisible: true,
          message: `데이터 조회 실패: ${
            err instanceof Error ? err.message : "알 수 없는 오류"
          }`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    async (values: MockSettlementByRouteFilters) => {
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

  // 수동 검색 핸들러 (필터폼에서 검색 버튼 클릭 시)
  const handleManualSearch = useCallback(
    async (values: MockSettlementByRouteFilters) => {
      await handleSearch(values);
      // 필터폼은 계속 보이도록 유지 (노선 변경 후 재조회 가능)
    },
    [handleSearch]
  );

  // 상단 그리드 컬럼 정의 (모의정산 정보)
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
      headerName: "태그기관 비율(%)",
      field: "tagAgency",
      flex: 1,
      minWidth: 120,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "초승노선 비율(%)",
      field: "initialLine",
      flex: 1,
      minWidth: 120,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "노선동등 비율(%)",
      field: "lineSection",
      flex: 1,
      minWidth: 120,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "인.km 비율(%)",
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

  // 하단 그리드 컬럼 정의 (노선별 조회 결과) - 동적 그룹핑 컬럼 사용
  const byRouteColumnDefs = useMemo(() => {
    return createMockSettlementByRouteColDefs(byRouteData);
  }, [byRouteData]);

  // 푸터 행 데이터 생성
  const footerRowData = useMemo(() => {
    if (!byRouteData || byRouteData.length === 0) return [];

    const footerRow: Record<string, string | number> = {
      line_nm: `총 ${byRouteData.length}건`,
    };

    // 각 컬럼의 총계 계산
    if (byRouteData.length > 0) {
      const firstItem = byRouteData[0];
      const keys = Object.keys(firstItem);

      keys.forEach((key) => {
        if (key !== "line_nm") {
          const total = byRouteData.reduce((sum, item) => {
            const value = item[key];
            return sum + (typeof value === "number" ? value : 0);
          }, 0);
          // 소수점 제거하고 정수로 표시
          footerRow[key] = `${Math.round(total).toLocaleString()}`;
        }
      });
    }

    return [footerRow];
  }, [byRouteData]);

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = useCallback(
    (event: { data: MockSettlementResultData }) => {
      console.log("행 더블클릭 이벤트 발생:", event);
      const { data } = event;
      if (data && (data.simStmtGrpId || data.settlementName)) {
        console.log("선택된 데이터:", data);
        setSelectedSettlement({
          simStmtGrpId: data.simStmtGrpId || data.settlementName,
          data: data,
        });
        setIsDetailModalOpen(true);
      } else {
        console.log("settlementName이 없습니다:", data);
      }
    },
    []
  );

  // 상세 모달 닫기 핸들러
  const handleDetailModalClose = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSettlement(null);
  }, []);

  // 원단위 변환은 그리드 컬럼 설정에서 처리
  const byRouteRowData = useMemo(() => {
    return byRouteData.map((item) => {
      const processedItem = { ...item } as Record<string, string | number>;

      // 모든 숫자 필드에서 소수점 제거
      Object.keys(processedItem).forEach((key) => {
        if (key !== "line_nm" && typeof processedItem[key] === "number") {
          processedItem[key] = Math.round(processedItem[key] as number);
        }
      });

      return processedItem;
    });
  }, [byRouteData]);

  return (
    <ProtectedRoute requiredPath="/mock-settlement/by-route">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">모의정산 노선별 조회</h1>

        {/* 필터 폼 */}
        <FilterForm<MockSettlementByRouteFilters>
          fields={mockSettlementByRouteFilterConfig.map((field) =>
            field.name === "settlementName"
              ? { ...field, disabled: true }
              : field
          )}
          defaultValues={filters}
          values={filters}
          schema={mockSettlementByRouteSchema}
          onSearch={handleManualSearch}
        />

        {/* 전체 페이지 로딩 스피너 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <div className="text-center">
              <Spinner />
              <p className="mt-4 text-gray-600">데이터를 조회하는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 상단: 모의정산 정보 그리드 */}
        {!hasSearched && (
          <div className="bg-gray-50 flex flex-col justify-center items-center h-[140px] border-2 border-dashed border-gray-300 rounded-lg p-16">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">모의정산 정보</p>
              <p className="text-sm">
                정산명과 보관기관을 선택하고 조회 버튼을 누르면 결과가
                표시됩니다.
              </p>
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="space-y-4">
            {!isLoading && mockSettlementData.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-4">모의정산 정보</h3>
                <div className="bg-white border border-gray-200 rounded-[24px] p-2">
                  <div className="h-32">
                    <TestGrid
                      rowData={mockSettlementData}
                      columnDefs={mockSettlementColumnDefs}
                      gridRef={mockSettlementGridRef}
                      gridOptions={{
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
                        onRowDoubleClicked: handleRowDoubleClick,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {!isLoading && mockSettlementData.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-[24px] p-4">
                <p className="text-yellow-800">
                  조회된 모의정산 정보가 없습니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 하단: 노선별 조회 결과 그리드 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">노선별 조회 결과</h3>
            <div className="flex items-center gap-4">
              <CsvExportButton
                gridRef={byRouteGridRef}
                fileName="mock_settlement_by_route_data.csv"
                className="shadow-lg bg-accent-500"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[24px] p-4">
            <div className="h-[350px]">
              <TestGrid
                rowData={byRouteRowData}
                columnDefs={byRouteColumnDefs}
                gridRef={byRouteGridRef}
                gridOptions={{
                  headerHeight: 40, // 그룹핑된 헤더를 위한 높이 조정
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
                  pinnedBottomRowData: footerRowData, // 푸터 행 데이터 추가
                }}
              />
            </div>
          </div>
        </div>

        {/* 토스트 알림 */}
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />

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
    </ProtectedRoute>
  );
}
