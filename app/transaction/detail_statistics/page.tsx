"use client";

import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import { DetailStatisticsFilterForm } from "@/components/transactionDetailStatistics/DetailStatisticsFilterForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TransactionDetailStatisticsService } from "@/services/transactionDetailStatisticsService";
import type { DetailStatisticsParams } from "@/services/transactionDetailStatisticsService";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useCallback, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  TransactionDetailStatisticsData,
  CARD_DIV_Y_LABEL,
} from "@/types/transactionDetailStatistics";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionDetailStatisticsPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<TransactionDetailStatisticsData[]>([]);
  const [lastParams, setLastParams] = useState<DetailStatisticsParams | null>(
    null
  );
  const [selectedDateDisplay, setSelectedDateDisplay] = useState<string[]>([]);

  const handleSearch = useCallback(
    (params: DetailStatisticsParams, display: string[] = []) => {
      setHasSearched(true);
      setLastParams(params);
      setSelectedDateDisplay(display);
      setLoading(true);
      TransactionDetailStatisticsService.getStatisticsData(params)
      .then((result) => {
        if (result.success && result.data) {
          const data = Array.isArray(result.data) ? result.data : [];
          setApiData(data);
        } else {
          setApiData([]);
        }
      })
      .catch(() => {
        setApiData([]);
      })
      .finally(() => {
        setLoading(false);
      });
    },
    []
  );

  const colDefs = [
    {
      headerName: "카드구분",
      field: "card_div",
      minWidth: 140,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: string }) =>
        params.value === "Y" ? CARD_DIV_Y_LABEL : params.value ?? "-",
    },
    {
      headerName: "승차기관",
      field: "ride_oper_nm",
      minWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "하차기관",
      field: "algh_oper_nm",
      minWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "승차노선",
      field: "ride_line_nm",
      minWidth: 100,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "하차노선",
      field: "algh_line_nm",
      minWidth: 100,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "승차역",
      field: "ride_stn_nm",
      minWidth: 100,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "하차역",
      field: "algh_stn_nm",
      minWidth: 100,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "건수",
      field: "cnt",
      minWidth: 80,
      flex: 1,
      valueFormatter: (params: { value: number }) =>
        (params.value ?? 0).toLocaleString(),
      resizable: false,
      cellStyle: { textAlign: "right" },
    },
  ];

  const rowData: TransactionDetailStatisticsData[] = hasSearched
    ? apiData
    : [];

  const displayItems =
    selectedDateDisplay.length > 0 ? selectedDateDisplay : lastParams?.tradeDates ?? [];

  return (
    <ProtectedRoute requiredPath="/transaction/detail_statistics">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">이용내역 상세통계</h1>

        <DetailStatisticsFilterForm
          defaultValues={{
            tradeDates: [],
            agency: "",
            lines: [],
            stationDiv: "",
            cardType: "N",
          }}
          onSearch={handleSearch}
        />

        {hasSearched && (
          <div className="flex justify-between items-start gap-4">
            <div className="flex min-w-0">
              <div className="text-sm text-gray-600 mb-2 mr-2">선택된 거래일자 : </div>
              <div className="flex flex-wrap gap-2">
                {displayItems.length > 0 ? (
                  displayItems.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
            </div>
            <CsvExportButton
              gridRef={gridRef}
              fileName="이용내역_상세통계.csv"
              className="shadow-lg bg-accent-500"
            />
          </div>
        )}

        <div className="relative">
          {hasSearched && loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
              <Spinner />
            </div>
          )}
          <TestGrid
            rowData={rowData}
            columnDefs={colDefs}
            gridRef={gridRef}
            height={540}
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
      </div>
    </ProtectedRoute>
  );
}
