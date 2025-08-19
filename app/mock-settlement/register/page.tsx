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
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { MockSettlementModal } from "@/components/MockSettlementModal";
import { MockSettlementDetailModal } from "@/components/MockSettlementDetailModal";
import { SimulateModal } from "@/components/SimulateModal";
import { Button } from "@/components/ui/button";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

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
  const [isRegistering, setIsRegistering] = useState(false);
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
  } | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

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

  // 초기 진입 시 기본 조회 (정산명 공백, 거래일자 ALL)
  useEffect(() => {
    const fetchInitial = async () => {
      setHasSearched(true);
      setIsLoading(true);
      setError(null);
      try {
        const response =
          await MockSettlementRegisterService.getMockSettlementData({
            settlementName: "",
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

  // 모의정산 등록 모달 제출 핸들러
  const handleMockSettlementSubmit = useCallback(
    async (data: MockSettlementRegisterFormData) => {
      console.log("모의정산 등록 데이터:", data);

      // 모의정산 등록 모달 닫기 (처리 중임을 표시)
      setIsMockSettlementModalOpen(false);

      // 모의정산 등록 처리 로딩 상태 시작
      setIsRegistering(true);
      setError(null);

      try {
        const response =
          await MockSettlementRegisterService.registerMockSettlement(data);

        if (response.success) {
          console.log("모의정산 등록 성공:", response.data);
          // 등록 후 목록 새로고침
          handleSearchSubmit(filters);
        } else {
          console.error("모의정산 등록 실패:", response.error);
          setError(response.error || "모의정산 등록에 실패했습니다.");
        }
      } catch (error) {
        console.error("모의정산 등록 중 오류:", error);
        setError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsRegistering(false);
      }
    },
    [filters, handleSearchSubmit]
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

  // 컬럼 정의
  const columnDefs = [
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
    {
      headerName: "가중치(지상:지하:고가)",
      field: "weightRatio",
      width: 180,
      resizable: true,
    },
    {
      headerName: "등록일자",
      field: "registrationDate",
      width: 120,
      resizable: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">모의정산 등록</h1>
      </div>

      {/* 모의정산 등록 처리 중 스피너 */}
      {isRegistering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">모의정산 등록 처리 중입니다...</p>
            <p className="mt-2 text-sm text-gray-500">
              최대 20분 정도 소요될 수 있습니다.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              백엔드에서 데이터베이스 등록 작업을 진행 중입니다.
            </p>
          </div>
        </div>
      )}

      {/* 일반 데이터 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">데이터를 불러오는 중입니다...</p>
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
        className="bg-gray-50"
      />

      {/* 등록 버튼 */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsMockSettlementModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700">
          등록
        </Button>
      </div>

      {/* 결과 영역 */}
      {!hasSearched && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">조회 결과</p>
            <p className="text-sm">
              정산명과 거래일자를 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && searchResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">모의정산 등록 목록</h3>
              <div className="h-96">
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
                      resizable: true,
                      suppressMovable: true,
                    },
                    onRowDoubleClicked: handleRowDoubleClick,
                  }}
                />
              </div>
            </div>
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
        onClose={() => !isRegistering && setIsMockSettlementModalOpen(false)}
        onSubmit={handleMockSettlementSubmit}
        tradeDates={tradeDates}
        loading={isRegistering}
      />

      {/* 모의정산 상세 모달 */}
      {selectedSettlement && (
        <MockSettlementDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          simStmtGrpId={selectedSettlement.simStmtGrpId}
        />
      )}

      {/* 시뮬레이션 모달 */}
      <SimulateModal
        isOpen={isSimulateModalOpen}
        onClose={handleSimulateModalClose}
      />
    </div>
  );
}
