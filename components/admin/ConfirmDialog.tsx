// components/admin/ConfirmDialog.tsx
"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-1.5 ${danger ? "bg-red-50" : "bg-gray-100"}`}
            >
              <AlertTriangle
                size={16}
                className={danger ? "text-red-600" : "text-gray-600"}
              />
            </div>
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-5 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {isLoading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
