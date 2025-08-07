"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { TransactionDetailFilterForm } from "@/components/transactionDetail/TransactionDetailFilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { TransactionDetailService } from "@/services/transactionDetailService";
import { useCallback, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  TransactionDetailFilters,
  TransactionDetailData,
} from "@/types/transactionDetail";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionDetailPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<TransactionDetailFilters>({
    tradeDate: "",
    cardType: "",
    agency: "",
    line: "",
    stations: [],
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
    () => TransactionDetailService.getDetailData(filters),
    [filters]
  );

  const onSuccess = useCallback((data: TransactionDetailData[]) => {
    console.log("상세조회 데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: `상세조회 데이터를 성공적으로 받았습니다. (총 ${data.length}건)`,
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("상세조회 데이터 로드 실패:", error);
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const { data: apiData, loading } = useApi<TransactionDetailData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  const handleSearch = useCallback(
    (values: TransactionDetailFilters) => {
      console.log("handleSearch 호출됨:", values);
      setHasSearched(true); // ✅ 검색 시작
      setFilters(values);

      // 직접 API 호출
      TransactionDetailService.getDetailData(values)
        .then((result) => {
          if (result.success) {
            onSuccess(result.data || []);
          } else {
            onError(result.error || "데이터 로드 실패");
          }
        })
        .catch((error) => {
          onError(String(error));
        });
    },
    [onSuccess, onError]
  );

  // 컬럼 정의
  const colDefs = [
    {
      headerName: "카드번호",
      field: "trcr_no",
      width: 180,
      resizable: false,
    },
    {
      headerName: "승차시간",
      field: "ride_dtm",
      width: 180,
      valueFormatter: (params: { value: number | null | undefined }) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleString();
      },
      resizable: false,
    },
    {
      headerName: "하차시간",
      field: "algh_dtm",
      width: 180,
      valueFormatter: (params: { value: number | null | undefined }) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleString();
      },
      resizable: false,
    },
    {
      headerName: "최초승차역",
      field: "ride_nm",
      width: 150,
      resizable: false,
    },
    {
      headerName: "최종하차역",
      field: "algh_nm",
      width: 150,
      resizable: false,
    },
    {
      headerName: "총배분금",
      field: "fnl_dist_amt",
      width: 150,
      valueFormatter: (params: { value: number | null | undefined }) =>
        (params.value || 0).toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
      resizable: false,
    },
    {
      headerName: "기본배분금",
      field: "base_dist_amt",
      width: 150,
      valueFormatter: (params: { value: number | null | undefined }) =>
        (params.value || 0).toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
      resizable: false,
    },
    {
      headerName: "도시철도부가사용금",
      field: "ubrw_adtn_use_amt",
      width: 200,
      valueFormatter: (params: { value: number | null | undefined }) =>
        (params.value || 0).toLocaleString() + "원",
      cellStyle: { textAlign: "right" },
      resizable: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">상세조회</h1>

      <TransactionDetailFilterForm
        defaultValues={{
          tradeDate: "",
          cardType: "",
          agency: "",
          line: "",
          stations: [],
        }}
        onSearch={handleSearch}
      />

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
          rowData={hasSearched ? apiData ?? [] : []} // ✅ 모든 데이터 렌더링
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
            // domLayout 제거하여 고정 높이로 설정
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
