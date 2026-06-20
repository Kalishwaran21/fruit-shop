import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

let toastCallback = null;

export function toast(message, type = 'success') {
  if (toastCallback) toastCallback(message, type);
}

const icons = {
  success: <CheckCircle size={20} color="#34d399" />,
  warning: <AlertTriangle size={20} color="#fbbf24" />,
  error:   <XCircle size={20} color="#f87171" />,
};

const borderColors = {
  success: '#34d399',
  warning: '#fbbf24',
  error:   '#f87171',
};

function ToastItem({ id, message, type, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 3800);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      background: 'rgba(2,20,8,0.92)', backdropFilter: 'blur(20px)',
      border: `1px solid ${borderColors[type]}44`,
      borderLeft: `4px solid ${borderColors[type]}`,
      borderRadius: '12px', padding: '14px 18px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${borderColors[type]}22`,
      minWidth: '300px', maxWidth: '380px',
      animation: 'toastSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      color: '#f0fdf4', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
    }}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={() => onRemove(id)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#86efac', padding: '2px', display: 'flex',
      }}>
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => { toastCallback = addToast; }, [addToast]);

  return createPortal(
    <div style={{
      position: 'fixed',
      bottom: 'calc(68px + 12px)', /* above mobile nav */
      right: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 99999,
      maxWidth: 'calc(100vw - 24px)',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
}
