"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import TestGrid from "@/components/TestGrid";
import CsvExportButton from "@/components/CsvExportButton";
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

  // 푸터 행 데이터 생성
  const footerRowData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const footerRow: Record<string, string | number> = {
      line_nm: `총 ${data.length}건`,
    };

    // 각 컬럼의 총계 계산
    if (data.length > 0) {
      const firstItem = data[0];
      const keys = Object.keys(firstItem);

      keys.forEach((key) => {
        if (key !== "line_nm") {
          const total = data.reduce((sum, item) => {
            const value = item[key];
            return sum + (typeof value === "number" ? value : 0);
          }, 0);
          // 소수점 제거하고 정수로 표시
          footerRow[key] = `${Math.round(total).toLocaleString()}`;
        }
      });
    }

    return [footerRow];
  }, [data]);

  // 소수점 제거된 그리드 데이터
  const processedRowData = useMemo(() => {
    return data.map((item) => {
      const processedItem: Record<string, string | number> = { ...item };

      // 모든 숫자 필드에서 소수점 제거
      Object.keys(processedItem).forEach((key) => {
        if (key !== "line_nm" && typeof processedItem[key] === "number") {
          processedItem[key] = Math.round(processedItem[key] as number);
        }
      });

      return processedItem;
    });
  }, [data]);

  const handleSearch = useCallback(async (values: SettlementByRouteFilters) => {
    console.log("노선별 조회 검색:", values);
    setHasSearched(true);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">정산결과 노선별 조회</h1>

      <FilterForm<SettlementByRouteFilters>
        fields={settlementByRouteFields}
        defaultValues={{ agency: "" }}
        schema={settlementByRouteSchema}
        onSearch={handleSearch}
      />

      {/* 결과 영역 */}
      {!hasSearched && (
        <div className="bg-gray-50 flex flex-col justify-center items-center h-[600px] border-2 border-dashed border-gray-300 rounded-lg p-16">
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
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">노선별 조회 결과</h3>
                {hasSearched && data.length > 0 && (
                  <CsvExportButton
                    gridRef={gridRef}
                    fileName="settlement_by_route_data.csv"
                    className="shadow-lg bg-accent-500"
                  />
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                <div className="h-[550px]">
                  <TestGrid
                    rowData={processedRowData}
                    columnDefs={columnDefs}
                    gridRef={gridRef}
                    gridOptions={{
                      headerHeight: 40, // 그룹핑된 헤더를 위한 높이 조정
                      suppressCellFocus: true,
                      suppressMovableColumns: true, // 컬럼 드래그 앤 드롭 비활성화
                      suppressMenuHide: true, // 컬럼 메뉴 숨김 비활성화
                      rowSelection: {
                        enableClickSelection: false, // 행 클릭 선택 비활성화 (새로운 방식)
                      },
                      defaultColDef: {
                        sortable: false,
                        filter: false,
                        resizable: false,
                        suppressMovable: true, // 개별 컬럼 이동 비활성화
                      },
                      pinnedBottomRowData: footerRowData, // 푸터 행 데이터 추가
                    }}
                  />
                </div>
              </div>
            </>
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
