"use client";

import { useGlobalToastStore } from "@/store/globalToastStore";
import { Toast } from "@/components/ui/Toast";

export function GlobalToastManager() {
  const { toasts, removeToast } = useGlobalToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
