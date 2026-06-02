'use client';

import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const toastIcons = {
  success: <Check size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertCircle size={20} />,
};

const toastColors = {
  success: 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald',
  error: 'border-accent-rose bg-accent-rose/10 text-accent-rose',
  info: 'border-accent-blue bg-accent-blue/10 text-accent-blue',
  warning: 'border-accent-amber bg-accent-amber/10 text-accent-amber',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    window.showToast = (type: ToastType, message: string, duration = 3000) => {
      const id = Math.random().toString();
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    };

    return () => {
      delete window.showToast;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 400 }}
            className={`glass-card p-4 rounded-lg border flex items-center gap-3 pointer-events-auto ${toastColors[toast.type]}`}
          >
            {toastIcons[toast.type]}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) =>
                  prev.filter((t) => t.id !== toast.id)
                )
              }
              className="ml-auto hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

declare global {
  interface Window {
    showToast?: (type: ToastType, message: string, duration?: number) => void;
  }
}

export {};
