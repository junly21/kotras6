"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { useSettlementFilters } from "@/hooks/useFilterOptions";
import { SettlementByInstitutionService } from "@/services/settlementByInstitutionService";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  SettlementByInstitutionFilters,
  SettlementByInstitutionData,
} from "@/types/settlementByInstitution";
import {
  settlementByInstitutionFields,
  settlementByInstitutionSchema,
} from "@/features/settlementByInstitution/filterConfig";
import { UnitRadioGroup, type Unit } from "@/components/ui/UnitRadioGroup";
import { InstitutionChart } from "@/components/charts/InstitutionChart";
import { useUnitConversion } from "@/hooks/useUnitConversion";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettlementByInstitutionPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<SettlementByInstitutionFilters>({
    stmtGrpId: "",
    agency: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ 정산 필터 옵션 훅 사용
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const { isLoading: isFilterLoading, isAllOptionsLoaded: isFilterLoaded } =
    useSettlementFilters(handleFilterChange);

  // ✅ 첫 번째 옵션 자동 선택을 위한 ref
  const hasAutoSelected = useRef(false);

  // ✅ 모든 필터 옵션이 로드되면 자동 선택 완료 표시 (실제 선택은 useSettlementFilters에서 처리)
  useEffect(() => {
    if (isFilterLoaded && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      console.log("필터 옵션 로드 완료, 자동 선택 대기 중");
    }
  }, [isFilterLoaded]);

  // ✅ 모든 필터가 선택되면 자동 조회
  useEffect(() => {
    if (
      isFilterLoaded &&
      filters.agency &&
      filters.stmtGrpId &&
      !hasSearched &&
      hasAutoSelected.current
    ) {
      console.log("자동 조회 실행:", filters);
      setHasSearched(true);
    }
  }, [isFilterLoaded, filters, hasSearched]);

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

  const apiCall = useCallback(
    () => SettlementByInstitutionService.getSettlementData(filters),
    [filters]
  );

  const onSuccess = useCallback((data: SettlementByInstitutionData[]) => {
    console.log("정산결과 기관별 데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: "정산결과 기관별 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("정산결과 기관별 데이터 로드 실패:", error);
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const {
    data: rawApiData,
    loading,
    refetch,
  } = useApi<SettlementByInstitutionData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  // 총계 객체 제외하고 일반 데이터만 추출
  const apiData = useMemo(() => {
    if (!rawApiData) return [];
    return rawApiData.filter((item) => item.대상기관 !== "총계");
  }, [rawApiData]);

  // 총계 객체에서 총계 값 추출
  const totalObject = useMemo(() => {
    if (!rawApiData) return null;
    return rawApiData.find((item) => item.대상기관 === "총계") || null;
  }, [rawApiData]);

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  const handleSearch = useCallback((values: SettlementByInstitutionFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  // 그리드용 단위변환된 데이터
  const rowData = useUnitConversion(apiData, unit);

  // 하단 고정 행 데이터 (총계) - 외부 API에서 제공된 총계 사용
  const pinnedBottomRowData = useMemo(() => {
    if (!totalObject || !apiData || apiData.length === 0) return [];

    // 외부 API에서 제공된 총계 값 사용
    const totalPayment = Number(totalObject.지급액 || 0);
    const totalReceipt = Number(totalObject.수급액 || 0);
    const totalDifference = Number(totalObject.차액 || 0);

    // 단위변환 적용
    const unitMultiplier =
      unit === "원"
        ? 1
        : unit === "천 원"
        ? 1 / 1000
        : unit === "백만 원"
        ? 1 / 1000000
        : 1 / 100000000; // "억 원"

    // 원 단위일 때는 정수로, 다른 단위는 소수점 둘째자리까지
    const formatValue = (value: number) => {
      if (unit === "원") {
        return Math.round(value * unitMultiplier).toLocaleString();
      }
      return (value * unitMultiplier).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const result = [
      {
        대상기관: `총 ${apiData.length}개`,
        지급액: formatValue(totalPayment),
        수급액: formatValue(totalReceipt),
        차액: formatValue(totalDifference),
      },
    ];

    return result;
  }, [totalObject, apiData, unit]);

  // pinnedBottomRowData 변경 시 디버깅
  useEffect(() => {
    console.log("pinnedBottomRowData 변경됨:", pinnedBottomRowData);
    if (gridRef.current && pinnedBottomRowData.length > 0) {
      console.log("그리드에 pinnedBottomRowData 적용 시도");
    }
  }, [pinnedBottomRowData]);

  const colDefs = [
    {
      headerName: "기관명",
      field: "대상기관",
      minWidth: 120,
      flex: 1,
      resizable: false,
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
    },
    {
      headerName: `지급(${unit})`,
      field: "지급액",
      minWidth: 200,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리
        if (unit === "원") {
          return Math.floor(params.value).toLocaleString();
        }
        return params.value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
    {
      headerName: `수급(${unit})`,
      field: "수급액",
      minWidth: 200,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리
        if (unit === "원") {
          return Math.floor(params.value).toLocaleString();
        }
        return params.value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
    {
      headerName: `계(${unit})`,
      field: "차액",
      minWidth: 200,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리
        if (unit === "원") {
          return Math.floor(params.value).toLocaleString();
        }
        return params.value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
  ];

  return (
    <ProtectedRoute requiredPath="/settlement/by-institution">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">연락운임 기관별 조회</h1>

        {/* ✅ 필터 폼 로딩 상태 표시 */}
        <div className="relative">
          {isFilterLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
              <Spinner />
            </div>
          )}
          <FilterForm<SettlementByInstitutionFilters>
            fields={settlementByInstitutionFields}
            defaultValues={filters}
            values={filters}
            schema={settlementByInstitutionSchema}
            onSearch={handleSearch}
          />
        </div>

        {/* 좌우 그리드 레이아웃 */}
        <div className="grid grid-cols-2 gap-6 h-[650px]">
          {/* 왼쪽: 정산결과 그리드 */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">기관별 조회 결과</h2>
              <div className="flex items-center gap-4">
                <UnitRadioGroup value={unit} onChange={setUnit} />
                <CsvExportButton
                  gridRef={gridRef}
                  fileName="기관별조회결과.csv"
                  className="shadow-lg bg-accent-500"
                />
              </div>
            </div>
            <div className="relative flex-1 h-full">
              {hasSearched && loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Spinner />
                </div>
              )}
              <TestGrid
                rowData={hasSearched ? rowData ?? [] : []} // ✅ 원단위 변환된 데이터 사용
                columnDefs={colDefs}
                gridRef={gridRef}
                gridOptions={{
                  suppressColumnResize: false,
                  suppressRowClickSelection: true,
                  suppressCellFocus: true,
                  headerHeight: 50,
                  rowHeight: 35,
                  suppressScrollOnNewData: true,
                  pinnedBottomRowData: pinnedBottomRowData,
                }}
              />
            </div>
          </div>

          {/* 오른쪽: 차트 영역 */}
          <div className="flex flex-col h-full">
            <div className="mb-4 h-[40px]"></div>
            <div className="relative flex-1 h-full">
              {!hasSearched ? (
                <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">
                      조회 버튼을 눌러주세요
                    </p>
                    <p className="text-sm">기관을 선택하고 조회하면</p>
                    <p className="text-sm">
                      해당 기관의 정산결과 차트가 표시됩니다.
                    </p>
                  </div>
                </div>
              ) : hasSearched && apiData && apiData.length > 0 ? (
                <div className="h-full w-full">
                  <InstitutionChart data={apiData || []} />
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

        {/* 토스트 알림 */}
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </ProtectedRoute>
  );
}
