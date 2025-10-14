"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { useAgencyOptions } from "@/hooks/useFilterOptions";
import { TransactionAmountService } from "@/services/transactionAmountService";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ColGroupDef } from "ag-grid-community";
import {
  TransactionAmountFilters,
  TransactionAmountData,
  TransactionAmountRawData,
} from "@/types/transactionAmount";
import {
  transactionAmountFields,
  transactionAmountSchema,
} from "@/features/transactionAmount/filterConfig";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionAmountPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<TransactionAmountFilters>({
    agency: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ 기관 옵션 훅 사용
  const handleAgencyChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, agency: value }));
  }, []);

  const {
    options: agencyOptions,
    isLoading: isAgencyLoading,
    isAllOptionsLoaded: isAgencyLoaded,
  } = useAgencyOptions(handleAgencyChange);

  // ✅ 첫 번째 기관이 로드되면 자동으로 선택 (백업 로직)
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (
      agencyOptions.agency &&
      agencyOptions.agency.length > 0 &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      const firstAgency = agencyOptions.agency[0].value;
      setFilters((prev) => ({ ...prev, agency: firstAgency }));
    }
  }, [agencyOptions.agency]); // filters.agency 의존성 제거

  // ✅ 모든 기관 옵션이 로드되고 첫 번째 기관이 선택되면 자동 조회
  useEffect(() => {
    if (isAgencyLoaded && filters.agency && !hasSearched) {
      setHasSearched(true);
    }
  }, [isAgencyLoaded, filters.agency, hasSearched]);

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
    () => TransactionAmountService.getAmountData(filters),
    [filters]
  );

  const onSuccess = useCallback(() => {
    setToast({
      isVisible: true,
      message: "거래금액 총계 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const {
    data: rawApiData,
    loading,
    refetch,
  } = useApi<TransactionAmountRawData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  const handleSearch = useCallback((values: TransactionAmountFilters) => {
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  // 원본 데이터를 그리드용 데이터로 변환하는 로직
  const { apiData, uniqueSubways } = useMemo(() => {
    if (!rawApiData || rawApiData.length === 0) {
      return { apiData: [], uniqueSubways: [] };
    }

    // 모든 고유한 지하철 노선 추출
    const subwaySet = new Set(rawApiData.map((item) => item.subway));
    const uniqueSubways = Array.from(subwaySet).sort();

    // 날짜별로 데이터 그룹화
    const dateGroups: { [key: string]: TransactionAmountRawData[] } = {};
    rawApiData.forEach((item) => {
      if (!dateGroups[item.ride_oprn_dt]) {
        dateGroups[item.ride_oprn_dt] = [];
      }
      dateGroups[item.ride_oprn_dt].push(item);
    });

    // 그리드용 데이터로 변환
    const transformedData: TransactionAmountData[] = Object.keys(dateGroups)
      .sort()
      .map((date) => {
        const dateData = dateGroups[date];
        const row: TransactionAmountData = {
          ride_oprn_dt: date,
        };

        // 총계 컬럼 추가 (fnl_dist_amt_sum이 있으면 사용, 없으면 계산)
        const firstItem = dateData[0];
        if (firstItem?.fnl_dist_amt_sum !== undefined) {
          row.total_amount = firstItem.fnl_dist_amt_sum;
        } else {
          // fnl_dist_amt_sum이 없으면 각 노선의 총배분금을 합산
          row.total_amount = dateData.reduce(
            (sum, item) => sum + (item.fnl_dist_amt || 0),
            0
          );
        }

        // 각 지하철 노선별로 금액 데이터 추가
        uniqueSubways.forEach((subway) => {
          const subwayData = dateData.find((item) => item.subway === subway);
          if (subwayData) {
            row[`${subway}_총배분금`] = subwayData.fnl_dist_amt;
            row[`${subway}_도시철도부가사용금`] = subwayData.ubrw_adtn_use_amt;
            row[`${subway}_기본배분금`] = subwayData.base_dist_amt;
          } else {
            row[`${subway}_총배분금`] = 0;
            row[`${subway}_도시철도부가사용금`] = 0;
            row[`${subway}_기본배분금`] = 0;
          }
        });

        return row;
      });

    return { apiData: transformedData, uniqueSubways };
  }, [rawApiData]);

  // 동적 컬럼 정의 생성 (Column Groups 사용)
  const colDefs = useMemo((): (ColDef | ColGroupDef)[] => {
    const columns: (ColDef | ColGroupDef)[] = [
      {
        headerName: "운행일자",
        field: "ride_oprn_dt",
        minWidth: 120,
        pinned: "left",
        resizable: false,
        cellStyle: { fontWeight: "bold", textAlign: "center" },
      },
      {
        headerName: "총계(원)",
        field: "total_amount",
        minWidth: 120,
        pinned: "left",
        resizable: false,
        valueFormatter: (params: { value: number | string }) =>
          params.value ? Number(params.value).toLocaleString() : "0",
        cellStyle: {
          fontWeight: "bold",
          textAlign: "right",
          backgroundColor: "#f8fafc",
        },
      },
    ];

    // 각 지하철 노선별로 컬럼 그룹 생성
    uniqueSubways.forEach((subway) => {
      const groupDef: ColGroupDef = {
        headerName: subway,
        children: [
          {
            headerName: "총보유금(원)",
            field: `${subway}_총배분금`,
            minWidth: 120,
            valueFormatter: (params: { value: number | string }) =>
              params.value ? Number(params.value).toLocaleString() : "0",
            cellStyle: { textAlign: "right" },
            resizable: false,
          },
          {
            headerName: "도시철도부가사용금(원)",
            field: `${subway}_도시철도부가사용금`,
            minWidth: 140,
            valueFormatter: (params: { value: number | string }) =>
              params.value ? Number(params.value).toLocaleString() : "0",
            cellStyle: { textAlign: "right" },
            resizable: false,
          },
          {
            headerName: "기본배분금(원)",
            field: `${subway}_기본배분금`,
            minWidth: 120,
            valueFormatter: (params: { value: number | string }) =>
              params.value ? Number(params.value).toLocaleString() : "0",
            cellStyle: { textAlign: "right" },
            resizable: false,
          },
        ],
      };
      columns.push(groupDef);
    });

    return columns;
  }, [uniqueSubways]);

  // 하단 고정 행 데이터 (총계)
  const pinnedBottomRowData = useMemo(() => {
    if (!apiData || apiData.length === 0) return [];

    const totalsRow: TransactionAmountData = {
      ride_oprn_dt: `총 ${apiData.length}일`,
    };

    // 총계 컬럼의 총합 계산
    const totalAmountSum = apiData.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    );
    totalsRow.total_amount = totalAmountSum;

    // 각 지하철 노선별 총계 계산
    uniqueSubways.forEach((subway) => {
      const totalFnl = apiData.reduce(
        (sum, item) => sum + Number(item[`${subway}_총배분금`] || 0),
        0
      );
      const totalUbrw = apiData.reduce(
        (sum, item) => sum + Number(item[`${subway}_도시철도부가사용금`] || 0),
        0
      );
      const totalBase = apiData.reduce(
        (sum, item) => sum + Number(item[`${subway}_기본배분금`] || 0),
        0
      );

      totalsRow[`${subway}_총배분금`] = totalFnl;
      totalsRow[`${subway}_도시철도부가사용금`] = totalUbrw;
      totalsRow[`${subway}_기본배분금`] = totalBase;
    });

    return [totalsRow];
  }, [apiData, uniqueSubways]);

  // 하단 고정 행 스타일
  const getRowStyle = useCallback(
    (params: { node: { rowPinned?: string } }) => {
      if (params.node.rowPinned === "bottom") {
        return {
          backgroundColor: "#f8fafc",
          fontWeight: "bold",
          borderTop: "2px solid #e2e8f0",
        };
      }
      return {};
    },
    []
  );

  return (
    <ProtectedRoute requiredPath="/transaction/amount">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">이용내역 노선별 내역</h1>

        {/* ✅ 필터 폼 로딩 상태 표시 */}
        <div className="relative">
          {isAgencyLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
              <Spinner />
            </div>
          )}
          <FilterForm<TransactionAmountFilters>
            fields={transactionAmountFields}
            defaultValues={filters}
            values={filters}
            schema={transactionAmountSchema}
            onSearch={handleSearch}
          />
        </div>

        {/* CSV 내보내기 버튼 */}
        {hasSearched && apiData && apiData.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                이용내역 노선별 내역 결과조회
              </h3>
              <span className="text-sm text-gray-500">
                하기 금액은 정제 이후의 금액이며 28일치 이용 내역입니다.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <CsvExportButton
                gridRef={gridRef}
                fileName="거래금액_총계_데이터.csv"
                className="shadow-lg bg-accent-500"
              />
            </div>
          </div>
        )}

        {/* 그리드 */}
        <div className="relative h-[calc(100vh-370px)] overflow-y-auto">
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
              pinnedBottomRowData: pinnedBottomRowData,
              getRowStyle: getRowStyle,
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
