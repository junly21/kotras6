"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import { settlementByStationFilterConfig } from "@/features/settlementByStation/filterConfig";
import {
  SettlementByStationFilters,
  SettlementByStationData,
} from "@/types/settlementByStation";
import { SettlementByStationService } from "@/services/settlementByStationService";
import { createSettlementByStationColDefs } from "@/features/settlementByStation/gridConfig";
import TestGrid from "@/components/TestGrid";
import CsvExportButton from "@/components/CsvExportButton";
import Spinner from "@/components/Spinner";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마 (모든 필드가 선택사항)
const settlementByStationSchema = z.object({
  STN_ID1: z.string().optional(),
  STN_ID2: z.string().optional(),
  STN_ID3: z.string().optional(),
  STN_ID4: z.string().optional(),
  STN_ID5: z.string().optional(),
});

// 기본값
const defaultValues: SettlementByStationFilters = {
  STN_ID1: "",
  STN_ID2: "",
  STN_ID3: "",
  STN_ID4: "",
  STN_ID5: "",
};

export default function SettlementByStationPage() {
  const [filters, setFilters] =
    useState<SettlementByStationFilters>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SettlementByStationData[]>(
    []
  );
  const [hasSearched, setHasSearched] = useState(false);

  // AG Grid ref
  const gridRef = useRef(null);

  // 동적 컬럼 정의 생성
  const columnDefs = useMemo(() => {
    // API 응답에서 선택된 역 이름들을 추출
    const selectedStations: string[] = [];
    if (searchResults.length > 0) {
      const firstItem = searchResults[0];
      const keys = Object.keys(firstItem);

      keys.forEach((key) => {
        if (key !== "stn_nm") {
          const parts = key.split("_");
          if (parts.length >= 2) {
            const stationName = parts[0];
            if (!selectedStations.includes(stationName)) {
              selectedStations.push(stationName);
            }
          }
        }
      });
    }

    return createSettlementByStationColDefs(searchResults, selectedStations);
  }, [searchResults]);

  // 필터 변경 핸들러
  const handleFilterChange = (values: SettlementByStationFilters) => {
    setFilters(values);
  };

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: SettlementByStationFilters) => {
      setHasSearched(true);
      setFilters(values);
      setIsLoading(true);
      setError(null);

      try {
        const response = await SettlementByStationService.getSettlementData(
          values
        );
        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          setError(response.error || "데이터 조회에 실패했습니다.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">역사별 정산결과 조회</h1>
      </div>

      {/* 전체 페이지 로딩 스피너 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">정산 데이터를 조회하는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 필터 폼 */}
      <FilterForm
        fields={settlementByStationFilterConfig}
        defaultValues={defaultValues}
        schema={settlementByStationSchema}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearchSubmit}
        className="bg-gray-50"
      />

      {/* CSV Export 버튼 */}
      {hasSearched && searchResults.length > 0 && (
        <div className="flex justify-end">
          <CsvExportButton
            gridRef={gridRef}
            fileName="역사별_정산결과.csv"
            className="bg-blue-600 hover:bg-blue-700"
          />
        </div>
      )}

      {/* 결과 영역 */}
      {!hasSearched && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">조회 결과</p>
            <p className="text-sm">
              역을 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
            </p>
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          {!isLoading && searchResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">역사별 정산결과</h3>
              <div className="h-96">
                <TestGrid
                  rowData={searchResults}
                  columnDefs={columnDefs}
                  gridRef={gridRef}
                  gridOptions={{
                    headerHeight: 40, // 그룹핑된 헤더를 위한 높이 조정
                    suppressCellFocus: true,
                    suppressMovableColumns: true, // 컬럼 드래그 앤 드롭 비활성화
                    suppressMenuHide: true, // 컬럼 메뉴 숨김 비활성화
                    rowSelection: {
                      enableClickSelection: false, // 행 클릭 선택 비활성화
                    },
                    defaultColDef: {
                      sortable: false,
                      filter: false,
                      resizable: true,
                      suppressMovable: true, // 개별 컬럼 이동 비활성화
                    },
                  }}
                />
              </div>
            </div>
          )}

          {!isLoading && searchResults.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">조회된 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
