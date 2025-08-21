import React from "react";
import { Button } from "@/components/ui/button";

interface MockSettlementConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: "등록" | "조회" | "모달 열기";
}

export function MockSettlementConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  actionType,
}: MockSettlementConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center"
      style={{ zIndex: 9999, pointerEvents: "auto" }}>
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        style={{ pointerEvents: "auto" }}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            모의정산이 실행 중입니다
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            현재 백엔드에서 모의정산이 실행 중입니다.
            {actionType}을 진행하려면 실행 중인 모의정산을 종료해야 합니다.
            <br />
            <br />
            실행 중인 모의정산을 종료하고{" "}
            {actionType === "모달 열기" ? "등록 모달을 열" : actionType}을
            진행하시겠습니까?
          </p>

          <div className="flex gap-3 justify-center">
            <Button onClick={onClose} variant="outline" className="px-4 py-2">
              아니오
            </Button>
            <Button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700">
              예, 종료하고{" "}
              {actionType === "모달 열기" ? "모달 열기" : actionType}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
