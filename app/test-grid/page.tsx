"use client";
import TestGrid from "@/app/components/TestGrid";
import Spinner from "@/app/components/Spinner";
import {
  AllCommunityModule,
  ModuleRegistry,
  ValueGetterParams,
} from "ag-grid-community";
import { useApi } from "../hooks/useApi";
import { PayRecvService, PayRecvOperData } from "../services/payRecvService";
import { useCallback } from "react";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function TestGridPage() {
  // apiCall 함수를 메모이제이션
  const apiCall = useCallback(
    () => PayRecvService.getOperList({ oper_id: "test" }),
    []
  );

  // 콜백 함수들도 메모이제이션
  const onSuccess = useCallback((data: PayRecvOperData[]) => {
    console.log("데이터 로드 성공:", data);
  }, []);

  const onError = useCallback((error: string) => {
    console.error("데이터 로드 실패:", error);
  }, []);

  const {
    data: apiData,
    error,
    loading,
  } = useApi<PayRecvOperData[]>(apiCall, {
    autoFetch: true,
    onSuccess,
    onError,
  });

  const colDefs = [
    {
      headerName: "#",
      valueGetter: (params: ValueGetterParams) =>
        params.node?.rowPinned ? "Total" : (params.node?.rowIndex ?? 0) + 1,
      width: 60,
      pinned: "left",
    },
    { headerName: "기관", field: "pay_oper" },
    { headerName: "용인경전철", field: "용인경전철" },
    { headerName: "공항철도", field: "공항철도" },
    { headerName: "새서울철도", field: "새서울철도" },
    { headerName: "인천교통공사", field: "인천교통공사" },
    { headerName: "서울시메트로9호선", field: "서울시메트로9호선" },
    { headerName: "의정부경전철", field: "의정부경전철" },
    { headerName: "서울교통공사", field: "서울교통공사" },
    { headerName: "김포시청", field: "김포시청" },
    { headerName: "한국철도공사", field: "한국철도공사" },
    { headerName: "우이신설경전철", field: "우이신설경전철" },
    { headerName: "신림선", field: "신림선" },
    { headerName: "신분당선", field: "신분당선" },
    { headerName: "경기철도", field: "경기철도" },
  ];

  return (
    <div>
      <h1>테스트 그리드 페이지</h1>

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>로딩 중...</strong> 데이터를 가져오는 중입니다.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>에러:</strong> {error}
        </div>
      )}

      {apiData && !loading && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>성공:</strong> API 데이터를 성공적으로 받았습니다.
        </div>
      )}

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Spinner />
          </div>
        )}
        <TestGrid rowData={loading ? null : apiData} columnDefs={colDefs} />
      </div>
    </div>
  );
}
