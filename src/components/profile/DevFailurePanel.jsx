import { usePersistentState } from '../../hooks/usePersistentState.js';
import { MOCK_FAILURE_KEY } from '../../services/mockApi.js';
import '../../styles/dev-failure.css';

const failureOptions = [
  { label: 'Desligado', value: 'off' },
  { label: 'Tudo', value: 'all' },
  { label: 'Jogos', value: 'matches' },
  { label: 'Mercados', value: 'markets' },
  { label: 'Auditorias', value: 'audits' },
  { label: 'Ao Vivo', value: 'live' },
];

function DevFailurePanel() {
  const [failureMode, setFailureMode] = usePersistentState(MOCK_FAILURE_KEY, 'off');

  if (!import.meta.env.DEV) {
    return null;
  }

  function updateFailureMode(value) {
    setFailureMode(value);

    if (value === 'off') {
      window.localStorage.removeItem(MOCK_FAILURE_KEY);
    }
  }

  return (
    <section className="dev-failure-panel" aria-labelledby="dev-failure-title">
      <div>
        <span>Dev tools</span>
        <h2 id="dev-failure-title">Simular falha de API</h2>
        <p>Use para testar estados de erro, retry e skeleton antes da integracao real.</p>
      </div>

      <div className="dev-failure-options">
        {failureOptions.map((option) => (
          <button
            aria-pressed={failureMode === option.value}
            className={failureMode === option.value ? 'dev-failure-active' : ''}
            key={option.value}
            onClick={() => updateFailureMode(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DevFailurePanel;
