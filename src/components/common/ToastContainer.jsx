import React from 'react';
import { useWms } from '../../context/WmsContext';
import { CheckCircle2, AlertTriangle, X, ShieldAlert, Zap } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useWms();

  if (toasts.length === 0) return null;

  return (
    <div className="toasts">
      {toasts.map(toast => {
        let icon = <CheckCircle2 size={16} />;
        if (toast.type === 'warning') icon = <AlertTriangle size={16} />;
        else if (toast.type === 'danger') icon = <ShieldAlert size={16} />;

        return (
          <div key={toast.id} className={`toast ${toast.type || 'success'}`}>
            {icon}
            <div>
              <strong>{toast.title}</strong>
              <small>{toast.message}</small>
            </div>
            <button onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
