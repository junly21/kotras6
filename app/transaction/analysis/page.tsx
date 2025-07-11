"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
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

  const onSuccess = useCallback((data: TransactionAnalysisData[]) => {
    console.log("거래내역 분석 데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: "거래내역 분석 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("거래내역 분석 데이터 로드 실패:", error);
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
      width: 220,
      resizable: false,
    },
    {
      headerName: "승차역",
      field: "ride_nm",
      width: 220,
      resizable: false,
    },
    {
      headerName: "하차역",
      field: "algh_nm",
      width: 220,
      resizable: false,
    },
    {
      headerName: "데이터 건수",
      field: "cnt",
      width: 220,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString(),
      resizable: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">거래내역 분석</h1>

      <FilterForm<TransactionAnalysisFilters>
        fields={transactionAnalysisFields}
        defaultValues={{ agency: "" }}
        schema={transactionAnalysisSchema}
        onSearch={handleSearch}
      />

      {/* 그리드 */}
      <div className="relative h-[600px] overflow-y-auto">
        {hasSearched && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Spinner />
          </div>
        )}
        <TestGrid
          rowData={hasSearched ? apiData ?? [] : []} // ✅ null 대신 빈 배열
          columnDefs={colDefs}
          gridRef={gridRef}
          height={600}
          gridOptions={{
            suppressColumnResize: true,
            suppressRowClickSelection: true,
            suppressCellFocus: true,
            headerHeight: 50,
            rowHeight: 45,
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
