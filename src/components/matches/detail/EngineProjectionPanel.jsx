import '../../../styles/engine-projection-panel.css';

function getProjectionMetrics(projection) {
  return [
    { label: 'Data Quality', value: projection.dataQualityScore },
    { label: 'xG mandante', value: projection.expectedHomeGoals },
    { label: 'xG visitante', value: projection.expectedAwayGoals },
    { label: 'Over 2.5', value: `${projection.probabilities.over25}%` },
    { label: 'Casa vence', value: `${projection.probabilities.homeWin}%` },
    { label: 'BTTS', value: `${projection.probabilities.btts}%` },
    { label: 'Oportunidade', value: projection.opportunityRanking.opportunityScore },
    { label: 'Tier', value: projection.opportunityRanking.tier },
  ];
}

function EngineProjectionPanel({ projection }) {
  if (!projection || projection.blocked) {
    return null;
  }

  const metrics = getProjectionMetrics(projection);
  const rankingExplanation = projection.explanation?.[7]
    ?? 'Ranking calculado pelo pipeline estatístico do Duque Score.';

  return (
    <section className="engine-projection-panel" id="projecao-engine" aria-label="Duque Score Engine">
      <div>
        <span>Engine v1</span>
        <strong>Ranking de oportunidade ativo</strong>
        <p>{rankingExplanation}</p>
      </div>

      <div className="engine-projection-metrics">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EngineProjectionPanel;
