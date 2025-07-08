"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { FilterForm } from "@/components/ui/FilterForm";
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
  // gridRef 생성
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<TransactionAnalysisFilters>({
    agency: "",
  });

  // API 호출 함수
  const apiCall = useCallback(
    () => TransactionAnalysisService.getAnalysisData(filters),
    [filters]
  );

  // 콜백 함수들
  const onSuccess = useCallback((data: TransactionAnalysisData[]) => {
    console.log("거래내역 분석 데이터 로드 성공:", data);
  }, []);

  const onError = useCallback((error: string) => {
    console.error("거래내역 분석 데이터 로드 실패:", error);
  }, []);

  const {
    data: apiData,
    error,
    loading,
    refetch,
  } = useApi<TransactionAnalysisData[]>(apiCall, {
    autoFetch: false, // 필터 적용 후에만 호출
    onSuccess,
    onError,
  });

  // filters가 변경될 때마다 API 호출
  useEffect(() => {
    if (filters.agency) {
      refetch();
    }
  }, [filters, refetch]);

  // 필터 검색 핸들러
  const handleSearch = useCallback((values: TransactionAnalysisFilters) => {
    setFilters(values);
  }, []);

  // 컬럼 정의
  const colDefs = [
    {
      headerName: "순위",
      field: "rank",
      width: 80,
      pinned: "left",
      cellStyle: { fontWeight: "bold" },
      resizable: false, // 리사이징 비활성화
    },
    {
      headerName: "기관명",
      field: "agency",
      width: 220,
      resizable: false, // 리사이징 비활성화
    },
    {
      headerName: "승차역",
      field: "boardingStation",
      width: 220,
      resizable: false, // 리사이징 비활성화
    },
    {
      headerName: "하차역",
      field: "alightingStation",
      width: 220,
      resizable: false, // 리사이징 비활성화
    },
    {
      headerName: "데이터 건수",
      field: "dataCount",
      width: 220,
      valueFormatter: (params: { value: number }) => {
        return params.value.toLocaleString();
      },
      resizable: false, // 리사이징 비활성화
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">거래내역 분석</h1>

      {/* 필터 폼 */}
      <FilterForm<TransactionAnalysisFilters>
        fields={transactionAnalysisFields}
        defaultValues={{ agency: "" }}
        schema={transactionAnalysisSchema}
        onSearch={handleSearch}
      />

      {/* 상태 메시지 */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <strong>로딩 중...</strong> 데이터를 가져오는 중입니다.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>에러:</strong> {error}
        </div>
      )}

      {apiData && !loading && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>성공:</strong> 거래내역 분석 데이터를 성공적으로 받았습니다.
        </div>
      )}

      {/* CSV 내보내기 버튼
      <div className="flex justify-end">
        <CsvExportButton
          gridRef={gridRef}
          fileName="transaction_analysis_data.csv"
          className="shadow-lg bg-accent-500"
        />
      </div> */}

      {/* 그리드 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Spinner />
          </div>
        )}
        <TestGrid
          rowData={loading ? null : apiData}
          columnDefs={colDefs}
          gridRef={gridRef}
          gridOptions={{
            // 그리드 전체 리사이징 비활성화
            suppressColumnResize: true,
            // 행 선택 비활성화
            suppressRowClickSelection: true,
            // 셀 포커스 비활성화
            suppressCellFocus: true,
            // 헤더 높이 설정
            headerHeight: 50,
            // 행 높이 설정
            rowHeight: 45,
            // 스크롤 설정
            suppressScrollOnNewData: true,
            // 테마 설정
            domLayout: "autoHeight",
          }}
        />
      </div>
    </div>
  );
}
