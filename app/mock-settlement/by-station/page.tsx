"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { MockSettlementByStationService } from "@/services/mockSettlementByStationService";
import { MockSettlementResultService } from "@/services/mockSettlementResultService";
import { MockSettlementControlService } from "@/services/mockSettlementControlService";
import { mockSettlementByStationFilterConfig } from "@/features/mockSettlementByStation/filterConfig";
import { createMockSettlementByStationColDefs } from "@/features/mockSettlementByStation/gridConfig";
import type {
  MockSettlementByStationFilters,
  MockSettlementByStationData,
} from "@/types/mockSettlementByStation";
import { MockSettlementResultData } from "@/types/mockSettlementResult";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { MockSettlementConfirmDialog } from "@/components/MockSettlementConfirmDialog";
import { MockSettlementDetailModal } from "@/components/MockSettlementDetailModal";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마 (첫 번째 역은 필수, 나머지 역은 선택사항)
const mockSettlementByStationSchema = z
  .object({
    STN_ID1: z.string().min(1, "첫 번째 역을 선택해주세요"),
    STN_ID2: z.string().optional(),
    STN_ID3: z.string().optional(),
    STN_ID4: z.string().optional(),
    STN_ID5: z.string().optional(),
  })
  .refine(
    (data) => {
      // 선택된 역들을 배열로 수집 (빈 문자열 제외)
      const selectedStations = [
        data.STN_ID1,
        data.STN_ID2,
        data.STN_ID3,
        data.STN_ID4,
        data.STN_ID5,
      ].filter((station) => station && station.trim() !== "");

      // 중복 제거 후 길이 비교
      const uniqueStations = [...new Set(selectedStations)];

      // 선택된 역이 있고, 중복이 있으면 false 반환
      return (
        selectedStations.length === 0 ||
        selectedStations.length === uniqueStations.length
      );
    },
    {
      message: "같은 역을 중복으로 선택할 수 없습니다.",
      path: ["STN_ID5"], // 에러를 마지막 역 필드에 표시
    }
  );

