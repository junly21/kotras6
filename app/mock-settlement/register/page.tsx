"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import {
  mockSettlementRegisterFilterConfig,
  mockSettlementRegisterSchema,
} from "@/features/mockSettlementRegister/filterConfig";
import {
  MockSettlementRegisterFilters,
  MockSettlementRegisterData,
  MockSettlementRegisterFormData,
} from "@/types/mockSettlementRegister";
import { MockSettlementRegisterService } from "@/services/mockSettlementRegisterService";
import { MockSettlementControlService } from "@/services/mockSettlementControlService";
import { BackgroundTaskService } from "@/services/backgroundTaskService";
import { useGlobalToastStore } from "@/store/globalToastStore";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { MockSettlementModal } from "@/components/MockSettlementModal";
import { MockSettlementDetailModal } from "@/components/MockSettlementDetailModal";
import { SimulateModal } from "@/components/SimulateModal";
import { MockSettlementConfirmDialog } from "@/components/MockSettlementConfirmDialog";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import ProtectedRoute from "@/components/ProtectedRoute";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 기본값
const defaultValues: MockSettlementRegisterFilters = {
  settlementName: "",
  transactionDate: "",
};

export default function MockSettlementRegisterPage() {
  const [filters, setFilters] =
    useState<MockSettlementRegisterFilters>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<
    MockSettlementRegisterData[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [tradeDates, setTradeDates] = useState<string[]>([]);

  // 모달 상태
  const [isMockSettlementModalOpen, setIsMockSettlementModalOpen] =
    useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<{
    simStmtGrpId: string;
    data: MockSettlementRegisterData;
  } | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // 모의정산 실행여부 체크 관련 상태
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 토스트 상태
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  // AG Grid ref
  const gridRef = useRef(null);

  // 거래일자 목록 로드
  const loadTradeDates = useCallback(async () => {
    try {
      const response =
        await MockSettlementRegisterService.getTransactionDates();
      if (response.success && response.data) {
        const dates = response.data.map((item) => item.value);
        setTradeDates(dates);
      }
    } catch (error) {
      console.error("거래일자 목록 로드 실패:", error);
    }
  }, []);

  // 컴포넌트 마운트 시 거래일자 목록 로드
  useEffect(() => {
    loadTradeDates();
  }, [loadTradeDates]);

  // 컴포넌트 언마운트 시 백그라운드 모니터링 정리
  useEffect(() => {
    return () => {
      // 페이지를 떠날 때 모든 백그라운드 모니터링 중단
      BackgroundTaskService.stopAllMonitoring();
    };
  }, []);

  // 초기 진입 시 기본 조회 (정산명 공백, 거래일자 ALL)
  useEffect(() => {
    const fetchInitial = async () => {
      setHasSearched(true);
      setIsLoading(true);
      setError(null);
      try {
        const response =
          await MockSettlementRegisterService.getMockSettlementData({
            settlementName: "ALL",
            transactionDate: "ALL",
          });
        if (response.success && response.data) {
          console.log("초기 조회된 데이터:", response.data);
          setSearchResults(response.data);
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
    };
    fetchInitial();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (values: MockSettlementRegisterFilters) => {
    setFilters(values);
  };

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: MockSettlementRegisterFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await MockSettlementRegisterService.getMockSettlementData(values);
        if (response.success && response.data) {
          console.log("검색 조회된 데이터:", response.data);
          setSearchResults(response.data);
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
    []
  );

  // 모의정산 실행여부 체크 및 등록 실행 함수
  const executeMockSettlementRegistration = useCallback(
    async (data: MockSettlementRegisterFormData) => {
      console.log("모의정산 등록 데이터:", data);

      // 모의정산 등록 모달 닫기 (처리 중임을 표시)
      setIsMockSettlementModalOpen(false);

      setError(null);

      // 등록 요청 시작 토스트 표시
      setToast({
        message: "모의정산 등록이 시작되었습니다.",
        type: "info",
        isVisible: true,
      });

      try {
        // 백그라운드에서 모의정산 등록 실행
        BackgroundTaskService.executeMockSettlementRegistration(data);

        // 등록 후 목록 새로고침 (백그라운드에서 완료 시 자동으로 처리됨)
        // handleSearchSubmit(filters);
      } catch (error) {
        console.error("모의정산 등록 중 오류:", error);
        // 에러 토스트 표시
        setToast({
          message:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
          type: "error",
          isVisible: true,
        });
        setError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        );
      }
    },
    []
  );

  // 모의정산 등록 모달 제출 핸들러
  const handleMockSettlementSubmit = useCallback(
    async (data: MockSettlementRegisterFormData) => {
      // 모의정산이 실행 중이 아닌 경우 바로 등록 진행
      executeMockSettlementRegistration(data);
    },
    [executeMockSettlementRegistration]
  );

  // 시뮬레이션 모달 닫기 핸들러
  const handleSimulateModalClose = useCallback(() => {
    setIsSimulateModalOpen(false);
  }, []);

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = useCallback(
    (event: { data: MockSettlementRegisterData }) => {
      console.log("행 더블클릭 이벤트 발생:", event);
      const { data } = event;
      if (data && data.simStmtGrpId) {
        console.log("선택된 데이터:", data);
        setSelectedSettlement({
          simStmtGrpId: data.simStmtGrpId,
          data: data, // 전체 데이터도 전달
        });
        setIsDetailModalOpen(true);
      } else {
        console.log("simStmtGrpId가 없습니다:", data);
      }
    },
    []
  );

  // 상세 모달 닫기 핸들러
  const handleDetailModalClose = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSettlement(null);
  }, []);

  // 확인 다이얼로그 핸들러들
  const handleConfirmDialogClose = useCallback(() => {
    setIsConfirmDialogOpen(false);
    setPendingAction(null);
  }, []);

  const handleConfirmDialogConfirm = useCallback(async () => {
    if (pendingAction) {
      // 모의정산 강제종료
      const stopResponse = await MockSettlementControlService.stopSimulation();
      if (stopResponse.success) {
        // 강제종료 성공 시 토스트 메시지 표시
        useGlobalToastStore.getState().showToast({
          message: "모의정산이 강제종료되었습니다.",
          type: "info",
          duration: 3000,
        });
        // pending action은 실행하지 않음 - 사용자가 다시 등록 버튼을 클릭하도록 함
      } else {
        setError("모의정산 강제종료에 실패했습니다: " + stopResponse.error);
      }
    }
    setIsConfirmDialogOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  // 컬럼 정의
  const columnDefs = [
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
    {
      headerName: "가중치(지상:지하:고가)",
      flex: 1,
      field: "weightRatio",
      minWidth: 180,
      resizable: false,
    },
    {
      headerName: "등록일자",
      field: "registrationDate",
      flex: 1,
      minWidth: 100,
      resizable: false,
    },
  ];

  return (
    <ProtectedRoute requiredPermission="mockSettlement">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">모의정산 등록</h1>
        </div>

        {/* 일반 데이터 로딩 스피너 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <div className="text-center">
              <Spinner />
              <p className="mt-4 text-gray-600">
                데이터를 불러오는 중입니다...
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

        {/* 필터 폼 */}
        <FilterForm
          fields={mockSettlementRegisterFilterConfig}
          defaultValues={defaultValues}
          schema={mockSettlementRegisterSchema}
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
                정산명을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="space-y-4">
            {!isLoading && searchResults.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">모의정산 등록 목록</h3>
                  {/* 등록 버튼 */}
                  <div className="flex justify-end">
                    <Button
                      onClick={async () => {
                        // 모의정산 실행여부 체크
                        const isRunningResponse =
                          await MockSettlementControlService.checkIsRunning();

                        if (
                          isRunningResponse.success &&
                          isRunningResponse.data === true
                        ) {
                          // 모의정산이 실행 중인 경우 확인 다이얼로그 표시
                          setPendingAction(
                            () => () => setIsMockSettlementModalOpen(true)
                          );
                          setIsConfirmDialogOpen(true);
                          return;
                        }

                        // 모의정산이 실행 중이 아닌 경우 모달 열기
                        setIsMockSettlementModalOpen(true);
                      }}>
                      등록
                    </Button>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                  <div className="h-[500px]">
                    <TestGrid
                      rowData={searchResults}
                      columnDefs={columnDefs}
                      gridRef={gridRef}
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

            {!isLoading && searchResults.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">조회된 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* 모의정산 등록 모달 */}
        <MockSettlementModal
          isOpen={isMockSettlementModalOpen}
          onClose={() => setIsMockSettlementModalOpen(false)}
          onSubmit={handleMockSettlementSubmit}
          tradeDates={tradeDates}
          loading={false}
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

        {/* 시뮬레이션 모달 */}
        <SimulateModal
          isOpen={isSimulateModalOpen}
          onClose={handleSimulateModalClose}
        />

        {/* 모의정산 실행중 확인 다이얼로그 */}
        <MockSettlementConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={handleConfirmDialogClose}
          onConfirm={handleConfirmDialogConfirm}
          actionType="모달 열기"
        />

        {/* 토스트 메시지 */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
          duration={toast.type === "info" ? 3000 : 5000} // info는 3초 후 자동 닫기, 나머지는 5초 후 자동 닫기
        />
      </div>
    </ProtectedRoute>
  );
}
