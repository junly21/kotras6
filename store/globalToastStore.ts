import { create } from "zustand";

export interface GlobalToast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration: number;
  timestamp: number;
}

interface GlobalToastState {
  toasts: GlobalToast[];

  // 액션들
  showToast: (toast: Omit<GlobalToast, "id" | "timestamp">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useGlobalToastStore = create<GlobalToastState>((set, get) => ({
  toasts: [],

  showToast: (toast: Omit<GlobalToast, "id" | "timestamp">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: GlobalToast = {
      ...toast,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동으로 토스트 제거
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));
