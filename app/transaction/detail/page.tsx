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
        cnt: acc.cnt + (item.cnt || 0),
      }),
      {
        cnt: 0,
      }
    );

    return {
      line_nm: "",
      stn_nm: "",
      card_div: "",
      oper_nm: "",
      ride_oprn_dt: `총 ${data.length}건`,
      cnt: totals.cnt,
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
      headerName: "거래일자",
      field: "ride_oprn_dt",
      flex: 1,
      minWidth: 120,
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
      headerName: "카드구분",
      field: "card_div",
      minWidth: 120,
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
      headerName: "기관명",
      field: "oper_nm",
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
      headerName: "노선명",
      field: "line_nm",
      minWidth: 120,
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
      headerName: "역명",
      field: "stn_nm",
      minWidth: 120,
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
      headerName: "건수",
      field: "cnt",
      minWidth: 100,
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
              fileName="이용내역_상세내역_조회결과.csv"
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
