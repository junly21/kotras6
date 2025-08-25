"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { MockSettlementByInstitutionService } from "@/services/mockSettlementByInstitutionService";
import { MockSettlementResultService } from "@/services/mockSettlementResultService";
import { useCallback, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  MockSettlementByInstitutionFilters,
  MockSettlementByInstitutionData,
} from "@/types/mockSettlementByInstitution";
import { MockSettlementResultData } from "@/types/mockSettlementResult";
import {
  mockSettlementByInstitutionFilterConfig,
  mockSettlementByInstitutionSchema,
} from "@/features/mockSettlementByInstitution/filterConfig";
import { UnitRadioGroup, type Unit } from "@/components/ui/UnitRadioGroup";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { InstitutionChart } from "@/components/charts/InstitutionChart";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function MockSettlementByInstitutionPage() {
  const mockSettlementGridRef = useRef<AgGridReact>(null);
  const byInstitutionGridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<MockSettlementByInstitutionFilters>({
    settlementName: "",
    agency: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockSettlementData, setMockSettlementData] = useState<
    MockSettlementResultData[]
  >([]);
  const [byInstitutionData, setByInstitutionData] = useState<
    MockSettlementByInstitutionData[]
  >([]);

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

  const handleSearch = useCallback(
    async (values: MockSettlementByInstitutionFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

      try {
        // 두 개의 API 호출로 각각 데이터 조회
        const [mockResponse, byInstitutionResponse] = await Promise.all([
          MockSettlementResultService.getMockSettlementInfoData(
            values.settlementName
          ),
          MockSettlementByInstitutionService.getMockSettlementByInstitutionData(
            values
          ),
        ]);

        if (mockResponse.success && mockResponse.data) {
          setMockSettlementData(mockResponse.data);
        } else {
          setError(
            mockResponse.error || "모의정산 정보 데이터 조회에 실패했습니다."
          );
        }

        if (byInstitutionResponse.success && byInstitutionResponse.data) {
          setByInstitutionData(byInstitutionResponse.data);
        } else {
          console.error(
            "기관별 조회 데이터 조회 실패:",
            byInstitutionResponse.error
          );
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
      headerName: "태그기관",
      field: "tagAgency",
      flex: 1,
      minWidth: 120,
      resizable: false,
    },
    {
      headerName: "초승노선",
      field: "initialLine",
      flex: 1,
      minWidth: 120,
      resizable: false,
    },
    {
      headerName: "노선동등",
      field: "lineSection",
      flex: 1,
      minWidth: 120,
      resizable: false,
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

  // 하단 그리드 컬럼 정의 (기관별 조회 결과 - 정산결과>기관별 조회와 동일)
  const byInstitutionColumnDefs = [
    {
      headerName: "기관명",
      field: "대상기관",
      flex: 1,
      minWidth: 200,
      resizable: false,
    },
    {
      headerName: "지급",
      field: "지급액",
      flex: 1,
      minWidth: 200,
      resizable: false,
      valueFormatter: (params: { value: number }) => {
        if (unit === "원") {
          return params.value.toLocaleString() + "원";
        } else {
          return params.value.toLocaleString() + unit;
        }
      },
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "수급",
      field: "수급액",
      flex: 1,
      minWidth: 200,
      resizable: false,
      valueFormatter: (params: { value: number }) => {
        if (unit === "원") {
          return params.value.toLocaleString() + "원";
        } else {
          return params.value.toLocaleString() + unit;
        }
      },
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "계",
      field: "차액",
      flex: 1,
      minWidth: 200,
      resizable: false,
      valueFormatter: (params: { value: number }) => {
        if (unit === "원") {
          return params.value.toLocaleString() + "원";
        } else {
          return params.value.toLocaleString() + unit;
        }
      },
      cellStyle: { textAlign: "right" },
    },
  ];

  // 원단위 변환된 데이터
  const byInstitutionRowData = useUnitConversion(byInstitutionData, unit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">모의정산 기관별 조회</h1>

      <FilterForm<MockSettlementByInstitutionFilters>
        fields={mockSettlementByInstitutionFilterConfig}
        defaultValues={{ settlementName: "", agency: "" }}
        schema={mockSettlementByInstitutionSchema}
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
              정산명과 기관명을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && mockSettlementData.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4">모의정산 정보</h3>
              <div className="bg-white border border-gray-200 rounded-[24px] p-4">
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
                        resizable: false,
                        suppressMovable: true,
                      },
                    }}
                  />
                </div>
              </div>
            </>
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

      {/* 하단: 기관별 조회 결과 그리드 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">기관별 조회 결과</h3>
          <div className="flex items-center gap-4">
            <UnitRadioGroup value={unit} onChange={setUnit} />
            <CsvExportButton
              gridRef={byInstitutionGridRef}
              fileName="mock_settlement_by_institution_data.csv"
              className="shadow-lg bg-accent-500"
            />
          </div>
        </div>

        {/* 좌우 그리드 레이아웃 */}
        <div className="grid grid-cols-2 gap-6 h-[525px]">
          {/* 왼쪽: 기관별 조회 결과 그리드 */}
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold">기관별 조회 결과 목록</h2>
            <div className="relative flex-1 h-full">
              {hasSearched && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Spinner />
                </div>
              )}
              <TestGrid
                rowData={hasSearched ? byInstitutionRowData ?? [] : []}
                columnDefs={byInstitutionColumnDefs}
                gridRef={byInstitutionGridRef}
                gridOptions={{
                  suppressColumnResize: false,
                  suppressRowClickSelection: true,
                  suppressCellFocus: true,
                  headerHeight: 50,
                  suppressScrollOnNewData: true,
                }}
              />
            </div>
          </div>

          {/* 오른쪽: 차트 영역 */}
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold">차트 분석</h2>
            <div className="relative flex-1 h-full">
              {!hasSearched ? (
                <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">
                      조회 버튼을 눌러주세요
                    </p>
                    <p className="text-sm">
                      정산명과 기관명을 선택하고 조회하면
                    </p>
                    <p className="text-sm">
                      해당 기관의 모의정산 결과 차트가 표시됩니다.
                    </p>
                  </div>
                </div>
              ) : hasSearched &&
                byInstitutionData &&
                byInstitutionData.length > 0 ? (
                <div className="h-full w-full">
                  <InstitutionChart
                    key={unit}
                    data={byInstitutionRowData}
                    unit={unit}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">데이터가 없습니다</p>
                    <p className="text-sm">조회된 데이터가 없습니다.</p>
                  </div>
                </div>
              )}
            </div>
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
