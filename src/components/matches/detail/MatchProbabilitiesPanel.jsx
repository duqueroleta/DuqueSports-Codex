import { normalizeMatchProbabilities } from '../../../utils/matchProbabilities.js';
import '../../../styles/match-probabilities-panel.css';

function MatchProbabilitiesPanel({ probabilities = [] }) {
  const normalizedProbabilities = normalizeMatchProbabilities(probabilities);

  if (!normalizedProbabilities.length) {
    return null;
  }

  return (
    <section className="detail-probabilities" id="probabilidades" aria-label="Probabilidades principais">
      <header>
        <span>Probabilidades calibradas</span>
        <strong>Cenario estatistico</strong>
      </header>
      <div className="detail-probabilities-grid">
        {normalizedProbabilities.map((probability) => (
          <article key={probability.label}>
            <span>{probability.label}</span>
            <strong>{probability.value}%</strong>
            <div aria-hidden="true">
              <i style={{ width: `${probability.value}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MatchProbabilitiesPanel;
