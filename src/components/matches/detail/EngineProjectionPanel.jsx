import '../../../styles/engine-projection-panel.css';

function getProjectionMetrics(projection) {
  return [
    { helper: 'qualidade dos dados', label: 'Data Quality', value: projection.dataQualityScore },
    { helper: 'gols esperados', label: 'xG mandante', value: projection.expectedHomeGoals },
    { helper: 'gols esperados', label: 'xG visitante', value: projection.expectedAwayGoals },
    { helper: 'linha de gols', label: 'Over 2.5', value: `${projection.probabilities.over25}%` },
    { helper: 'resultado final', label: 'Casa vence', value: `${projection.probabilities.homeWin}%` },
    { helper: 'ambas marcam', label: 'BTTS', value: `${projection.probabilities.btts}%` },
    { helper: 'score interno', label: 'Oportunidade', value: projection.opportunityRanking.opportunityScore },
    { helper: 'classificação', label: 'Tier', value: projection.opportunityRanking.tier },
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
            <small>{metric.helper}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EngineProjectionPanel;
