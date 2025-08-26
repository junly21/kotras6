"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
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

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TestGridPage() {
  // gridRef 생성
  const gridRef = useRef<AgGridReact>(null);
  const [unit, setUnit] = useState<Unit>("원");

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
  const apiCall = useCallback(() => PayRecvService.getOperList(), []);

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

  const { data: apiData, loading } = useApi<PayRecvOperData[]>(apiCall, {
    autoFetch: true,
    onSuccess,
    onError,
  });

  // 숫자 컬럼용 동적 스타일 함수
  const getNumberCellStyle = (params: any) => {
    const num = Number(params.value);
    const color = num > 0 ? "#dc2626" : num < 0 ? "#2563eb" : "#000000";
    return {
      textAlign: "right" as const,
      color: color,
    };
  };

  // 숫자 컬럼용 포맷터 함수
  const getNumberFormatter = (params: any) => {
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
      width: 60,
      pinned: "left",
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "기관",
      field: "pay_oper",
      pinned: "left",
      width: 120,
    },
    {
      headerName: "총계",
      field: "total",
      cellStyle: getNumberCellStyle,
      valueFormatter: getNumberFormatter,
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
      headerName: "신분당선",
      field: "신분당선",
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
      headerName: "용인경전철",
      field: "용인경전철",
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
      headerName: "신림선",
      field: "신림선",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">정산결과</h1>
      </div>

      {/* CSV 내보내기 버튼을 그리드 우상단에 배치 */}

      <div className="mb-8 flex justify-between gap-4">
        <UnitRadioGroup value={unit} onChange={setUnit} />
        <CsvExportButton
          gridRef={gridRef}
          fileName="pay_recv_data.csv"
          className="shadow-lg bg-accent-500"
        />
      </div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Spinner />
          </div>
        )}
        <TestGrid
          rowData={loading ? null : rowData}
          columnDefs={colDefs}
          gridRef={gridRef}
          height={750}
          enableNumberColoring={true}
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
