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
// 기존 네트워크 파일 목록 그리드 컬럼 정의 제거
// import { networkFileUploadColDefs } from "@/features/networkFileUpload/gridConfig";
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
  // CellClickedEvent 제거 (더 이상 필요 없음)
} from "ag-grid-community";
import { NetworkFileUploadService } from "@/services/networkFileUploadService";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NodeData, LinkData, PlatformData } from "@/types/networkDetail";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function NetworkFileUploadPage() {
  // 기존 그리드 ref 제거
  // const gridRef = useRef<AgGridReact>(null);

  // 각 그리드별 ref 추가
  const nodeGridRef = useRef<AgGridReact>(null);
  const linkGridRef = useRef<AgGridReact>(null);
  const platformGridRef = useRef<AgGridReact>(null);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    // 상태
    filters,
    hasSearched,
    networkOptions,
    // 기존 상태들 제거
    // rowData,
    // detailData,
    // rawDetailData,
    // detailTitle,
    // showDetailGrid,

    // 새로운 상태들
    nodeData,
    linkData,
    platformData,
    rawNodeData,
    rawLinkData,
    rawPlatformData,

    loading,
    toast,

    // 핸들러
    handleFilterChange,
    handleSearch,
    // 기존 핸들러들 제거
    // handleNodeView,
    // handleLineView,
    // handlePlatformView,
    loadNetworkOptions,
    closeToast,
  } = useNetworkFileUpload();

  // 네트워크 목록 로드
  useEffect(() => {
    loadNetworkOptions();
  }, [loadNetworkOptions]);

  // 다운로드 파일명 생성 함수들
  const getNodeDownloadFileName = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    return `node_${currentDate}.csv`;
  };

  const getLinkDownloadFileName = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    return `link_${currentDate}.csv`;
  };

  const getPlatformDownloadFileName = () => {
    const currentDate = new Date().toISOString().split("T")[0];
    return `platform_${currentDate}.csv`;
  };

  // 각 목록별 칼럼 순서 정의 (CSV 내보내기용 - 모든 필드 포함)
  const getNodeColumnOrder = () => {
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
  };

  const getLinkColumnOrder = () => {
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
  };

  const getPlatformColumnOrder = () => {
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
  };

  // 기존 날짜 목록 추출 (중복 제거) - 네트워크 옵션에서 추출
  const existingDates = useMemo(() => {
    if (!networkOptions || networkOptions.length === 0) return [];
    return networkOptions.map((option) => option.value);
  }, [networkOptions]);

  // 네트워크 옵션이 로드되면 필터 필드 업데이트
  const updatedFields = networkFileUploadFields.map((field) => {
    if (field.name === "network") {
      return { ...field, options: networkOptions };
    }
    return field;
  });

  // 각 그리드용 하단 고정 행 데이터 (총계) - 타입 수정
  const getNodePinnedBottomRowData = (data: NodeData[]) => {
    if (!data || data.length === 0) return [];

    return [
      {
        seq: undefined,
        sta_nm: `총 ${data.length}건`,
        sta_num: undefined,
        x: undefined,
        y: undefined,
        kscc: undefined,
        subway: undefined,
        transfer: undefined,
        transfer_cd: undefined,
        open_date: undefined,
        gate_chk: undefined,
        oper: undefined,
        remarks: undefined,
        consign_oper: undefined,
        avg_stay: undefined,
        avg_stay_new: undefined,
      },
    ];
  };

  const getLinkPinnedBottomRowData = (data: LinkData[]) => {
    if (!data || data.length === 0) return [];

    return [
      {
        seq: undefined,
        from_sta_nm: undefined,
        from_sta_num: undefined,
        to_sta_nm: undefined,
        to_sta_num: undefined,
        link_cd: `총 ${data.length}건`,
        sta_pass_sec: undefined,
        trans_mv_sec: undefined,
        trans_sty_sec: undefined,
        cost: undefined,
        km: undefined,
        subway: undefined,
        open_date: undefined,
        start_x: undefined,
        start_y: undefined,
        end_x: undefined,
        end_y: undefined,
        km_g: undefined,
        km_ung: undefined,
        start_oper: undefined,
        end_oper: undefined,
        geom: undefined,
        direction: undefined,
        oper: undefined,
        oper_line: undefined,
        consign_oper: undefined,
        elev_tot: undefined,
        elev_ung: undefined,
        elev: undefined,
        elev_g: undefined,
      },
    ];
  };

  const getPlatformPinnedBottomRowData = (data: PlatformData[]) => {
    if (!data || data.length === 0) return [];

    return [
      {
        seq: undefined,
        link_seq: undefined,
        link_cd: `총 ${data.length}건`,
        from_sta_nm: undefined,
        from_dic: undefined,
        from_dic_sub: undefined,
        from_sta_num: undefined,
        to_sta_nm: undefined,
        to_dic: undefined,
        to_dic_sub: undefined,
        to_sta_num: undefined,
        tot_mv_m: undefined,
        tot_mv_sec: undefined,
        flat_mv_m: undefined,
        tot_step_up: undefined,
        tot_step_down: undefined,
        only_step_up: undefined,
        only_step_up_m: undefined,
        only_step_down: undefined,
        only_step_down_m: undefined,
        step_esc_up_step: undefined,
        step_esc_up_yn: undefined,
        step_esc_up_m: undefined,
        step_esc_down_step: undefined,
        step_esc_down_yn: undefined,
        step_esc_down_m: undefined,
        only_esc_up_yn: undefined,
        only_esc_up_m: undefined,
        only_esc_down_yn: undefined,
        only_esc_down_m: undefined,
        tot_sty_sec: undefined,
        trans_cnt: undefined,
      },
    ];
  };

  // 상세 그리드용 하단 고정 행 스타일
  const getDetailRowStyle = (params: { node: { rowPinned?: string } }) => {
    if (params.node.rowPinned === "bottom") {
      return {
        backgroundColor: "#f8fafc",
        fontWeight: "bold",
        borderTop: "2px solid #e2e8f0",
      };
    }
    return {};
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
    <ProtectedRoute requiredPath="/network/file-upload">
      <div className="relative">
        {/* 전체 페이지 로딩 스피너 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <div className="text-center">
              <Spinner />
              <p className="mt-4 text-gray-600">
                네트워크 정보를 불러오는 중...
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">네트워크 파일등록</h1>

          {/* 필터폼을 상대 위치로 감싸고 등록 버튼을 절대 위치로 배치 */}
          <div className="relative">
            <FilterForm
              fields={updatedFields}
              defaultValues={filters}
              schema={networkFileUploadSchema}
              values={filters}
              onChange={handleFilterChange}
              onSearch={handleSearch}
            />

            {/* 네트워크 파일 등록 버튼을 필터폼 내부 오른쪽에 절대 위치로 배치 */}
            <div className="absolute top-4 left-96">
              <Button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                네트워크 파일 등록
              </Button>
            </div>
          </div>

          {/* 등록 버튼 */}
          <div className="space-y-4">
            {/* 조회 결과가 없을 때 안내 메시지 */}
            {!hasSearched && !loading && (
              <div className="bg-gray-50 flex flex-col justify-center items-center h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-16">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">조회 결과</p>
                  <p className="text-sm">
                    네트워크를 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 노드 그리드 영역 */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">노드 목록</h2>
                <div className="flex justify-end">
                  <RawDataCsvExportButton
                    fileName={getNodeDownloadFileName()}
                    className="bg-green-500 hover:bg-green-600"
                    columnOrder={getNodeColumnOrder()}
                    rawData={rawNodeData}
                  />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <TestGrid
                  rowData={nodeData}
                  columnDefs={nodeColDefs}
                  gridRef={nodeGridRef}
                  height={300}
                  gridOptions={{
                    pinnedBottomRowData: getNodePinnedBottomRowData(nodeData),
                    getRowStyle: getDetailRowStyle,
                  }}
                />
              </div>
            </div>
          )}

          {/* 링크 그리드 영역 */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">링크 목록</h2>
                <div className="flex justify-end">
                  <RawDataCsvExportButton
                    fileName={getLinkDownloadFileName()}
                    className="bg-green-500 hover:bg-green-600"
                    columnOrder={getLinkColumnOrder()}
                    rawData={rawLinkData}
                  />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <TestGrid
                  rowData={linkData}
                  columnDefs={linkColDefs}
                  gridRef={linkGridRef}
                  height={300}
                  gridOptions={{
                    pinnedBottomRowData: getLinkPinnedBottomRowData(linkData),
                    getRowStyle: getDetailRowStyle,
                  }}
                />
              </div>
            </div>
          )}

          {/* 플랫폼 그리드 영역 */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold">플랫폼 목록</h2>
                <div className="flex justify-end">
                  <RawDataCsvExportButton
                    fileName={getPlatformDownloadFileName()}
                    className="bg-green-500 hover:bg-green-600"
                    columnOrder={getPlatformColumnOrder()}
                    rawData={rawPlatformData}
                  />
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <TestGrid
                  rowData={platformData}
                  columnDefs={platformColDefs}
                  gridRef={platformGridRef}
                  height={300}
                  gridOptions={{
                    pinnedBottomRowData:
                      getPlatformPinnedBottomRowData(platformData),
                    getRowStyle: getDetailRowStyle,
                  }}
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
    </ProtectedRoute>
  );
}
