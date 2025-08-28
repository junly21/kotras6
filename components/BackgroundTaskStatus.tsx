"use client";

import { useBackgroundTaskStore } from "@/store/backgroundTaskStore";
import { useEffect, useState } from "react";

export function BackgroundTaskStatus() {
  const { getAllTasks, clearCompletedTasks } = useBackgroundTaskStore();
  const [isVisible, setIsVisible] = useState(false);

  // 진행 중인 작업이 있는지 확인
  const activeTasks = getAllTasks().filter(
    (task) => task.status === "pending" || task.status === "processing"
  );

  // 완료된 작업이 있는지 확인
  const completedTasks = getAllTasks().filter(
    (task) => task.status === "success" || task.status === "error"
  );

  // 진행 중인 작업이 있으면 자동으로 표시
  useEffect(() => {
    setIsVisible(activeTasks.length > 0 || completedTasks.length > 0);
  }, [activeTasks.length, completedTasks.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9998] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">백그라운드 작업</h3>
        {completedTasks.length > 0 && (
          <button
            onClick={clearCompletedTasks}
            className="text-xs text-gray-500 hover:text-gray-700">
            완료된 작업 정리
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {/* 진행 중인 작업 */}
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-700 font-medium truncate">
                {task.type === "mockSettlementRegister"
                  ? "모의정산 등록"
                  : task.type}
              </p>
              <p className="text-xs text-blue-600 truncate">
                {task.message || "진행 중..."}
              </p>
            </div>
          </div>
        ))}

        {/* 완료된 작업 */}
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center space-x-2 p-2 rounded ${
              task.status === "success" ? "bg-green-50" : "bg-red-50"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                task.status === "success" ? "bg-green-500" : "bg-red-500"
              }`}></div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium truncate ${
                  task.status === "success" ? "text-green-700" : "text-red-700"
                }`}>
                {task.type === "mockSettlementRegister"
                  ? "모의정산 등록"
                  : task.type}
              </p>
              <p
                className={`text-xs truncate ${
                  task.status === "success" ? "text-green-600" : "text-red-600"
                }`}>
                {task.message ||
                  (task.status === "success" ? "완료됨" : "실패함")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
