import { create } from "zustand";
import { MockSettlementRegisterFormData } from "@/types/mockSettlementRegister";

export interface BackgroundTask {
  id: string;
  type: "mockSettlementRegister";
  status: "pending" | "processing" | "success" | "error";
  startTime: number;
  message?: string;
  data: MockSettlementRegisterFormData;
}

interface BackgroundTaskState {
  currentTask: BackgroundTask | null;

  // 액션들
  setCurrentTask: (task: BackgroundTask | null) => void;
  updateTaskStatus: (status: string, message?: string) => void;
  clearCurrentTask: () => void;
  getCurrentTask: () => BackgroundTask | null;
}

export const useBackgroundTaskStore = create<BackgroundTaskState>(
  (set, get) => ({
    currentTask: null,

    setCurrentTask: (task: BackgroundTask | null) => {
      console.log("setCurrentTask 호출됨:", task);
      set({ currentTask: task });

      // localStorage에 직접 저장/삭제
      if (task) {
        localStorage.setItem("mock-settlement-task", JSON.stringify(task));
        console.log("localStorage에 작업 저장됨");
      } else {
        localStorage.removeItem("mock-settlement-task");
        console.log("localStorage에서 작업 삭제됨");
      }
    },

    updateTaskStatus: (status: string, message?: string) => {
      const currentTask = get().currentTask;
      if (currentTask) {
        const updatedTask = {
          ...currentTask,
          status: status as BackgroundTask["status"],
          message,
        };
        set({ currentTask: updatedTask });

        // localStorage 업데이트
        localStorage.setItem(
          "mock-settlement-task",
          JSON.stringify(updatedTask)
        );
      }
    },

    clearCurrentTask: () => {
      set({ currentTask: null });
      localStorage.removeItem("mock-settlement-task");
    },

    getCurrentTask: () => {
      return get().currentTask;
    },
  })
);
