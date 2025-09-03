"use client";

import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { useEffect, useState } from "react";

export function BackgroundTaskStatus() {
  const [isVisible, setIsVisible] = useState(false);

  // 현재 작업 가져오기 (스토어에서 직접 구독)
  const currentTask = useBackgroundTaskStore((state) => state.currentTask);
  const clearCurrentTask = useBackgroundTaskStore(
    (state) => state.clearCurrentTask
  );

  // 작업이 있으면 자동으로 표시
  useEffect(() => {
    setIsVisible(!!currentTask);
  }, [currentTask]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9998] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          모의정산 등록 상태
        </h3>
        <button
          onClick={clearCurrentTask}
          className="text-xs text-gray-500 hover:text-gray-700">
          X
        </button>
      </div>

      <div className="space-y-2">
        {currentTask && (
          <div
            className={`flex items-center space-x-2 p-2 rounded ${
              currentTask.status === "pending" ||
              currentTask.status === "processing"
                ? "bg-blue-50"
                : currentTask.status === "success"
                ? "bg-green-50"
                : "bg-red-50"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                currentTask.status === "pending" ||
                currentTask.status === "processing"
                  ? "bg-blue-500 animate-pulse"
                  : currentTask.status === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}></div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  currentTask.status === "pending" ||
                  currentTask.status === "processing"
                    ? "text-blue-700"
                    : currentTask.status === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}>
                모의정산 등록
              </p>
              <p
                className={`text-xs truncate ${
                  currentTask.status === "pending" ||
                  currentTask.status === "processing"
                    ? "text-blue-600"
                    : currentTask.status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                {currentTask.status === "pending"
                  ? "진행 중..."
                  : currentTask.status === "processing"
                  ? "진행 중..."
                  : currentTask.status === "success"
                  ? "완료됨"
                  : "실패함"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
