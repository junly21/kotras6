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
import { CommonCodeData, CommonCodeFormData } from "@/types/commonCode";
import { CommonCodeModal } from "@/components/CommonCodeModal";
import { validateCommonCodeDeletion } from "@/utils/validation";
import ProtectedRoute from "@/components/ProtectedRoute";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettingsCommonCodesPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [selectedRows, setSelectedRows] = useState<CommonCodeData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingData, setEditingData] = useState<
    CommonCodeFormData | undefined
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

  const {
    data: apiData,
    loading,
    refetch,
  } = useApi<CommonCodeData[]>(apiCall, {
    autoFetch: true,
    onSuccess,
    onError,
  });

  // 컬럼 정의
  const colDefs = [
    {
      headerName: "공통코드",
      field: "common_code",
      minWidth: 150,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "공통코드명",
      field: "common_code_name",
      minWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "시스템코드유무",
      field: "syscd_yn",
      minWidth: 180,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: string }) => {
        return params.value || "N";
      },
    },
    {
      headerName: "값1",
      field: "value_1",
      minWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "값2",
      field: "value_2",
      minWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "값3",
      field: "value_3",
      minWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "비고",
      field: "remark",
      minWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      headerName: "사용여부",
      field: "use_yn",
      minWidth: 180,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: string }) => {
        return params.value || "N";
      },
    },
  ];

  // 그리드 이벤트 핸들러
  const onRowDoubleClicked = useCallback((event: { data: CommonCodeData }) => {
    const data = event.data;

    // syscd_yn이 Y인 경우 수정 불가
    if (data.syscd_yn === "Y") {
      alert("시스템 코드는 수정할 수 없습니다.");
      return;
    }

    setEditingData({
      COMMON_CODE: data.common_code,
      COMMON_CODE_NAME: data.common_code_name,
      VALUE_1: data.value_1 || "",
      VALUE_2: data.value_2 || "",
      VALUE_3: data.value_3 || "",
      REMARK: data.remark || "",
      USE_YN: data.use_yn || "N",
      SYSCD_YN: data.syscd_yn || "N",
    });
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const onSelectionChanged = useCallback(() => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map(
        (node: { data: CommonCodeData }) => node.data
      );
      setSelectedRows(selectedData);
    }
  }, []);

  // 모달 핸들러
  const handleAddClick = useCallback(() => {
    setEditingData(undefined);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async () => {
    if (selectedRows.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (selectedRows.length > 1) {
      alert("한 번에 하나의 항목만 삭제할 수 있습니다.");
      return;
    }

    const selectedRow = selectedRows[0];

    try {
      // 상세코드 존재 여부 확인
      const detailCodeResponse = await CommonCodeService.checkDetailCodesExist(
        selectedRow.common_code
      );

      if (detailCodeResponse.success && detailCodeResponse.data) {
        const { hasDetailCodes } = detailCodeResponse.data;

        // 삭제 가능 여부 검증
        const validation = validateCommonCodeDeletion(
          selectedRow,
          hasDetailCodes
        );

        if (!validation.canDelete) {
          alert(validation.reason);
          return;
        }
      } else {
        console.error("상세코드 존재 여부 확인 실패");
        alert("상세코드 존재 여부를 확인할 수 없습니다.");
        return;
      }

      if (
        !confirm(
          `"${
            selectedRow.common_code_name || selectedRow.common_code
          }" 항목을 삭제하시겠습니까?`
        )
      ) {
        return;
      }

      await CommonCodeService.deleteCommonCode({
        COMMON_CODE: selectedRow.common_code,
      });
      alert("삭제가 완료되었습니다.");
      refetch();
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }, [selectedRows, refetch]);

  const handleModalSubmit = useCallback(
    async (data: CommonCodeFormData) => {
      setModalLoading(true);
      try {
        if (modalMode === "add") {
          await CommonCodeService.addCommonCode(data);
          alert("등록이 완료되었습니다.");
        } else {
          await CommonCodeService.updateCommonCode(data);
          alert("수정이 완료되었습니다.");
        }
        setIsModalOpen(false);
        refetch();
      } catch (error) {
        console.error("처리 실패:", error);
        alert("처리 중 오류가 발생했습니다.");
      } finally {
        setModalLoading(false);
      }
    },
    [modalMode, refetch]
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingData(undefined);
  }, []);

  return (
    <ProtectedRoute requiredPath="/settings/common-codes">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">공통코드 관리</h1>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleAddClick}
            className="bg-blue-500 hover:bg-blue-600">
            추가
          </Button>
          <Button
            onClick={handleDeleteClick}
            disabled={selectedRows.length === 0}
            className="bg-red-500 hover:bg-red-600">
            삭제
          </Button>
        </div>

        {/* 그리드 */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Spinner />
            </div>
          )}
          <TestGrid
            rowData={loading ? [] : apiData ?? []}
            columnDefs={colDefs}
            gridRef={gridRef}
            height={600}
            gridOptions={{
              suppressColumnResize: false,
              suppressRowClickSelection: false,
              suppressCellFocus: false,
              headerHeight: 50,
              rowHeight: 35,
              suppressScrollOnNewData: true,
              rowSelection: "multiple",
              onRowDoubleClicked: onRowDoubleClicked,
              onSelectionChanged: onSelectionChanged,
            }}
          />
        </div>

        {/* 모달 */}
        <CommonCodeModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialData={editingData}
          mode={modalMode}
          loading={modalLoading}
          existingCodes={apiData?.map((code) => code.common_code) || []}
        />

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
