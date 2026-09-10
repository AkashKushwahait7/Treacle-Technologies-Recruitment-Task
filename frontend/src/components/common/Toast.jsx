import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { removeToast } from '../../store/slices/toastSlice.js';

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-[#0F172A]',
    error: 'border-rose-500/30 bg-[#0F172A]',
    warning: 'border-amber-500/30 bg-[#0F172A]',
    info: 'border-sky-500/30 bg-[#0F172A]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md w-80 md:w-96 pointer-events-auto ${borders[toast.type] || borders.info}`}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-xs font-semibold text-white tracking-wide">{toast.title}</h4>
        )}
        <p className="text-xs text-slate-300 mt-0.5 break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toast.toasts);

  const handleDismiss = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
