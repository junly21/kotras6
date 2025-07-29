"use client";

import React, { useEffect, useRef } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import {
  networkFileUploadFields,
  networkFileUploadSchema,
} from "@/features/networkFileUpload/filterConfig";
import { networkFileUploadColDefs } from "@/features/networkFileUpload/gridConfig";
import {
  nodeColDefs,
  linkColDefs,
  platformColDefs,
} from "@/features/networkFileUpload/detailGridConfig";
import { useNetworkFileUpload } from "@/hooks/useNetworkFileUpload";
import TestGrid from "@/components/TestGrid";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  CellClickedEvent,
} from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function NetworkFileUploadPage() {
  const gridRef = useRef<AgGridReact>(null);
  const detailGridRef = useRef<AgGridReact>(null);

  const {
    // 상태
    filters,
    hasSearched,
    networkOptions,
    rowData,
    detailData,
    detailTitle,
    showDetailGrid,
    toast,

    // 핸들러
    handleFilterChange,
    handleSearch,
    handleNodeView,
    handleLineView,
    handlePlatformView,
    loadNetworkOptions,
    closeToast,
    closeDetailGrid,
  } = useNetworkFileUpload();

  // 네트워크 목록 로드
  useEffect(() => {
    loadNetworkOptions();
  }, [loadNetworkOptions]);

  // 상세 그리드 컬럼 정의 선택
  const getDetailColDefs = () => {
    if (detailTitle === "노드 목록") return nodeColDefs;
    if (detailTitle === "링크 목록") return linkColDefs;
    if (detailTitle === "플랫폼 목록") return platformColDefs;
    return [];
  };

  // 네트워크 옵션이 로드되면 필터 필드 업데이트
  const updatedFields = networkFileUploadFields.map((field) => {
    if (field.name === "network") {
      return { ...field, options: networkOptions };
    }
    return field;
  });

  // ag-Grid 컨텍스트 설정
  const gridOptions = {
    context: {
      onNodeView: handleNodeView,
      onLineView: handleLineView,
      onPlatformView: handlePlatformView,
    },
    onCellClicked: (params: CellClickedEvent) => {
      const { column, data } = params;
      if (!data) return;

      // 컬럼에 따라 다른 핸들러 호출
      switch (column.getColId()) {
        case "노드":
          handleNodeView(data.net_dt);
          break;
        case "링크":
          handleLineView(data.net_dt);
          break;
        case "플랫폼":
          handlePlatformView(data.net_dt);
          break;
      }
    },
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">네트워크 파일등록</h1>

      <FilterForm
        fields={updatedFields}
        defaultValues={{ network: "" }}
        schema={networkFileUploadSchema}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">네트워크 파일 목록</h2>
        {/* 결과 영역 */}
        {hasSearched && (
          <TestGrid
            rowData={rowData}
            columnDefs={networkFileUploadColDefs}
            gridRef={gridRef}
            gridOptions={gridOptions}
            height={200}
          />
        )}

        {!hasSearched && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-16">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">조회 결과</p>
              <p className="text-sm">
                네트워크를 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 상세 그리드 영역 */}
      {showDetailGrid && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{detailTitle}</h2>
            <button
              onClick={closeDetailGrid}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
              닫기
            </button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <TestGrid
              rowData={detailData}
              columnDefs={getDetailColDefs()}
              gridRef={detailGridRef}
              height={300}
            />
          </div>
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
