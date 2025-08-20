"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import RawDataCsvExportButton from "@/components/RawDataCsvExportButton";
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
import { NetworkFileUploadModal } from "@/components/NetworkFileUploadModal";
import TestGrid from "@/components/TestGrid";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  CellClickedEvent,
} from "ag-grid-community";
import { NetworkFileUploadService } from "@/services/networkFileUploadService";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function NetworkFileUploadPage() {
  const gridRef = useRef<AgGridReact>(null);
  const detailGridRef = useRef<AgGridReact>(null);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    // 상태
    filters,
    hasSearched,
    networkOptions,
    rowData,
    detailData,
    rawDetailData, // 원본 API 데이터 추가
    detailTitle,
    showDetailGrid,
    loading,
    toast,

    // 핸들러
    handleFilterChange,
    handleSearch,
    handleNodeView,
    handleLineView,
    handlePlatformView,
    loadNetworkOptions,
    closeToast,
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

  // 다운로드 파일명 생성
  const getDownloadFileName = () => {
    if (!showDetailGrid || !detailTitle) return "data.csv";

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
    const type = detailTitle.includes("노드")
      ? "node"
      : detailTitle.includes("링크")
      ? "link"
      : detailTitle.includes("플랫폼")
      ? "platform"
      : "data";

    return `${type}_${currentDate}.csv`;
  };

  // 각 목록별 칼럼 순서 정의 (CSV 내보내기용 - 모든 필드 포함)
  const getColumnOrder = () => {
    if (detailTitle === "노드 목록") {
      return [
        "seq",
        "sta_nm",
        "sta_num",
        "x",
        "y",
        "kscc",
        "subway",
        "transfer",
        "transfer_cd",
        "open_date",
        "gate_chk",
        "oper",
        "remarks",
        "consign_oper",
        "avg_stay",
        "avg_stay_new",
      ];
    } else if (detailTitle === "링크 목록") {
      return [
        "seq",
        "from_sta_nm",
        "from_sta_num",
        "to_sta_nm",
        "to_sta_num",
        "link_cd",
        "sta_pass_sec",
        "trans_mv_sec",
        "trans_sty_sec",
        "cost",
        "km",
        "subway",
        "open_date",
        "start_x",
        "start_y",
        "end_x",
        "end_y",
        "km_g",
        "km_ung",
        "start_oper",
        "end_oper",
        "geom",
        "direction",
        "oper",
        "oper_line",
        "consign_oper",
        "elev_tot",
        "elev_ung",
        "elev",
        "elev_g",
      ];
    } else if (detailTitle === "플랫폼 목록") {
      return [
        "seq",
        "link_seq",
        "link_cd",
        "from_sta_nm",
        "from_dic",
        "from_dic_sub",
        "from_sta_num",
        "to_sta_nm",
        "to_dic",
        "to_dic_sub",
        "to_sta_num",
        "tot_mv_m",
        "tot_mv_sec",
        "flat_mv_m",
        "tot_step_up",
        "tot_step_down",
        "only_step_up",
        "only_step_up_m",
        "only_step_down",
        "only_step_down_m",
        "step_esc_up_step",
        "step_esc_up_yn",
        "step_esc_up_m",
        "step_esc_down_step",
        "step_esc_down_yn",
        "step_esc_down_m",
        "only_esc_up_yn",
        "only_esc_up_m",
        "only_esc_down_yn",
        "only_esc_down_m",
        "tot_sty_sec",
        "trans_cnt",
      ];
    }
    return [];
  };

  // 기존 날짜 목록 추출 (중복 제거)
  const existingDates = useMemo(() => {
    if (!rowData || rowData.length === 0) return [];
    const dates = rowData.map((item) => item.net_dt).filter(Boolean);
    return [...new Set(dates)]; // 중복 제거
  }, [rowData]);

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

  // 모달 핸들러
  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (data: {
    networkName: string;
    date: string;
    nodeFile: File;
    linkFile: File;
    platformFile: File;
  }) => {
    setModalLoading(true);
    try {
      console.log("네트워크 파일 등록 시작:", data);

      const response = await NetworkFileUploadService.uploadNetworkFiles(data);
      console.log(response);
      if (response.success === true) {
        alert("네트워크 파일 등록이 완료되었습니다.");
        setIsModalOpen(false);
        // 등록 후 목록 새로고침
        if (hasSearched) {
          handleSearch(filters);
        }
      } else {
        // 외부 API에서 message 필드로 에러 메시지를 보내므로 message 사용
        const errorMessage =
          (response as { message?: string }).message ||
          response.error ||
          "등록에 실패했습니다.";
        alert(`등록 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error("네트워크 파일 등록 실패:", error);
      alert(`등록 중 오류가 발생했습니다., ${error}`);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 전체 페이지 로딩 스피너 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">네트워크 정보를 불러오는 중...</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">네트워크 파일등록</h1>

        <FilterForm
          fields={updatedFields}
          defaultValues={filters}
          schema={networkFileUploadSchema}
          values={filters}
          onChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {/* 등록 버튼 */}
        <div className="flex justify-end">
          <Button onClick={handleAddClick}>등록</Button>
        </div>

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

          {!hasSearched && !loading && (
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

        {/* CSV Export 버튼을 상단 그리드와 하단 그리드 사이에 배치 */}
        {showDetailGrid && (
          <div className="flex justify-end">
            <RawDataCsvExportButton
              fileName={getDownloadFileName()}
              className="bg-green-500 hover:bg-green-600"
              columnOrder={getColumnOrder()}
              rawData={rawDetailData}
            />
          </div>
        )}

        {/* 상세 그리드 영역 */}
        {showDetailGrid && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{detailTitle}</h2>
            <div className="rounded-lg overflow-hidden">
              <TestGrid
                rowData={detailData}
                columnDefs={getDetailColDefs()}
                gridRef={detailGridRef}
                height={300}
              />
            </div>
          </div>
        )}

        {/* 네트워크 파일 등록 모달 */}
        <NetworkFileUploadModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          loading={modalLoading}
          existingDates={existingDates}
        />

        {/* 토스트 알림 */}
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      </div>
    </div>
  );
}
