import { createContext, useContext, useMemo, useState } from 'react';
import ToastViewport from '../components/toast/ToastViewport.jsx';

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, tone = 'success') {
    const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now());

    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function dismissToast(id) {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport dismissToast={dismissToast} toasts={toasts} />
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}

export { ToastProvider, useToast };
