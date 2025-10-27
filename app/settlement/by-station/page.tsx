"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { z } from "zod";
import { FilterForm } from "@/components/ui/FilterForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { settlementByStationFilterConfig } from "@/features/settlementByStation/filterConfig";
import {
  SettlementByStationFilters,
  SettlementByStationData,
} from "@/types/settlementByStation";
import { SettlementByStationService } from "@/services/settlementByStationService";
import { createSettlementByStationColDefs } from "@/features/settlementByStation/gridConfig";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 검증 스키마 (대안은 필수, 첫 번째 역은 필수, 나머지 역은 선택사항)
const settlementByStationSchema = z
  .object({
    // stmtGrpId: z.string().min(1, "대안을 선택해주세요"),
    STN_ID1: z.string().min(1, "첫 번째 역을 선택해주세요"),
    STN_ID2: z.string().optional(),
    STN_ID3: z.string().optional(),
    STN_ID4: z.string().optional(),
    STN_ID5: z.string().optional(),
  })
  .refine(
    (data) => {
      // 선택된 역들을 배열로 수집 (빈 문자열 제외)
      const selectedStations = [
        data.STN_ID1,
        data.STN_ID2,
        data.STN_ID3,
        data.STN_ID4,
        data.STN_ID5,
      ].filter((station) => station && station.trim() !== "");

      // 중복 제거 후 길이 비교
      const uniqueStations = [...new Set(selectedStations)];

      // 선택된 역이 있고, 중복이 있으면 false 반환
      return (
        selectedStations.length === 0 ||
        selectedStations.length === uniqueStations.length
      );
    },
    {
      message: "같은 역을 중복으로 선택할 수 없습니다.",
      path: ["STN_ID5"], // 에러를 마지막 역 필드에 표시
    }
  );

