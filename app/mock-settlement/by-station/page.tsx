"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { MockSettlementByStationService } from "@/services/mockSettlementByStationService";
import { MockSettlementResultService } from "@/services/mockSettlementResultService";
import { mockSettlementByStationFilterConfig } from "@/features/mockSettlementByStation/filterConfig";
import { createMockSettlementByStationColDefs } from "@/features/mockSettlementByStation/gridConfig";
import type {
  MockSettlementByStationFilters,
  MockSettlementByStationData,
} from "@/types/mockSettlementByStation";
import { MockSettlementResultData } from "@/types/mockSettlementResult";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마 (정산명은 필수, 역 선택은 선택사항)
const mockSettlementByStationSchema = z.object({
  settlementName: z.string().min(1, "정산명을 선택해주세요"),
  STN_ID1: z.string().optional(),
  STN_ID2: z.string().optional(),
  STN_ID3: z.string().optional(),
  STN_ID4: z.string().optional(),
  STN_ID5: z.string().optional(),
});

export default function MockSettlementByStationPage() {
  const mockSettlementGridRef = useRef<AgGridReact>(null);
  const byStationGridRef = useRef<AgGridReact>(null);

  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockSettlementData, setMockSettlementData] = useState<
    MockSettlementResultData[]
  >([]);
  const [byStationData, setByStationData] = useState<
    MockSettlementByStationData[]
  >([]);

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
    async (values: MockSettlementByStationFilters) => {
      setHasSearched(true);
      setIsLoading(true);
      setError(null);

      try {
        // 두 개의 API 호출로 각각 데이터 조회
        const [mockResponse, byStationResponse] = await Promise.all([
          MockSettlementResultService.getMockSettlementInfoData(
            values.settlementName
          ),
          MockSettlementByStationService.getMockSettlementByStationData(values),
        ]);

        if (mockResponse.success && mockResponse.data) {
          setMockSettlementData(mockResponse.data);
        } else {
          setError(
            mockResponse.error || "모의정산 정보 데이터 조회에 실패했습니다."
          );
        }

        if (byStationResponse.success && byStationResponse.data) {
          console.log("역사별 조회 데이터 성공:", byStationResponse.data);
          setByStationData(byStationResponse.data);
        } else {
          console.error(
            "역사별 조회 데이터 조회 실패:",
            byStationResponse.error
          );
          console.error("역사별 조회 응답 전체:", byStationResponse);
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

  // 상단 그리드 컬럼 정의 (모의정산 정보) - 동적으로 생성
  const mockSettlementColumnDefs = useMemo(
    () => [
      {
        headerName: "정산명",
        field: "settlementName",
        width: 150,
        resizable: true,
        cellStyle: { fontWeight: "bold" },
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
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "초승노선",
        field: "initialLine",
        width: 120,
        resizable: true,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "노선동등",
        field: "lineSection",
        width: 120,
        resizable: true,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "인.km",
        field: "distanceKm",
        width: 100,
        resizable: true,
        type: "numericColumn",
        valueFormatter: (params: { value: number }) => {
          return params.value.toLocaleString();
        },
        cellStyle: { textAlign: "right" },
      },
    ],
    []
  );

  // 하단 그리드 컬럼 정의 (역사별 조회 결과) - 동적 그룹핑 컬럼 사용
  const byStationColumnDefs = useMemo(() => {
    // API 응답에서 선택된 역 이름들을 추출
    const selectedStations: string[] = [];
    if (byStationData.length > 0) {
      const firstItem = byStationData[0];
      const keys = Object.keys(firstItem);

      keys.forEach((key) => {
        if (key !== "stn_nm") {
          const parts = key.split("_");
          if (parts.length >= 2) {
            const stationName = parts[0];
            if (!selectedStations.includes(stationName)) {
              selectedStations.push(stationName);
            }
          }
        }
      });
    }

    return createMockSettlementByStationColDefs(
      byStationData,
      selectedStations
    );
  }, [byStationData]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">모의정산 역사별 조회</h1>

      <FilterForm<MockSettlementByStationFilters>
        fields={mockSettlementByStationFilterConfig}
        defaultValues={{
          settlementName: "",
          STN_ID1: "",
          STN_ID2: "",
          STN_ID3: "",
          STN_ID4: "",
          STN_ID5: "",
        }}
        schema={mockSettlementByStationSchema}
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
              정산명과 역을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
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

      {/* 하단: 역사별 조회 결과 그리드 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">역사별 조회 결과</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "/api/mock-settlement/by-station/download",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        settlementName:
                          mockSettlementData[0]?.settlementName || "",
                        STN_ID1: mockSettlementData[0]?.STN_ID1 || "",
                        STN_ID2: mockSettlementData[0]?.STN_ID2 || "",
                        STN_ID3: mockSettlementData[0]?.STN_ID3 || "",
                        STN_ID4: mockSettlementData[0]?.STN_ID4 || "",
                        STN_ID5: mockSettlementData[0]?.STN_ID5 || "",
                      }),
                    }
                  );

                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "mock_settlement_by_station_data.csv";
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } else {
                    console.error("CSV 다운로드 실패");
                  }
                } catch (error) {
                  console.error("CSV 다운로드 중 오류:", error);
                }
              }}
              className="shadow-lg bg-accent-500 text-white px-4 py-2 rounded-md">
              CSV 다운로드
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="h-96">
            <TestGrid
              rowData={byStationData}
              columnDefs={byStationColumnDefs}
              gridRef={byStationGridRef}
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
    </div>
  );
}
