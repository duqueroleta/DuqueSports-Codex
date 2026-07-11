import '../../../styles/match-probabilities-panel.css';

function getProgressWidth(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
}

function MatchProbabilitiesPanel({ probabilities = [] }) {
  if (!probabilities.length) {
    return null;
  }

  return (
    <section className="detail-probabilities" aria-label="Probabilidades principais">
      {probabilities.map((probability) => (
        <article key={probability.label}>
          <span>{probability.label}</span>
          <strong>{probability.value}%</strong>
          <div aria-hidden="true">
            <i style={{ width: `${getProgressWidth(probability.value)}%` }} />
          </div>
        </article>
      ))}
    </section>
  );
}

export default MatchProbabilitiesPanel;
