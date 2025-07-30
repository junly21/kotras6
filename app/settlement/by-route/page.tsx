"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import TestGrid from "@/components/TestGrid";
import { SettlementByRouteService } from "@/services/settlementByRouteService";
import {
  settlementByRouteFields,
  settlementByRouteSchema,
  SettlementByRouteFilters,
} from "@/features/settlementByRoute/filterConfig";
import { createSettlementByRouteColDefs } from "@/features/settlementByRoute/gridConfig";
import type { SettlementByRouteData } from "@/types/settlementByRoute";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettlementByRoutePage() {
  const [filters, setFilters] = useState<SettlementByRouteFilters>({
    agency: "",
  });

  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SettlementByRouteData[]>([]);

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

  // AG Grid ref
  const gridRef = useRef(null);

  // 동적 컬럼 정의 생성
  const columnDefs = useMemo(() => {
    return createSettlementByRouteColDefs(data);
  }, [data]);

  const handleSearch = useCallback(async (values: SettlementByRouteFilters) => {
    console.log("노선별 조회 검색:", values);
    setHasSearched(true);
    setFilters(values);
    setLoading(true);

    try {
      const response = await SettlementByRouteService.getSettlementByRoute(
        values.agency
      );

      if (response.success && response.data) {
        setData(response.data);
        setToast({
          isVisible: true,
          message: "노선별 조회 데이터를 성공적으로 받았습니다.",
          type: "success",
        });
        console.log("노선별 조회 결과:", response.data);
      } else {
        throw new Error(response.error || "데이터 조회 실패");
      }
    } catch (error) {
      console.error("노선별 조회 실패:", error);
      setToast({
        isVisible: true,
        message: `조회 실패: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`,
        type: "error",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">노선별 조회</h1>

      <FilterForm<SettlementByRouteFilters>
        fields={settlementByRouteFields}
        defaultValues={{ agency: "" }}
        schema={settlementByRouteSchema}
        onSearch={handleSearch}
      />

      {/* 결과 영역 */}
      {!hasSearched && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">조회 결과</p>
            <p className="text-sm">
              보관기관을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!loading && data.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">노선별 조회 결과</h3>
              <div className="h-96">
                <TestGrid
                  rowData={data}
                  columnDefs={columnDefs}
                  gridRef={gridRef}
                  gridOptions={{
                    headerHeight: 40, // 그룹핑된 헤더를 위한 높이 조정
                    suppressRowClickSelection: true,
                    suppressCellFocus: true,
                    suppressColumnMove: true, // 컬럼 드래그 앤 드롭 비활성화
                    defaultColDef: {
                      sortable: false,
                      filter: false,
                      resizable: true,
                    },
                  }}
                />
              </div>
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">조회된 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 토스트 알림 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}
