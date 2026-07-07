import '../../styles/toast.css';

function ToastViewport({ dismissToast, toasts }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-label="Notificações">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.tone}`} key={toast.id}>
          <span>{toast.message}</span>
          <button aria-label="Fechar notificação" onClick={() => dismissToast(toast.id)} type="button">
            X
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
