// components/admin/ModalProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface AlertOptions {
  title?: string;
  message: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;
type AlertFn = (options: AlertOptions | string) => Promise<void>;

interface ModalContextValue {
  confirm: ConfirmFn;
  alertDialog: AlertFn;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

function AlertModal({
  open,
  title,
  message,
  danger,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  danger: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-1.5 ${danger ? "bg-red-50" : "bg-gray-100"}`}
            >
              {danger ? (
                <AlertTriangle size={16} className="text-red-600" />
              ) : (
                <Info size={16} className="text-gray-600" />
              )}
            </div>
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-5 whitespace-pre-line text-sm text-gray-600">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    options: ConfirmOptions;
  }>({ open: false, options: { message: "" } });
  const confirmResolver = useRef<((value: boolean) => void) | null>(null);

  const [alertState, setAlertState] = useState<{
    open: boolean;
    options: AlertOptions;
  }>({ open: false, options: { message: "" } });
  const alertResolver = useRef<(() => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    const normalized: ConfirmOptions =
      typeof options === "string" ? { message: options } : options;
    setConfirmState({ open: true, options: normalized });
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
    });
  }, []);

  const alertDialog = useCallback<AlertFn>((options) => {
    const normalized: AlertOptions =
      typeof options === "string" ? { message: options } : options;
    setAlertState({ open: true, options: normalized });
    return new Promise<void>((resolve) => {
      alertResolver.current = resolve;
    });
  }, []);

  function handleConfirmResult(result: boolean) {
    setConfirmState((s) => ({ ...s, open: false }));
    confirmResolver.current?.(result);
    confirmResolver.current = null;
  }

  function handleAlertClose() {
    setAlertState((s) => ({ ...s, open: false }));
    alertResolver.current?.();
    alertResolver.current = null;
  }

  return (
    <ModalContext.Provider value={{ confirm, alertDialog }}>
      {children}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.options.title ?? "Confirmer l'action"}
        message={confirmState.options.message}
        confirmLabel={confirmState.options.confirmLabel}
        cancelLabel={confirmState.options.cancelLabel}
        danger={confirmState.options.danger ?? true}
        onConfirm={() => handleConfirmResult(true)}
        onCancel={() => handleConfirmResult(false)}
      />

      <AlertModal
        open={alertState.open}
        title={alertState.options.title ?? "Information"}
        message={alertState.options.message}
        danger={alertState.options.danger ?? false}
        onClose={handleAlertClose}
      />
    </ModalContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error(
      "useConfirmDialog doit être utilisé à l'intérieur d'un ModalProvider",
    );
  return ctx.confirm;
}

export function useAlertDialog() {
  const ctx = useContext(ModalContext);
  if (!ctx)
    throw new Error(
      "useAlertDialog doit être utilisé à l'intérieur d'un ModalProvider",
    );
  return ctx.alertDialog;
}
