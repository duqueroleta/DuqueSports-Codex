import '../../styles/error-state.css';

function ErrorState({ message = 'Não foi possível carregar os dados agora.', onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div>
        <span>Falha de carregamento</span>
        <strong>{message}</strong>
      </div>
      {onRetry ? (
        <button onClick={onRetry} type="button">
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
