import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-popover border transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in ${
                isSuccess
                  ? 'bg-white border-green-200 text-slate-800'
                  : isError
                  ? 'bg-white border-red-200 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {isSuccess && (
                  <div className="p-1 rounded-lg bg-green-50 text-green-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {isError && (
                  <div className="p-1 rounded-lg bg-red-50 text-red-600 shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {!isSuccess && !isError && (
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                )}
                <p className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
