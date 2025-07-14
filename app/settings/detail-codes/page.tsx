"use client";

import { useState, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/useApi";
import { CommonCodeService } from "@/services/commonCodeService";
import { DetailCodeService } from "@/services/detailCodeService";
import { CommonCodeData } from "@/types/commonCode";
import { DetailCodeData, DetailCodeFormData } from "@/types/detailCode";
import { DetailCodeModal } from "@/components/DetailCodeModal";
import { validateDetailCodeDeletion } from "@/utils/validation";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettingsDetailCodesPage() {
  const leftGridRef = useRef<AgGridReact>(null);
  const rightGridRef = useRef<AgGridReact>(null);
  const [selectedCommonCode, setSelectedCommonCode] =
    useState<CommonCodeData | null>(null);
  const [selectedDetailCodes, setSelectedDetailCodes] = useState<
    DetailCodeData[]
  >([]);
  const [detailCodeData, setDetailCodeData] = useState<DetailCodeData[]>([]);
  const [detailCodeLoading, setDetailCodeLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingData, setEditingData] = useState<
    DetailCodeFormData | undefined
  >();
  const [modalLoading, setModalLoading] = useState(false);

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

  // 공통코드 목록 API 호출
  const apiCall = useCallback(() => CommonCodeService.getCommonCodeList(), []);

  const onSuccess = useCallback((data: CommonCodeData[]) => {
    console.log("공통코드 목록 로드 성공:", data);
    setToast({
      isVisible: true,
      message: `공통코드 목록을 성공적으로 받았습니다. (총 ${data.length}건)`,
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("공통코드 목록 로드 실패:", error);
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const { data: commonCodeData, loading } = useApi<CommonCodeData[]>(apiCall, {
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
      width: 200,
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

  // 상세코드 선택 변경
  const onDetailCodeSelectionChanged = useCallback(() => {
    if (rightGridRef.current) {
      const selectedNodes = rightGridRef.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map(
        (node: { data: DetailCodeData }) => node.data
      );
      setSelectedDetailCodes(selectedData);
    }
  }, []);

  // 상세코드 더블클릭 시 수정 모달
  const onDetailCodeRowDoubleClicked = useCallback(
    (event: { data: DetailCodeData }) => {
      const data = event.data;

      // syscd_yn이 Y인 경우 수정 불가
      if (data.syscd_yn === "Y") {
        alert("시스템 코드는 수정할 수 없습니다.");
        return;
      }

      setEditingData({
        DETAIL_CODE: data.detail_code,
        COMMON_CODE: data.common_code,
        VALUE_1: data.value_1 || "",
        VALUE_2: data.value_2 || "",
        VALUE_3: data.value_3 || "",
        REMARK: data.remark || "",
        USE_YN: data.use_yn || "N",
        SYSCD_YN: data.syscd_yn || "N",
      });
      setModalMode("edit");
      setIsModalOpen(true);
    },
    []
  );

  // 모달 핸들러
  const handleAddClick = useCallback(() => {
    if (!selectedCommonCode) {
      alert("공통코드를 먼저 선택해주세요.");
      return;
    }

    setEditingData(undefined);
    setModalMode("add");
    setIsModalOpen(true);
  }, [selectedCommonCode]);

  const handleDeleteClick = useCallback(async () => {
    if (selectedDetailCodes.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (selectedDetailCodes.length > 1) {
      alert("한 번에 하나의 항목만 삭제할 수 있습니다.");
      return;
    }

    const selectedRow = selectedDetailCodes[0];

    // 삭제 가능 여부 검증
    const validation = validateDetailCodeDeletion(selectedRow);

    if (!validation.canDelete) {
      alert(validation.reason);
      return;
    }

    if (!confirm(`"${selectedRow.detail_code}" 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await DetailCodeService.deleteDetailCode({
        DETAIL_CODE: selectedRow.detail_code,
        COMMON_CODE: selectedRow.common_code,
      });
      alert("삭제가 완료되었습니다.");
      // 상세코드 목록 새로고침
      if (selectedCommonCode) {
        const response = await DetailCodeService.getDetailCodeList({
          COMMON_CODE: selectedCommonCode.common_code,
        });
        if (response.success && response.data) {
          setDetailCodeData(response.data);
        }
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }, [selectedDetailCodes, selectedCommonCode]);

  const handleModalSubmit = useCallback(
    async (data: DetailCodeFormData) => {
      setModalLoading(true);
      try {
        if (modalMode === "add") {
          await DetailCodeService.addDetailCode(data);
          alert("등록이 완료되었습니다.");
        } else {
          await DetailCodeService.updateDetailCode(data);
          alert("수정이 완료되었습니다.");
        }
        setIsModalOpen(false);

        // 상세코드 목록 새로고침
        if (selectedCommonCode) {
          const response = await DetailCodeService.getDetailCodeList({
            COMMON_CODE: selectedCommonCode.common_code,
          });
          if (response.success && response.data) {
            setDetailCodeData(response.data);
          }
        }
      } catch (error) {
        console.error("처리 실패:", error);
        alert("처리 중 오류가 발생했습니다.");
      } finally {
        setModalLoading(false);
      }
    },
    [modalMode, selectedCommonCode]
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingData(undefined);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">상세코드 관리</h1>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleAddClick}
          disabled={!selectedCommonCode}
          className="bg-blue-500 hover:bg-blue-600">
          추가
        </Button>
        <Button
          onClick={handleDeleteClick}
          disabled={selectedDetailCodes.length === 0}
          className="bg-red-500 hover:bg-red-600">
          삭제
        </Button>
      </div>

      {/* 좌우 그리드 레이아웃 */}
      <div className="grid grid-cols-4 gap-6 h-[600px]">
        {/* 왼쪽: 공통코드 그리드 */}
        <div className="col-span-1 flex flex-col h-full">
          <h2 className="text-lg font-semibold">공통코드 목록</h2>
          <div className="relative flex-1 h-full">
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
        <div className="col-span-3 flex flex-col h-full">
          <h2 className="text-lg font-semibold">
            상세코드 목록
            {selectedCommonCode && (
              <span className="text-sm text-gray-500 ml-2">
                ({selectedCommonCode.common_code_name})
              </span>
            )}
          </h2>
          <div className="relative flex-1 h-full">
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
                  onRowDoubleClicked: onDetailCodeRowDoubleClicked,
                  onSelectionChanged: onDetailCodeSelectionChanged,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 모달 */}
      <DetailCodeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingData}
        mode={modalMode}
        loading={modalLoading}
        selectedCommonCode={selectedCommonCode?.common_code}
      />

      {/* 토스트 알림 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
