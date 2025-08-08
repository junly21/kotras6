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

  // 하단 그리드 컬럼 정의 (settlement/overview와 동일)
  const settlementColumnDefs = [
    {
      headerName: "#",
      valueGetter: (params: ValueGetterParams) =>
        params.node?.rowPinned ? "Total" : (params.node?.rowIndex ?? 0) + 1,
      width: 60,
      pinned: "left",
    },
    { headerName: "기관", field: "pay_oper" },
    { headerName: "용인경전철", field: "용인경전철" },
    { headerName: "공항철도", field: "공항철도" },
    { headerName: "새서울철도", field: "새서울철도" },
    { headerName: "인천교통공사", field: "인천교통공사" },
    { headerName: "서울시메트로9호선", field: "서울시메트로9호선" },
    { headerName: "의정부경전철", field: "의정부경전철" },
    { headerName: "서울교통공사", field: "서울교통공사" },
    { headerName: "김포시청", field: "김포시청" },
    { headerName: "한국철도공사", field: "한국철도공사" },
    { headerName: "우이신설경전철", field: "우이신설경전철" },
    { headerName: "신림선", field: "신림선" },
    { headerName: "신분당선", field: "신분당선" },
    { headerName: "경기철도", field: "경기철도" },
  ];

  // 하단 그리드 데이터에 단위 변환 적용
  const settlementRowData = useUnitConversion(settlementResults, unit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">모의정산 결과</h1>
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
        className="bg-gray-50"
      />

      {/* 상단: 모의정산 결과 그리드 */}
      {!hasSearched && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">모의정산 결과</p>
            <p className="text-sm">
              정산명과 거래일자를 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && mockSettlementResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">모의정산 결과</h3>
              <div className="h-96">
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
                      resizable: true,
                      suppressMovable: true,
                    },
                  }}
                />
              </div>
            </div>
          )}

          {!isLoading && mockSettlementResults.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                조회된 모의정산 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 하단: 정산결과 그리드 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">정산결과</h3>
          <div className="flex items-center gap-4">
            <UnitRadioGroup value={unit} onChange={setUnit} />
            <CsvExportButton
              gridRef={settlementGridRef}
              fileName="settlement_result_data.csv"
              className="shadow-lg bg-accent-500"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="h-96">
            <TestGrid
              rowData={settlementRowData}
              columnDefs={settlementColumnDefs}
              gridRef={settlementGridRef}
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
      </div>

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
