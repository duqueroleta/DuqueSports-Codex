import { normalizeMatchProbabilities } from '../../../utils/matchProbabilities.js';
import '../../../styles/match-probabilities-panel.css';

function getProbabilityTone(value) {
  if (value >= 80) {
    return 'Alta';
  }

  if (value >= 65) {
    return 'Boa';
  }

  return 'Moderada';
}

function MatchProbabilitiesPanel({ probabilities = [] }) {
  const normalizedProbabilities = normalizeMatchProbabilities(probabilities);

  if (!normalizedProbabilities.length) {
    return null;
  }

  const strongestProbability = Math.max(...normalizedProbabilities.map((probability) => probability.value));
  const leadProbability = normalizedProbabilities.find((probability) => probability.value === strongestProbability);

  return (
    <section className="detail-probabilities" id="probabilidades" aria-label="Probabilidades principais">
      <header>
        <div>
          <span>Probabilidades calibradas</span>
          <strong>Cenario estatistico</strong>
        </div>
        <small>
          Maior forca: <b>{leadProbability?.label}</b>
        </small>
      </header>

      <div className="detail-probabilities-grid">
        {normalizedProbabilities.map((probability) => {
          const isStrongest = probability.value === strongestProbability;
          const tone = getProbabilityTone(probability.value);

          return (
            <article className={isStrongest ? 'detail-probability-strongest' : ''} key={probability.label}>
              <span>{isStrongest ? 'Mais forte' : 'Mercado'}</span>
              <strong>{probability.value}%</strong>
              <small>{probability.label}</small>
              <em>{tone} aderencia ao modelo</em>
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
