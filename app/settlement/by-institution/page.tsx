"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { SettlementByInstitutionService } from "@/services/settlementByInstitutionService";
import { useCallback, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  SettlementByInstitutionFilters,
  SettlementByInstitutionData,
} from "@/types/settlementByInstitution";
import {
  settlementByInstitutionFields,
  settlementByInstitutionSchema,
} from "@/features/settlementByInstitution/filterConfig";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettlementByInstitutionPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<SettlementByInstitutionFilters>({
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
    data: apiData,
    loading,
    refetch,
  } = useApi<SettlementByInstitutionData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  const handleSearch = useCallback((values: SettlementByInstitutionFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  const colDefs = [
    {
      headerName: "기관명",
      field: "oper_nm",
      width: 200,
      resizable: true,
    },
    {
      headerName: "지급",
      field: "payment_amount",
      width: 150,
      resizable: true,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "수급",
      field: "receipt_amount",
      width: 150,
      resizable: true,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "계",
      field: "total_amount",
      width: 150,
      resizable: true,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">정산결과 기관별 조회</h1>

      <FilterForm<SettlementByInstitutionFilters>
        fields={settlementByInstitutionFields}
        defaultValues={{ agency: "" }}
        schema={settlementByInstitutionSchema}
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
