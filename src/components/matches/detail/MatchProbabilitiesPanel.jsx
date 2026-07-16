import { normalizeMatchProbabilities } from '../../../utils/matchProbabilities.js';
import '../../../styles/match-probabilities-panel.css';

function MatchProbabilitiesPanel({ probabilities = [] }) {
  const normalizedProbabilities = normalizeMatchProbabilities(probabilities);
  const strongestProbability = Math.max(...normalizedProbabilities.map((probability) => probability.value));

  if (!normalizedProbabilities.length) {
    return null;
  }

  return (
    <section className="detail-probabilities" id="probabilidades" aria-label="Probabilidades principais">
      <header>
        <span>Probabilidades calibradas</span>
        <strong>Cenário estatístico</strong>
      </header>
      <div className="detail-probabilities-grid">
        {normalizedProbabilities.map((probability) => {
          const isStrongest = probability.value === strongestProbability;

          return (
            <article className={isStrongest ? 'detail-probability-strongest' : ''} key={probability.label}>
              <span>{isStrongest ? 'Mais forte' : 'Mercado'}</span>
              <strong>{probability.value}%</strong>
              <small>{probability.label}</small>
              <div aria-hidden="true">
                <i style={{ width: `${probability.value}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MatchProbabilitiesPanel;
