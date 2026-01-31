'use client';

import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/lib/store';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
}

const ToastItem = ({ id, type, title, message, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-success-green/10 border-success-green/30 text-success-green',
    error: 'bg-error-red/10 border-error-red/30 text-error-red',
    warning: 'bg-warning-amber/10 border-warning-amber/30 text-warning-amber',
    info: 'bg-primary-blue/10 border-primary-blue/30 text-primary-blue',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm',
        'bg-background-elevated/95 border-border-subtle shadow-lg',
        'min-w-[300px] max-w-[400px]'
      )}
    >
      <span className={cn('flex-shrink-0 mt-0.5', styles[type])}>
        {icons[type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary">{title}</p>
        {message && (
          <p className="mt-1 text-sm text-text-secondary">{message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-hover transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast container that reads from store
const ToastContainer = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ToastItem, ToastContainer };
