"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { TransactionDetailFilterForm } from "@/components/transactionDetail/TransactionDetailFilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import { TransactionDetailService } from "@/services/transactionDetailService";
import { useCallback, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  TransactionDetailFilters,
  TransactionDetailData,
} from "@/types/transactionDetail";
import ProtectedRoute from "@/components/ProtectedRoute";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionDetailPage() {
  const gridRef = useRef<AgGridReact>(null);

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

  const onSuccess = useCallback((data: TransactionDetailData[]) => {
    console.log("상세내역 데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: `상세내역 데이터를 성공적으로 받았습니다. (총 ${data.length}건)`,
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("상세내역 데이터 로드 실패:", error);
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const [apiData, setApiData] = useState<TransactionDetailData[]>([]);
  const [loading, setLoading] = useState(false);

  // 총계 계산 함수
  const calculateTotals = useCallback((data: TransactionDetailData[]) => {
    const totals = data.reduce(
      (acc, item) => ({
        fnl_dist_amt: acc.fnl_dist_amt + (item.fnl_dist_amt || 0),
        base_dist_amt: acc.base_dist_amt + (item.base_dist_amt || 0),
        ubrw_adtn_use_amt:
          acc.ubrw_adtn_use_amt + (item.ubrw_adtn_use_amt || 0),
      }),
      {
        fnl_dist_amt: 0,
        base_dist_amt: 0,
        ubrw_adtn_use_amt: 0,
      }
    );

    return {
      trcr_no: `총 ${data.length}건`,
      ride_dtm: "",
      algh_dtm: "",
      ride_nm: "",
      algh_nm: "",
      fnl_dist_amt: totals.fnl_dist_amt,
      base_dist_amt: totals.base_dist_amt,
      ubrw_adtn_use_amt: totals.ubrw_adtn_use_amt,
    };
  }, []);

  const handleSearch = useCallback(
    (values: TransactionDetailFilters) => {
      console.log("handleSearch 호출됨:", values);
      setHasSearched(true); // ✅ 검색 시작
      setLoading(true);

      // 직접 API 호출
      TransactionDetailService.getDetailData(values)
        .then((result) => {
          if (result.success) {
            const data = result.data || [];
            setApiData(data);
            onSuccess(data);
          } else {
            setApiData([]);
            onError(result.error || "데이터 로드 실패");
          }
        })
        .catch((error) => {
          setApiData([]);
          onError(String(error));
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [onSuccess, onError]
  );

  // 컬럼 정의
  const colDefs = [
    {
      headerName: "카드번호",
      field: "trcr_no",
      flex: 1,
      minWidth: 180,
      resizable: false,
      cellStyle: (params: any) => {
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
      headerName: "승차시각",
      field: "ride_dtm",
      minWidth: 180,
      flex: 1,
      valueFormatter: (params: { value: number | null | undefined }) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleString();
      },
      cellStyle: (params: any) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
      resizable: false,
    },
    {
      headerName: "하차시각",
      field: "algh_dtm",
      minWidth: 180,
      flex: 1,
      valueFormatter: (params: { value: number | null | undefined }) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleString();
      },
      cellStyle: (params: any) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
      resizable: false,
    },
    {
      headerName: "최초승차역",
      field: "ride_nm",
      minWidth: 150,
      flex: 1,
      cellStyle: (params: any) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
      resizable: false,
    },
    {
      headerName: "최종하차역",
      field: "algh_nm",
      minWidth: 150,
      flex: 1,
      cellStyle: (params: any) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
      resizable: false,
    },
    {
      headerName: "총배분금(원)",
      field: "fnl_dist_amt",
      minWidth: 150,
      flex: 1,
      valueFormatter: (params: { value: number | null | undefined }) =>
        (params.value || 0).toLocaleString(),
      cellStyle: (params: any) => {
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
      resizable: false,
    },
    {
      headerName: "기본배분금(원)",
      field: "base_dist_amt",
      minWidth: 150,
      flex: 1,
      valueFormatter: (params: { value: number | null | undefined }) =>
        (params.value || 0).toLocaleString(),
      cellStyle: (params: any) => {
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
      resizable: false,
    },
    {
      headerName: "도시철도부가사용금(원)",
      field: "ubrw_adtn_use_amt",
      minWidth: 220,
      flex: 1,
      valueFormatter: (params: { value: number | null | undefined }) =>
        (params.value || 0).toLocaleString(),
      cellStyle: (params: any) => {
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
      resizable: false,
    },
  ];

  return (
    <ProtectedRoute requiredPath="/transaction/detail">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">이용내역 상세내역</h1>

        <TransactionDetailFilterForm
          defaultValues={{
            tradeDate: "",
            cardType: "",
            agency: "",
            line: "",
            stationDiv: "",
            stations: [],
          }}
          onSearch={handleSearch}
        />

        {/* CSV 내보내기 버튼 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">이용내역 상세내역 조회</h3>
          <div className="flex items-center gap-4">
            <CsvExportButton
              gridRef={gridRef}
              fileName="transaction_detail_data.csv"
              className="shadow-lg bg-accent-500"
            />
          </div>
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
            height={540}
            pinnedBottomRowData={
              hasSearched && apiData.length > 0
                ? [calculateTotals(apiData)]
                : []
            }
            gridOptions={{
              suppressColumnResize: false,
              suppressRowClickSelection: true,
              suppressCellFocus: true,
              headerHeight: 50,
              rowHeight: 35,
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
    </ProtectedRoute>
  );
}
