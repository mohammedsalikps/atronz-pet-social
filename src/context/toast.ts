import { createContext, useContext } from 'react';

/*
 * Toast contract, split from the provider for the same Fast Refresh
 * reason as the app-data context.
 */

export type ToastTone = 'success' | 'info' | 'warning';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

export interface ToastValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastValue | null>(null);

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return context;
}