// 기본값
const defaultValues: SettlementByStationFilters = {
  stmtGrpId: "",
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
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // ✅ 조회 버튼을 눌렀을 때의 필터 상태 저장 (CSV 다운로드용)
  const [lastSearchedFilters, setLastSearchedFilters] =
    useState<SettlementByStationFilters>(defaultValues);

  // AG Grid ref
  const gridRef = useRef(null);

  // 중복된 역 검증 함수
  const validateStations = useCallback((values: SettlementByStationFilters) => {
    const selectedStations = [
      values.STN_ID1,
      values.STN_ID2,
      values.STN_ID3,
      values.STN_ID4,
      values.STN_ID5,
    ].filter((station) => station && station.trim() !== "");

    const uniqueStations = [...new Set(selectedStations)];
    const hasDuplicates = selectedStations.length !== uniqueStations.length;

    if (hasDuplicates) {
      // 중복된 역들을 찾아서 에러 표시
      const errors: { [key: string]: string } = {};
      const seen = new Set<string>();

      Object.entries(values).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          if (seen.has(value)) {
            errors[key] = "중복된 역입니다";
          } else {
            seen.add(value);
          }
        }
      });

      setValidationErrors(errors);
      return false;
    } else {
      setValidationErrors({});
      return true;
    }
  }, []);

  // 동적 컬럼 정의 생성
  const columnDefs = useMemo(() => {
    try {
      // API 응답에서 선택된 역 이름들을 추출
      const selectedStations: string[] = [];
      if (searchResults.length > 0) {
        const firstItem = searchResults[0];
        const keys = Object.keys(firstItem);

        keys.forEach((key) => {
          if (key !== "stn_nm") {
            const parts = key.split("_");
            if (parts.length >= 3) {
              // 1_가능(1907)_지급 형태에서 역명 추출
              const stationName = parts.slice(1, -1).join("_");
              if (!selectedStations.includes(stationName)) {
                selectedStations.push(stationName);
              }
            } else if (parts.length === 2) {
              // 2개 부분으로 나뉘는 경우
              const stationName = parts[0];
              if (!selectedStations.includes(stationName)) {
                selectedStations.push(stationName);
              }
            }
          }
        });
      }

      return createSettlementByStationColDefs(searchResults, selectedStations);
    } catch (error) {
      console.error("컬럼 정의 생성 중 오류:", error);
      // 에러 발생 시 기본 컬럼만 반환
      return [
        {
          headerName: "역명",
          field: "stn_nm",
          width: 150,
          pinned: "left",
        },
      ];
    }
  }, [searchResults]);

  // 푸터 행 데이터 생성
  const footerRowData = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];

    const footerRow: Record<string, string | number> = {
      stn_nm: `총 ${searchResults.length}건`,
    };

    // 각 컬럼의 총계 계산
    if (searchResults.length > 0) {
      const firstItem = searchResults[0];
      const keys = Object.keys(firstItem);

      keys.forEach((key) => {
        if (key !== "stn_nm") {
          const total = searchResults.reduce((sum, item) => {
            const value = item[key];
            return sum + (typeof value === "number" ? value : 0);
          }, 0);
          // 소수점 제거하고 정수로 표시 (단위 제거)
          footerRow[key] = Math.round(total).toLocaleString();
        }
      });
    }

    return [footerRow];
  }, [searchResults]);

  // 소수점 제거된 그리드 데이터
  const processedRowData = useMemo(() => {
    return searchResults.map((item) => {
      const processedItem: Record<string, unknown> = { ...item };

      // 모든 숫자 필드에서 소수점 제거
      Object.keys(processedItem).forEach((key) => {
        if (key !== "stn_nm" && typeof processedItem[key] === "number") {
          processedItem[key] = Math.round(processedItem[key] as number);
        }
      });

      return processedItem;
    });
  }, [searchResults]);

  // 필터 변경 핸들러
  const handleFilterChange = (values: SettlementByStationFilters) => {
    setFilters(values);
    // 필터 변경 시 중복 검증
    validateStations(values);
  };

  // 검색 핸들러
  const handleSearchSubmit = useCallback(
    async (values: SettlementByStationFilters) => {
      // 중복 검증
      if (!validateStations(values)) {
        setError("중복된 역을 선택했습니다. 다른 역을 선택해주세요.");
        return;
      }

      setHasSearched(true);
      setFilters(values);
      // ✅ 조회 버튼을 눌렀을 때의 필터 상태 저장
      setLastSearchedFilters(values);
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
    [validateStations]
  );

  // 필터 설정에 validationErrors 전달
  const filterConfigWithErrors = useMemo(() => {
    return settlementByStationFilterConfig.map((field) => ({
      ...field,
      error: validationErrors[field.name] || undefined,
      className: validationErrors[field.name] ? "border-red-500" : undefined,
    }));
  }, [validationErrors]);

  return (
    <ProtectedRoute requiredPath="/settlement/by-station">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">연락운임 역별 조회</h1>
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
          fields={filterConfigWithErrors}
          defaultValues={defaultValues}
          schema={settlementByStationSchema}
          values={filters}
          onChange={handleFilterChange}
          onSearch={handleSearchSubmit}
        />

        {/* 결과 영역 */}
        {!hasSearched && (
          <div className="bg-gray-50 flex flex-col justify-center items-center h-[590px] border-2 border-dashed border-gray-300 rounded-lg p-16">
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
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">역사별 정산결과</h3>
                  {/* CSV Export 버튼 */}
                  {hasSearched && searchResults.length > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            "/api/settlement/by-station/download",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                NET_DT: "LATEST",
                                // STMT_GRP_ID: lastSearchedFilters.stmtGrpId,
                                STMT_GRP_ID: "SG002",
                              }),
                            }
                          );

                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "역사별조회결과.csv";
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } else {
                            console.error("CSV 다운로드 실패");
                          }
                        } catch (error) {
                          console.error("CSV 다운로드 중 오류:", error);
                        }
                      }}
                      className="bg-primary font-bold hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer">
                      CSV 내보내기
                    </button>
                  )}
                </div>
                <div className="bg-white border border-gray-200 rounded-[24px] p-4">
                  <div className="h-[500px]">
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
                          enableClickSelection: false, // 행 클릭 선택 비활성화
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

            {!isLoading && searchResults.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">조회된 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
