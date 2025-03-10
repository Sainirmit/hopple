"use client";

import { useState, createContext, useContext } from "react";

type ToastVariant = "default" | "destructive";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-sm">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-md bg-white shadow-lg border ${
                toast.variant === "destructive"
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`font-medium ${
                      toast.variant === "destructive" ? "text-red-600" : ""
                    }`}
                  >
                    {toast.title}
                  </h3>
                  {toast.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toast = (props: Omit<Toast, "id">) => {
    context.addToast(props);
  };

  return { toast, dismiss: context.removeToast };
}
