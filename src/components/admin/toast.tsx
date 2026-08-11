"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "loading" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let _addToast: ((msg: string, type: ToastType) => number) | null = null;
let _removeToast: ((id: number) => void) | null = null;

let _nextId = 1;

export function toast(message: string, type: ToastType = "info"): number {
  if (_addToast) return _addToast(message, type);
  return 0;
}

export function dismissToast(id: number) {
  if (_removeToast) _removeToast(id);
}

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  loading: "⟳",
  info: "ℹ",
};

const STYLES: Record<ToastType, string> = {
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/60 dark:text-green-200",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200",
  loading:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
  info: "border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType): number => {
    const id = _nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }
    return id;
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    _addToast = addToast;
    _removeToast = removeToast;
    return () => {
      _addToast = null;
      _removeToast = null;
    };
  });

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${STYLES[t.type]}`}
        >
          <span
            className={`mt-0.5 flex-shrink-0 text-base ${t.type === "loading" ? "animate-spin" : ""}`}
          >
            {ICONS[t.type]}
          </span>
          <p className="flex-1">{t.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => removeToast(t.id)}
            className="ml-2 flex-shrink-0 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
