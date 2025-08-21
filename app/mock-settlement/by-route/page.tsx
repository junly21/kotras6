"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
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
import { UnitRadioGroup, type Unit } from "@/components/ui/UnitRadioGroup";
import { MockSettlementConfirmDialog } from "@/components/MockSettlementConfirmDialog";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function MockSettlementByRoutePage() {
  const mockSettlementGridRef = useRef<AgGridReact>(null);
  const byRouteGridRef = useRef<AgGridReact>(null);
  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockSettlementData, setMockSettlementData] = useState<
    MockSettlementResultData[]
  >([]);
  const [byRouteData, setByRouteData] = useState<MockSettlementByRouteData[]>(
    []
  );

  // 원단위 상태 추가
  const [unit, setUnit] = useState<Unit>("원");

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

  // 모의정산 실행여부 체크 관련 상태
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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

  // 상단 그리드 컬럼 정의 (모의정산 정보)
  const mockSettlementColumnDefs = [
    {
      headerName: "정산명",
      field: "settlementName",
      width: 150,
      resizable: true,
    },
    {
      headerName: "거래일자",
      field: "transactionDate",
      width: 120,
      resizable: true,
    },
    {
      headerName: "태그기관",
      field: "tagAgency",
      width: 120,
      resizable: true,
    },
    {
      headerName: "초승노선",
      field: "initialLine",
      width: 120,
      resizable: true,
    },
    {
      headerName: "노선동등",
      field: "lineSection",
      width: 120,
      resizable: true,
    },
    {
      headerName: "인.km",
      field: "distanceKm",
      width: 100,
      resizable: true,
      valueFormatter: (params: { value: number }) => {
        return params.value.toLocaleString();
      },
      cellStyle: { textAlign: "right" },
    },
  ];

  // 하단 그리드 컬럼 정의 (노선별 조회 결과) - 동적 그룹핑 컬럼 사용
  const byRouteColumnDefs = useMemo(() => {
    return createMockSettlementByRouteColDefs(byRouteData, unit);
  }, [byRouteData, unit]);

  // 원단위 변환은 그리드 컬럼 설정에서 처리
  const byRouteRowData = byRouteData;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">모의정산 노선별 조회</h1>

      <FilterForm<MockSettlementByRouteFilters>
        fields={mockSettlementByRouteFilterConfig}
        defaultValues={{ settlementName: "", agency: "" }}
        schema={mockSettlementByRouteSchema}
        onSearch={handleSearch}
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">모의정산 정보</p>
            <p className="text-sm">
              정산명과 보관기관을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && mockSettlementData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">모의정산 정보</h3>
              <div className="h-96">
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
                      resizable: true,
                      suppressMovable: true,
                    },
                  }}
                />
              </div>
            </div>
          )}

          {!isLoading && mockSettlementData.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
            <UnitRadioGroup value={unit} onChange={setUnit} />
            <CsvExportButton
              gridRef={byRouteGridRef}
              fileName="mock_settlement_by_route_data.csv"
              className="shadow-lg bg-accent-500"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="h-96">
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
                  resizable: true,
                  suppressMovable: true,
                },
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