export default function MockSettlementByStationPage() {
  const mockSettlementGridRef = useRef<AgGridReact>(null);
  const byStationGridRef = useRef<AgGridReact>(null);

  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MockSettlementByStationFilters>({
    settlementName: "",
    STN_ID1: "",
    STN_ID2: "",
    STN_ID3: "",
    STN_ID4: "",
    STN_ID5: "",
  });
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

  // CSV 다운로드 상태 추가
  const [isDownloading, setIsDownloading] = useState(false);

  // 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<{
    simStmtGrpId: string;
    data: MockSettlementResultData;
  } | null>(null);

  // 모의정산 실행여부 체크 관련 상태
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 중복된 역 검증 상태
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

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

  // 중복된 역 검증 함수
  const validateStations = useCallback(
    (values: {
      STN_ID1: string;
      STN_ID2?: string;
      STN_ID3?: string;
      STN_ID4?: string;
      STN_ID5?: string;
    }) => {
      const selectedStations = [
        values.STN_ID1,
        values.STN_ID2,
        values.STN_ID3,
        values.STN_ID4,
        values.STN_ID5,
      ].filter((station) => station && station.trim() !== "");

      const uniqueStations = [...new Set(selectedStations)];
      const hasDuplicates = selectedStations.length !== uniqueStations.length;

      if (hasDuplicates) {
        // 중복된 역들을 찾아서 에러 표시
        const errors: { [key: string]: string } = {};
        const seen = new Set<string>();

        Object.entries(values).forEach(([key, value]) => {
          if (value && value.trim() !== "") {
            if (seen.has(value)) {
              errors[key] = "중복된 역입니다";
            } else {
              seen.add(value);
            }
          }
        });

        setValidationErrors(errors);
        return false;
      } else {
        setValidationErrors({});
        return true;
      }
    },
    []
  );

  // 실제 검색 실행 함수
  const executeSearch = useCallback(
    async (values: {
      STN_ID1: string;
      STN_ID2?: string;
      STN_ID3?: string;
      STN_ID4?: string;
      STN_ID5?: string;
    }) => {
      setHasSearched(true);
      // 정산명은 자동으로 설정된 값을 사용하고, 역 정보는 사용자가 선택한 값 사용
      const searchValues = {
        settlementName: filters.settlementName,
        STN_ID1: values.STN_ID1,
        STN_ID2: values.STN_ID2 || "",
        STN_ID3: values.STN_ID3 || "",
        STN_ID4: values.STN_ID4 || "",
        STN_ID5: values.STN_ID5 || "",
      };
      setFilters(searchValues);
      setIsLoading(true);
      setError(null);

      try {
        // 두 개의 API 호출로 각각 데이터 조회
        const [mockResponse, byStationResponse] = await Promise.all([
          MockSettlementResultService.getMockSettlementInfoData(
            searchValues.settlementName
          ),
          MockSettlementByStationService.getMockSettlementByStationData(
            searchValues
          ),
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
    [filters.settlementName]
  );

  const handleSearch = useCallback(
    async (values: {
      STN_ID1: string;
      STN_ID2?: string;
      STN_ID3?: string;
      STN_ID4?: string;
      STN_ID5?: string;
    }) => {
      // 중복 검증
      if (!validateStations(values)) {
        setError("중복된 역을 선택했습니다. 다른 역을 선택해주세요.");
        return;
      }

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
    [executeSearch, validateStations]
  );

  // 상단 그리드 컬럼 정의 (모의정산 정보) - 동적으로 생성
  const mockSettlementColumnDefs = useMemo(
    () => [
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
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "초승노선",
        field: "initialLine",
        flex: 1,
        minWidth: 120,
        resizable: false,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "노선동등",
        field: "lineSection",
        flex: 1,
        minWidth: 120,
        resizable: false,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "인.km",
        field: "distanceKm",
        flex: 1,
        minWidth: 100,
        resizable: false,
        type: "numericColumn",
        valueFormatter: (params: { value: number }) => {
          return params.value.toLocaleString();
        },
        cellStyle: { textAlign: "right" },
      },
    ],
    []
  );

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = useCallback(
    (event: { data: MockSettlementResultData }) => {
      console.log("행 더블클릭 이벤트 발생:", event);
      const { data } = event;
      if (data && data.settlementName) {
        console.log("선택된 데이터:", data);
        setSelectedSettlement({
          simStmtGrpId: data.settlementName,
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

  // 하단 그리드 컬럼 정의 (역사별 조회 결과) - 동적 그룹핑 컬럼 사용
  const byStationColumnDefs = useMemo(() => {
    try {
      // API 응답에서 선택된 역 이름들을 추출
      const selectedStations: string[] = [];
      if (byStationData.length > 0) {
        const firstItem = byStationData[0];
        const keys = Object.keys(firstItem);

        keys.forEach((key) => {
          if (key !== "stn_nm") {
            const parts = key.split("_");
            if (parts.length >= 3) {
              // 1_가능(1907)_지급 형태에서 역명 추출
              const stationName = parts.slice(1, -1).join("_");
              if (!selectedStations.includes(stationName)) {
                selectedStations.push(stationName);
              }
            } else if (parts.length === 2) {
              // 2개 부분으로 나뉘는 경우
              const stationName = parts[0];
              if (!selectedStations.includes(stationName)) {
                selectedStations.push(stationName);
              }
            }
          }
        });
      }

      return createMockSettlementByStationColDefs(byStationData);
    } catch (error) {
      console.error("컬럼 정의 생성 중 오류:", error);
      // 에러 발생 시 기본 컬럼만 반환
      return [
        {
          headerName: "역명",
          field: "stn_nm",
          width: 150,
          pinned: "left",
        },
      ];
    }
  }, [byStationData]);

  // 푸터 행 데이터 생성
  const footerRowData = useMemo(() => {
    if (!byStationData || byStationData.length === 0) return [];

    const footerRow: Record<string, string | number> = {
      stn_nm: `총 ${byStationData.length}건`,
    };

    // 각 컬럼의 총계 계산
    if (byStationData.length > 0) {
      const firstItem = byStationData[0];
      const keys = Object.keys(firstItem);

      keys.forEach((key) => {
        if (key !== "stn_nm") {
          const total = byStationData.reduce((sum, item) => {
            const value = item[key];
            return sum + (typeof value === "number" ? value : 0);
          }, 0);
          // 소수점 제거하고 정수로 표시
          footerRow[key] = `${Math.round(total).toLocaleString()}원`;
        }
      });
    }

    return [footerRow];
  }, [byStationData]);

  // 소수점 제거된 그리드 데이터
  const processedByStationData = useMemo(() => {
    return byStationData.map((item) => {
      const processedItem: Record<string, string | number> = { ...item };

      // 모든 숫자 필드에서 소수점 제거
      Object.keys(processedItem).forEach((key) => {
        if (key !== "stn_nm" && typeof processedItem[key] === "number") {
          processedItem[key] = Math.round(processedItem[key] as number);
        }
      });

      return processedItem;
    });
  }, [byStationData]);

  // 필터 설정에 validationErrors 전달
  const filterConfigWithErrors = useMemo(() => {
    return mockSettlementByStationFilterConfig
      .filter((field) => field.name !== "settlementName")
      .map((field) => ({
        ...field,
        error: validationErrors[field.name] || undefined,
        className: validationErrors[field.name] ? "border-red-500" : undefined,
      }));
  }, [validationErrors]);

  // 필터 변경 핸들러 추가
  const handleFilterChange = useCallback(
    (values: {
      STN_ID1: string;
      STN_ID2?: string;
      STN_ID3?: string;
      STN_ID4?: string;
      STN_ID5?: string;
    }) => {
      // 정산명은 자동으로 설정된 값을 유지하고, 역 정보만 업데이트
      setFilters((prev) => ({
        ...prev,
        STN_ID1: values.STN_ID1,
        STN_ID2: values.STN_ID2 || "",
        STN_ID3: values.STN_ID3 || "",
        STN_ID4: values.STN_ID4 || "",
        STN_ID5: values.STN_ID5 || "",
      }));
      // 필터 변경 시 중복 검증
      validateStations(values);
    },
    [validateStations]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">모의정산 역사별 조회</h1>

      <FilterForm<{
        STN_ID1: string;
        STN_ID2?: string;
        STN_ID3?: string;
        STN_ID4?: string;
        STN_ID5?: string;
      }>
        fields={filterConfigWithErrors}
        defaultValues={{
          STN_ID1: "",
          STN_ID2: "",
          STN_ID3: "",
          STN_ID4: "",
          STN_ID5: "",
        }}
        schema={mockSettlementByStationSchema}
        onChange={handleFilterChange}
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
        <div className="bg-gray-50 flex flex-col justify-center items-center h-[140px] border-2 border-dashed border-gray-300 rounded-lg p-16">
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
                setIsDownloading(true); // 다운로드 시작
                try {
                  const response = await fetch(
                    "/api/mock-settlement/by-station/download",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        settlementName: filters.settlementName || "",
                        STN_ID1: filters.STN_ID1 || "",
                        STN_ID2: filters.STN_ID2 || "",
                        STN_ID3: filters.STN_ID3 || "",
                        STN_ID4: filters.STN_ID4 || "",
                        STN_ID5: filters.STN_ID5 || "",
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
                } finally {
                  setIsDownloading(false); // 다운로드 완료
                }
              }}
              disabled={isDownloading} // 다운로드 중일 때 버튼 비활성화
              className="bg-primary font-bold hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer">
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  다운로드 중...
                </div>
              ) : (
                "CSV 다운로드"
              )}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-[24px] p-4">
          <div className="h-[500px]">
            <TestGrid
              rowData={processedByStationData}
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
  );
}
