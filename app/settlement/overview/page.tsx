"use client";
import { useEffect } from "react";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import {
  AllCommunityModule,
  ModuleRegistry,
  ValueGetterParams,
} from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { PayRecvService, PayRecvOperData } from "@/services/payRecvService";
import { useCallback, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { UnitRadioGroup, type Unit } from "@/components/ui/UnitRadioGroup";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import {
  settlementOverviewFields,
  settlementOverviewSchema,
  SettlementOverviewFilters,
} from "@/features/settlementOverview/filterConfig";
import { useFilterOptions } from "@/hooks/useFilterOptions";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TestGridPage() {
  // gridRef 생성
  const gridRef = useRef<AgGridReact>(null);
  const [unit, setUnit] = useState<Unit>("원");

  // 필터 상태
  const [filters, setFilters] = useState<SettlementOverviewFilters>({
    stmtGrpId: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ 정산 필터 옵션 훅 사용
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ✅ 대안만 관리하는 필터 옵션 훅 사용
  const { isLoading: isFilterLoading, isAllOptionsLoaded: isFilterLoaded } =
    useFilterOptions(
      {
        stmtGrpId: {
          endpoint: "/api/stmt_grp_id",
          autoSelectFirst: true,
        },
      },
      handleFilterChange
    );

  // ✅ 첫 번째 옵션 자동 선택을 위한 ref
  const hasAutoSelected = useRef(false);

  // ✅ 모든 필터 옵션이 로드되면 자동 선택 완료 표시 (실제 선택은 useFilterOptions에서 처리)
  useEffect(() => {
    if (isFilterLoaded && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      console.log("필터 옵션 로드 완료, 자동 선택 대기 중");
    }
  }, [isFilterLoaded]);

  // ✅ 대안이 선택되면 자동 조회
  useEffect(() => {
    if (
      isFilterLoaded &&
      filters.stmtGrpId &&
      !hasSearched &&
      hasAutoSelected.current
    ) {
      console.log("자동 조회 실행:", filters);
      setHasSearched(true);
    }
  }, [isFilterLoaded, filters, hasSearched]);

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

  // apiCall 함수를 메모이제이션
  const apiCall = useCallback(
    () => PayRecvService.getOperList(filters.stmtGrpId),
    [filters.stmtGrpId]
  );

  // 콜백 함수들도 메모이제이션
  const onSuccess = useCallback((data: PayRecvOperData[]) => {
    console.log("데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: "API 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("데이터 로드 실패:", error);
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const {
    data: apiData,
    loading,
    refetch,
  } = useApi<PayRecvOperData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  // 검색 핸들러
  const handleSearch = useCallback((values: SettlementOverviewFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

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

  const colDefs = [
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
      field: "신분당선주식회사",
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

  const rowData = useUnitConversion(apiData, unit);

  return (
    <ProtectedRoute requiredPath="/settlement/overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">연락운임 정산결과</h1>
        </div>

        {/* 필터 폼 */}
        <div className="relative">
          {isFilterLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
              <Spinner />
            </div>
          )}
          <FilterForm<SettlementOverviewFilters>
            fields={settlementOverviewFields}
            defaultValues={filters}
            values={filters}
            schema={settlementOverviewSchema}
            onSearch={handleSearch}
          />
        </div>

        {/* 결과 영역 */}
        {!hasSearched && (
          <div className="bg-gray-50 flex flex-col justify-center items-center h-[600px] border-2 border-dashed border-gray-300 rounded-lg p-16">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">조회 결과</p>
              <p className="text-sm">
                대안을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {hasSearched && (
          <>
            {/* 정산결과 그리드 제목 및 버튼 */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">연락운임 정산결과 조회</h3>
              <div className="flex items-center gap-4">
                <UnitRadioGroup value={unit} onChange={setUnit} />
                <CsvExportButton
                  gridRef={gridRef}
                  fileName="pay_recv_data.csv"
                  className="shadow-lg bg-accent-500"
                />
              </div>
            </div>

            <div className="relative h-[calc(100vh-370px)]">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Spinner />
                </div>
              )}
              <div className="w-full h-full">
                <TestGrid
                  rowData={loading ? null : rowData}
                  columnDefs={colDefs}
                  gridRef={gridRef}
                  height="100%"
                  enableNumberColoring={true}
                  gridOptions={{
                    rowHeight: 40,
                  }}
                />
              </div>
            </div>
          </>
        )}

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
