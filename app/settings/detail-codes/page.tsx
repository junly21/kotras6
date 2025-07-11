"use client";

import { useState, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { useApi } from "@/hooks/useApi";
import { CommonCodeService } from "@/services/commonCodeService";
import { DetailCodeService } from "@/services/detailCodeService";
import { CommonCodeData } from "@/types/commonCode";
import { DetailCodeData } from "@/types/detailCode";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettingsDetailCodesPage() {
  const leftGridRef = useRef<AgGridReact>(null);
  const rightGridRef = useRef<AgGridReact>(null);
  const [selectedCommonCode, setSelectedCommonCode] =
    useState<CommonCodeData | null>(null);
  const [detailCodeData, setDetailCodeData] = useState<DetailCodeData[]>([]);
  const [detailCodeLoading, setDetailCodeLoading] = useState(false);

  // 공통코드 목록 API 호출
  const apiCall = useCallback(() => CommonCodeService.getCommonCodeList(), []);

  const onSuccess = useCallback((data: CommonCodeData[]) => {
    console.log("공통코드 목록 로드 성공:", data);
  }, []);

  const onError = useCallback((error: string) => {
    console.error("공통코드 목록 로드 실패:", error);
  }, []);

  const {
    data: commonCodeData,
    error,
    loading,
  } = useApi<CommonCodeData[]>(apiCall, {
    autoFetch: true,
    onSuccess,
    onError,
  });

  // 공통코드 그리드 컬럼 정의
  const commonCodeColDefs = [
    {
      headerName: "공통코드",
      field: "common_code",
      width: 150,
      resizable: true,
    },
    {
      headerName: "공통코드명",
      field: "common_code_name",
      width: 200,
      resizable: true,
    },
  ];

  // 상세코드 그리드 컬럼 정의
  const detailCodeColDefs = [
    {
      headerName: "상세코드",
      field: "detail_code",
      width: 120,
      resizable: true,
    },
    {
      headerName: "값1",
      field: "value_1",
      width: 120,
      resizable: true,
    },
    {
      headerName: "값2",
      field: "value_2",
      width: 150,
      resizable: true,
    },
    {
      headerName: "값3",
      field: "value_3",
      width: 120,
      resizable: true,
    },
    {
      headerName: "비고",
      field: "remark",
      width: 200,
      resizable: true,
    },
    {
      headerName: "사용여부",
      field: "use_yn",
      width: 120,
      resizable: true,
      valueFormatter: (params: { value: string }) => {
        return params.value || "N";
      },
    },
    {
      headerName: "시스템코드유무",
      field: "syscd_yn",
      width: 150,
      resizable: true,
      valueFormatter: (params: { value: string }) => {
        return params.value || "N";
      },
    },
  ];

  // 공통코드 선택 시 상세코드 조회
  const onCommonCodeRowClicked = useCallback(
    async (event: { data: CommonCodeData }) => {
      const selectedData = event.data;
      setSelectedCommonCode(selectedData);
      setDetailCodeLoading(true);

      try {
        const response = await DetailCodeService.getDetailCodeList({
          COMMON_CODE: selectedData.common_code,
        });

        if (response.success && response.data) {
          setDetailCodeData(response.data);
          console.log("상세코드 목록 로드 성공:", response.data);
        } else {
          console.error("상세코드 목록 로드 실패:", response.error);
          setDetailCodeData([]);
        }
      } catch (error) {
        console.error("상세코드 목록 로드 실패:", error);
        setDetailCodeData([]);
      } finally {
        setDetailCodeLoading(false);
      }
    },
    []
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">상세코드 관리</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>에러:</strong> {error}
        </div>
      )}

      {!loading && commonCodeData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>성공:</strong> 공통코드 목록을 성공적으로 받았습니다. (총{" "}
          {commonCodeData.length}건)
        </div>
      )}

      {/* 좌우 그리드 레이아웃 */}
      <div className="grid grid-cols-4 gap-6 h-[600px]">
        {/* 왼쪽: 공통코드 그리드 */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">공통코드 목록</h2>
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Spinner />
              </div>
            )}
            <TestGrid
              rowData={loading ? [] : commonCodeData ?? []}
              columnDefs={commonCodeColDefs}
              gridRef={leftGridRef}
              gridOptions={{
                suppressColumnResize: false,
                suppressRowClickSelection: false,
                suppressCellFocus: false,
                headerHeight: 50,
                rowHeight: 45,
                suppressScrollOnNewData: true,
                rowSelection: "single",
                onRowClicked: onCommonCodeRowClicked,
              }}
            />
          </div>
        </div>

        {/* 오른쪽: 상세코드 그리드 */}
        <div className="col-span-3 space-y-4">
          <h2 className="text-lg font-semibold">
            상세코드 목록
            {selectedCommonCode && (
              <span className="text-sm text-gray-500 ml-2">
                ({selectedCommonCode.common_code_name})
              </span>
            )}
          </h2>
          <div className="relative">
            {detailCodeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Spinner />
              </div>
            )}
            {!selectedCommonCode ? (
              <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">공통코드를 선택해주세요</p>
                  <p className="text-sm">왼쪽 그리드에서 공통코드를 클릭하면</p>
                  <p className="text-sm">
                    해당 공통코드의 상세코드가 표시됩니다.
                  </p>
                </div>
              </div>
            ) : (
              <TestGrid
                rowData={detailCodeData}
                columnDefs={detailCodeColDefs}
                gridRef={rightGridRef}
                gridOptions={{
                  suppressColumnResize: false,
                  suppressRowClickSelection: false,
                  suppressCellFocus: false,
                  headerHeight: 50,
                  rowHeight: 45,
                  suppressScrollOnNewData: true,
                  rowSelection: "multiple",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
