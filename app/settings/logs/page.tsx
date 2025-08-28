"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { JobLogService } from "@/services/jobLogService";
import { useCallback, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { JobLogFilters, JobLogData } from "@/types/jobLog";
import { jobLogFields, jobLogSchema } from "@/features/jobLog/filterConfig";
import ProtectedRoute from "@/components/ProtectedRoute";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettingsLogsPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<JobLogFilters>({
    processDiv: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // 컬럼 정의 상태 추가
  const [colDefs, setColDefs] = useState<
    Array<{
      headerName: string;
      field: string;
      flex: number;
      minWidth: number;
      resizable: boolean;
      valueFormatter?: (params: { value: number }) => string;
    }>
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

  const apiCall = useCallback(
    () => JobLogService.getJobLogList(filters),
    [filters]
  );

  const onSuccess = useCallback((data: JobLogData[]) => {
    console.log("작업로그 데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: "작업로그 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("작업로그 데이터 로드 실패:", error);
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
  } = useApi<JobLogData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  // filters.processDiv가 변경될 때마다 컬럼 정의 업데이트
  useEffect(() => {
    const newColDefs = getColumnDefs(filters.processDiv);
    setColDefs(newColDefs);
  }, [filters.processDiv]);

  const handleSearch = useCallback((values: JobLogFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  // 프로세스구분에 따른 컬럼 정의
  const getColumnDefs = (processDiv: string) => {
    if (processDiv === "SETTLE") {
      return [
        {
          headerName: "프로세스구분",
          field: "process_div",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "상세구분",
          field: "detail_div",
          flex: 1,
          minWidth: 200,
          resizable: false,
        },
        {
          headerName: "거래일자",
          field: "card_dt",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "작업시작시간",
          field: "stmt_start_dtm",
          flex: 1,
          minWidth: 200,
          resizable: false,
          valueFormatter: (params: { value: number }) => {
            if (!params.value) return "";
            return new Date(params.value).toLocaleString();
          },
        },
        {
          headerName: "작업종료시간",
          field: "stmt_end_dtm",
          flex: 1,
          minWidth: 200,
          resizable: false,
          valueFormatter: (params: { value: number }) => {
            if (!params.value) return "";
            return new Date(params.value).toLocaleString();
          },
        },
        {
          headerName: "비고",
          field: "remark",
          flex: 1,
          minWidth: 200,
          resizable: false,
        },
      ];
    } else if (processDiv === "REFINE") {
      // 정제용 컬럼 정의
      return [
        {
          headerName: "프로세스구분",
          field: "process_div",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "상세구분",
          field: "detail_div",
          flex: 1,
          minWidth: 200,
          resizable: false,
        },
        {
          headerName: "작업유형",
          field: "action_type",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "작업일시",
          field: "process_dtm",
          flex: 1,
          minWidth: 200,
          resizable: false,
          valueFormatter: (params: { value: number }) => {
            if (!params.value) return "";
            return new Date(params.value).toLocaleString();
          },
        },
        {
          headerName: "작업구분",
          field: "action_div",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "처리건수",
          field: "process_cnt",
          flex: 1,
          minWidth: 120,
          resizable: false,
          valueFormatter: (params: { value: number }) => {
            if (!params.value) return "0";
            return params.value.toLocaleString();
          },
        },
      ];
    } else {
      // 기본 컬럼 정의 (빈 값일 때)
      return [
        {
          headerName: "프로세스구분",
          field: "process_div",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "상세구분",
          field: "detail_div",
          flex: 1,
          minWidth: 200,
          resizable: false,
        },
        {
          headerName: "작업유형",
          field: "action_type",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "작업일시",
          field: "process_dtm",
          flex: 1,
          minWidth: 200,
          resizable: false,
          valueFormatter: (params: { value: number }) => {
            if (!params.value) return "";
            return new Date(params.value).toLocaleString();
          },
        },
        {
          headerName: "작업구분",
          field: "action_div",
          flex: 1,
          minWidth: 150,
          resizable: false,
        },
        {
          headerName: "처리건수",
          field: "process_cnt",
          flex: 1,
          minWidth: 120,
          resizable: false,
          valueFormatter: (params: { value: number }) => {
            if (!params.value) return "0";
            return params.value.toLocaleString();
          },
        },
      ];
    }
  };

  return (
    <ProtectedRoute requiredPath="/settings/logs">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">작업로그 조회</h1>

        <FilterForm<JobLogFilters>
          fields={jobLogFields}
          defaultValues={{ processDiv: "" }}
          schema={jobLogSchema}
          onSearch={handleSearch}
        />

        {/* 그리드 */}
        <div className="relative h-[580px] overflow-y-auto">
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
    </ProtectedRoute>
  );
}
