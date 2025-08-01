"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
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
import { UnitRadioGroup, type Unit } from "@/components/ui/UnitRadioGroup";
import { useUnitConversion } from "@/hooks/useUnitConversion";
import { InstitutionChart } from "@/components/charts/InstitutionChart";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettlementByInstitutionPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<SettlementByInstitutionFilters>({
    agency: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // 원단위 상태 추가
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

  // 원단위 변환된 데이터
  const rowData = useUnitConversion(apiData, unit);

  const colDefs = [
    {
      headerName: "기관명",
      field: "대상기관",
      width: 200,
      resizable: true,
    },
    {
      headerName: "지급",
      field: "지급액",
      width: 200,
      resizable: true,
      valueFormatter: (params: { value: number }) => {
        if (unit === "원") {
          return params.value.toLocaleString() + "원";
        } else {
          return params.value.toLocaleString() + unit;
        }
      },
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "수급",
      field: "수급액",
      width: 200,
      resizable: true,
      valueFormatter: (params: { value: number }) => {
        if (unit === "원") {
          return params.value.toLocaleString() + "원";
        } else {
          return params.value.toLocaleString() + unit;
        }
      },
      cellStyle: { textAlign: "right" },
    },
    {
      headerName: "계",
      field: "차액",
      width: 200,
      resizable: true,
      valueFormatter: (params: { value: number }) => {
        if (unit === "원") {
          return params.value.toLocaleString() + "원";
        } else {
          return params.value.toLocaleString() + unit;
        }
      },
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

      {/* 원단위 변경 및 CSV 내보내기 버튼 */}
      <div className="flex justify-end gap-4">
        <UnitRadioGroup value={unit} onChange={setUnit} />
        <CsvExportButton
          gridRef={gridRef}
          fileName="settlement_by_institution_data.csv"
          className="shadow-lg bg-accent-500"
        />
      </div>

      {/* 좌우 그리드 레이아웃 */}
      <div className="grid grid-cols-2 gap-6 h-[600px]">
        {/* 왼쪽: 정산결과 그리드 */}
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-semibold">정산결과 목록</h2>
          <div className="relative flex-1 h-full">
            {hasSearched && loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Spinner />
              </div>
            )}
            <TestGrid
              rowData={hasSearched ? rowData ?? [] : []} // ✅ 원단위 변환된 데이터 사용
              columnDefs={colDefs}
              gridRef={gridRef}
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
        </div>

        {/* 오른쪽: 차트 영역 */}
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-semibold">차트 분석</h2>
          <div className="relative flex-1 h-full">
            {!hasSearched ? (
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">조회 버튼을 눌러주세요</p>
                  <p className="text-sm">기관을 선택하고 조회하면</p>
                  <p className="text-sm">
                    해당 기관의 정산결과 차트가 표시됩니다.
                  </p>
                </div>
              </div>
            ) : hasSearched && apiData && apiData.length > 0 ? (
              <div className="h-full w-full">
                <InstitutionChart data={apiData} unit={unit} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">조회된 데이터가 없습니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
