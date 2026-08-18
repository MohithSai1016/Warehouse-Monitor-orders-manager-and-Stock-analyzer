import React from 'react';
import { useWms } from '../../context/WmsContext';
import { CheckCircle2, AlertTriangle, X, ShieldAlert, Zap } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useWms();

  if (toasts.length === 0) return null;

  return (
    <div className="toasts" role="region" aria-label="System Notifications">
      {toasts.map(toast => {
        let icon = <CheckCircle2 size={16} aria-hidden="true" />;
        if (toast.type === 'warning') icon = <AlertTriangle size={16} aria-hidden="true" />;
        else if (toast.type === 'danger') icon = <ShieldAlert size={16} aria-hidden="true" />;
        else if (toast.type === 'info') icon = <Zap size={16} aria-hidden="true" />;

        return (
          <div 
            key={toast.id} 
            className={`toast ${toast.type || 'success'}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {icon}
            <div>
              <strong>{toast.title}</strong>
              <small>{toast.message}</small>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
              title="Dismiss notification"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
