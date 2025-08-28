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
  tasks: Map<string, BackgroundTask>;

  // 액션들
  addTask: (task: BackgroundTask) => void;
  updateTaskStatus: (id: string, status: string, message?: string) => void;
  removeTask: (id: string) => void;
  getTask: (id: string) => BackgroundTask | undefined;
  getAllTasks: () => BackgroundTask[];
  clearCompletedTasks: () => void;
}

export const useBackgroundTaskStore = create<BackgroundTaskState>(
  (set, get) => ({
    tasks: new Map(),

    addTask: (task: BackgroundTask) => {
      set((state) => {
        const newTasks = new Map(state.tasks);
        newTasks.set(task.id, task);
        return { tasks: newTasks };
      });
    },

    updateTaskStatus: (id: string, status: string, message?: string) => {
      set((state) => {
        const newTasks = new Map(state.tasks);
        const task = newTasks.get(id);
        if (task) {
          newTasks.set(id, {
            ...task,
            status: status as BackgroundTask["status"],
            message,
          });
        }
        return { tasks: newTasks };
      });
    },

    removeTask: (id: string) => {
      set((state) => {
        const newTasks = new Map(state.tasks);
        newTasks.delete(id);
        return { tasks: newTasks };
      });
    },

    getTask: (id: string) => {
      return get().tasks.get(id);
    },

    getAllTasks: () => {
      return Array.from(get().tasks.values());
    },

    clearCompletedTasks: () => {
      set((state) => {
        const newTasks = new Map(state.tasks);
        for (const [id, task] of newTasks.entries()) {
          if (task.status === "success" || task.status === "error") {
            newTasks.delete(id);
          }
        }
        return { tasks: newTasks };
      });
    },
  })
);
