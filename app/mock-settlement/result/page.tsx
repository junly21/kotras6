"use client";

import { useState, useCallback, useRef } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import {
  mockSettlementResultFilterConfig,
  mockSettlementResultSchema,
} from "@/features/mockSettlementResult/filterConfig";
import {
  MockSettlementResultFilters,
  MockSettlementResultData,
  SettlementResultData,
} from "@/types/mockSettlementResult";
import { MockSettlementResultService } from "@/services/mockSettlementResultService";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { Toast } from "@/components/ui/Toast";
import { MockSettlementDetailModal } from "@/components/MockSettlementDetailModal";
import {
  AllCommunityModule,
  ModuleRegistry,
  ValueGetterParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { UnitRadioGroup, type Unit } from "@/components/ui/UnitRadioGroup";
import { useUnitConversion } from "@/hooks/useUnitConversion";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 기본값
const defaultValues: MockSettlementResultFilters = {
  settlementName: "",
};

export default function MockSettlementResultPage() {
  const [filters, setFilters] =
    useState<MockSettlementResultFilters>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockSettlementResults, setMockSettlementResults] = useState<
    MockSettlementResultData[]
  >([]);
  const [settlementResults, setSettlementResults] = useState<
    SettlementResultData[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  // AG Grid refs
  const mockSettlementGridRef = useRef<AgGridReact>(null);
  const settlementGridRef = useRef<AgGridReact>(null);

  // 단위 상태
  const [unit, setUnit] = useState<Unit>("원");

  // 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<{
    simStmtGrpId: string;
    data: MockSettlementResultData;
  } | null>(null);

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

  // 필터 변경 핸들러
  const handleFilterChange = (values: MockSettlementResultFilters) => {
    setFilters(values);
  };

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

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: MockSettlementResultFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

      try {
        // 두 개의 API 호출로 각각 데이터 조회
        const [mockResponse, settlementResponse] = await Promise.all([
          MockSettlementResultService.getMockSettlementInfoData(
            values.settlementName
          ),
          MockSettlementResultService.getSettlementResultData(
            values.settlementName
          ),
        ]);

        if (mockResponse.success && mockResponse.data) {
          setMockSettlementResults(mockResponse.data);
        } else {
          setError(
            mockResponse.error || "모의정산 정보 데이터 조회에 실패했습니다."
          );
        }

        if (settlementResponse.success && settlementResponse.data) {
          setSettlementResults(settlementResponse.data);
        } else {
          console.error("정산결과 데이터 조회 실패:", settlementResponse.error);
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

  // 상단 그리드 컬럼 정의 (모의정산 등록 페이지와 동일)
  const mockSettlementColumnDefs = [
    {
      headerName: "정산명",
      field: "settlementName",
      flex: 1,
      minWidth: 200,
      resizable: false,
    },
    {
      headerName: "거래일자",
      field: "transactionDate",
      flex: 1,
      minWidth: 180,
      resizable: false,
    },
    {
      headerName: "태그기관 비율(%)",
      field: "tagAgency",
      flex: 1,
      minWidth: 180,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "초승노선 비율(%)",
      field: "initialLine",
      flex: 1,
      minWidth: 180,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "노선동등 비율(%)",
      field: "lineSection",
      flex: 1,
      minWidth: 180,
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "인.km 비율(%)",
      field: "distanceKm",
      flex: 1,
      minWidth: 180,
      resizable: false,
      valueFormatter: (params: { value: number }) => {
        if (params.value == null) return "";
        return params.value.toLocaleString();
      },
      cellStyle: { textAlign: "right" },
    },
  ];

  // 숫자 컬럼용 동적 스타일 함수
  const getNumberCellStyle = (params: { value: number }) => {
    const num = Number(params.value);
    const color = num > 0 ? "#2563eb" : num < 0 ? "#dc2626" : "#000000";
    return {
      textAlign: "right" as const,
      color: color,
    };
  };

  // 숫자 컬럼용 포맷터 함수
  const getNumberFormatter = (params: { value: number }) => {
    if (params.value == null) return "";
    const num = Number(params.value);
    if (unit === "원") {
      return Math.floor(num).toLocaleString();
    }
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 하단 그리드 컬럼 정의 (settlement/overview와 동일)
  const settlementColumnDefs = [
    {
      headerName: "#",
      valueGetter: (params: ValueGetterParams) =>
        params.node?.rowPinned ? "Total" : (params.node?.rowIndex ?? 0) + 1,
      width: 50,
      pinned: "left",
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "기관",
      field: "pay_oper",
      pinned: "left",
      width: 150,
    },
    {
      headerName: `총계(${unit})`,
      field: "total",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
      width: 150,
      pinned: "left",
    },
    {
      headerName: "한국철도공사",
      field: "한국철도공사",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "서울교통공사",
      field: "서울교통공사",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "인천교통공사",
      field: "인천교통공사",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "공항철도",
      field: "공항철도",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "서울시메트로9호선",
      field: "서울시메트로9호선",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "신분당선주식회사",
      field: "신분당선",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "의정부경전철",
      field: "의정부경전철",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "용인경량전철",
      field: "용인경량전철",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "경기철도",
      field: "경기철도",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "우이신설경전철",
      field: "우이신설경전철",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "김포시청",
      field: "김포시청",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "남서울경전철",
      field: "남서울경전철",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
    {
      headerName: "새서울철도",
      field: "새서울철도",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
    },
  ];

  // 하단 그리드 데이터에 단위 변환 적용
  const settlementRowData = useUnitConversion(settlementResults, unit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">모의정산 정산결과</h1>
      </div>

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

      {/* 필터 폼 */}
      <FilterForm
        fields={mockSettlementResultFilterConfig}
        defaultValues={defaultValues}
        schema={mockSettlementResultSchema}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearchSubmit}
      />

      {/* 상단: 모의정산 결과 그리드 */}
      {!hasSearched && (
        <div className="bg-gray-50 border flex flex-col justify-center items-center h-[140px] border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">모의정산 결과</p>
            <p className="text-sm">
              정산명과 거래일자를 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-2">
          {!isLoading && mockSettlementResults.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4">모의정산 정보</h3>
              <div className="bg-white border border-gray-200 rounded-[24px] p-2">
                <div className="h-32">
                  <TestGrid
                    rowData={mockSettlementResults}
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

          {!isLoading && mockSettlementResults.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[24px] p-4">
              <p className="text-yellow-800">
                조회된 모의정산 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 하단: 정산결과 그리드 */}

      <div className="space-y-4">
        {hasSearched && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">정산결과 조회</h3>
              <div className="flex items-center gap-4">
                <UnitRadioGroup value={unit} onChange={setUnit} />
                <CsvExportButton
                  gridRef={settlementGridRef}
                  fileName="settlement_result_data.csv"
                  className="shadow-lg bg-accent-500"
                />
              </div>
            </div>
          </>
        )}
        <div className="bg-white border border-gray-200 rounded-[24px] p-4">
          <div className="h-[530px]">
            <TestGrid
              rowData={settlementRowData}
              columnDefs={settlementColumnDefs}
              gridRef={settlementGridRef}
              enableNumberColoring={true}
              gridOptions={{
                suppressCellFocus: true,
                suppressMovableColumns: true,
                suppressMenuHide: true,
                rowSelection: {
                  enableClickSelection: false,
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* 모의정산 상세 모달 */}
      {selectedSettlement && (
        <MockSettlementDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          simStmtGrpId={selectedSettlement.simStmtGrpId}
          gridData={selectedSettlement.data}
        />
      )}

      {/* 토스트 알림 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
