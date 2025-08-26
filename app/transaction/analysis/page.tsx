"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { useAgencyOptions } from "@/hooks/useFilterOptions";
import { TransactionAnalysisService } from "@/services/transactionAnalysisService";
import { useCallback, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  TransactionAnalysisFilters,
  TransactionAnalysisData,
} from "@/types/transactionAnalysis";
import {
  transactionAnalysisFields,
  transactionAnalysisSchema,
} from "@/features/transactionAnalysis/filterConfig";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionAnalysisPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<TransactionAnalysisFilters>({
    agency: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ 기관 옵션 훅 사용
  const handleAgencyChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, agency: value }));
  }, []);

  const {
    options: agencyOptions,
    isLoading: isAgencyLoading,
    isAllOptionsLoaded: isAgencyLoaded,
  } = useAgencyOptions(handleAgencyChange);

  // ✅ 첫 번째 기관이 로드되면 자동으로 선택 (백업 로직)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (
      agencyOptions.agency &&
      agencyOptions.agency.length > 0 &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      const firstAgency = agencyOptions.agency[0].value;
      setFilters((prev) => ({ ...prev, agency: firstAgency }));
    }
  }, [agencyOptions.agency]); // filters.agency 의존성 제거

  // ✅ 모든 기관 옵션이 로드되고 첫 번째 기관이 선택되면 자동 조회
  useEffect(() => {
    if (isAgencyLoaded && filters.agency && !hasSearched) {
      setHasSearched(true);
    }
  }, [isAgencyLoaded, filters.agency, hasSearched]);

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
    () => TransactionAnalysisService.getAnalysisData(filters),
    [filters]
  );

  const onSuccess = useCallback(() => {
    setToast({
      isVisible: true,
      message: "거래내역 분석 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
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
  } = useApi<TransactionAnalysisData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  const handleSearch = useCallback((values: TransactionAnalysisFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  const colDefs = [
    {
      headerName: "승차기관명",
      field: "oper_nm",
      minWidth: 220,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "승차역",
      field: "ride_nm",
      minWidth: 220,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "하차역",
      field: "algh_nm",
      minWidth: 220,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "데이터 건수",
      field: "cnt",
      minWidth: 220,
      flex: 1,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString(),
      resizable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">거래내역 분석</h1>

      {/* ✅ 필터 폼 로딩 상태 표시 */}
      <div className="relative">
        {isAgencyLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
            <Spinner />
          </div>
        )}
        <FilterForm<TransactionAnalysisFilters>
          fields={transactionAnalysisFields}
          defaultValues={filters}
          values={filters}
          schema={transactionAnalysisSchema}
          onSearch={handleSearch}
        />
      </div>

      {/* CSV 내보내기 버튼 */}
      {hasSearched && apiData && apiData.length > 0 && (
        <div className="flex justify-end">
          <CsvExportButton
            gridRef={gridRef}
            fileName="거래내역_분석_데이터.csv"
            className="shadow-lg bg-accent-500"
          />
        </div>
      )}

      {/* 그리드 */}
      <div className="relative h-[525px] overflow-y-auto">
        {hasSearched && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Spinner />
          </div>
        )}
        <TestGrid
          rowData={hasSearched ? apiData ?? [] : []} // ✅ null 대신 빈 배열
          columnDefs={colDefs}
          gridRef={gridRef}
          gridOptions={{
            suppressColumnResize: false,
            suppressRowClickSelection: true,
            suppressCellFocus: true,
            headerHeight: 50,
            rowHeight: 35,
            suppressScrollOnNewData: true,
          }}
        />
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
