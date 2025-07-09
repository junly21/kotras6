"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { FilterForm } from "@/components/ui/FilterForm";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { TransactionDetailService } from "@/services/transactionDetailService";
import { useCallback, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  TransactionDetailFilters,
  TransactionDetailData,
} from "@/types/transactionDetail";
import {
  transactionDetailFields,
  transactionDetailSchema,
} from "@/features/transactionDetail/filterConfig";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionDetailPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<TransactionDetailFilters>({
    tradeDate: "",
    cardType: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  const apiCall = useCallback(
    () => TransactionDetailService.getDetailData(filters),
    [filters]
  );

  const onSuccess = useCallback((data: TransactionDetailData[]) => {
    console.log("상세조회 데이터 로드 성공:", data);
  }, []);

  const onError = useCallback((error: string) => {
    console.error("상세조회 데이터 로드 실패:", error);
  }, []);

  const {
    data: apiData,
    error,
    loading,
    refetch,
  } = useApi<TransactionDetailData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (filters.tradeDate && filters.cardType) {
      refetch();
    }
  }, [filters, refetch]);

  const handleSearch = useCallback((values: TransactionDetailFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  // 컬럼 정의
  const colDefs = [
    {
      headerName: "카드번호",
      field: "cardNumber",
      width: 200,
      resizable: false,
    },
    {
      headerName: "승차일시",
      field: "boardingDateTime",
      width: 180,
      resizable: false,
    },
    {
      headerName: "하차일시",
      field: "alightingDateTime",
      width: 180,
      resizable: false,
    },
    {
      headerName: "최초승차역",
      field: "firstBoardingStation",
      width: 150,
      resizable: false,
    },
    {
      headerName: "최종하차역",
      field: "finalAlightingStation",
      width: 150,
      resizable: false,
    },
    {
      headerName: "총배분금",
      field: "totalAmount",
      width: 150,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
      resizable: false,
    },
    {
      headerName: "기본운임",
      field: "baseFare",
      width: 150,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
      resizable: false,
    },
    {
      headerName: "도시철도 부가금",
      field: "subwaySurcharge",
      width: 200,
      valueFormatter: (params: { value: number }) =>
        params.value.toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
      resizable: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">상세조회</h1>

      <FilterForm<TransactionDetailFilters>
        fields={transactionDetailFields}
        defaultValues={{ tradeDate: "", cardType: "" }}
        schema={transactionDetailSchema}
        onSearch={handleSearch}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>에러:</strong> {error}
        </div>
      )}

      {hasSearched && !loading && apiData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>성공:</strong> 상세조회 데이터를 성공적으로 받았습니다.
        </div>
      )}

      {/* CSV 내보내기 버튼 */}
      <div className="flex justify-end">
        <CsvExportButton
          gridRef={gridRef}
          fileName="transaction_detail_data.csv"
          className="shadow-lg bg-accent-500"
        />
      </div>

      {/* 그리드 */}
      <div className="relative">
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
            suppressColumnResize: true,
            suppressRowClickSelection: true,
            suppressCellFocus: true,
            headerHeight: 50,
            rowHeight: 45,
            suppressScrollOnNewData: true,
            domLayout: "autoHeight",
          }}
        />
      </div>
    </div>
  );
}
