import '../../../styles/engine-projection-panel.css';

const engineSteps = [
  'Dados',
  'Simulação',
  'Calibração',
  'Ranking',
];

function getProjectionMetrics(projection) {
  return [
    { helper: 'qualidade dos dados', label: 'Data Quality', tone: 'quality', value: projection.dataQualityScore },
    { helper: 'gols esperados', label: 'xG mandante', value: projection.expectedHomeGoals },
    { helper: 'gols esperados', label: 'xG visitante', value: projection.expectedAwayGoals },
    { helper: 'linha de gols', label: 'Over 2.5', tone: 'probability', value: `${projection.probabilities.over25}%` },
    { helper: 'resultado final', label: 'Casa vence', tone: 'probability', value: `${projection.probabilities.homeWin}%` },
    { helper: 'ambas marcam', label: 'BTTS', tone: 'probability', value: `${projection.probabilities.btts}%` },
    { helper: 'score interno', label: 'Oportunidade', tone: 'ranking', value: projection.opportunityRanking.opportunityScore },
    { helper: 'classificação', label: 'Tier', tone: 'ranking', value: projection.opportunityRanking.tier },
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

      <div className="engine-projection-flow" aria-label="Fluxo de processamento do motor">
        {engineSteps.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>

      <div className="engine-projection-metrics">
        {metrics.map((metric) => (
          <article className={metric.tone ? `engine-metric-${metric.tone}` : ''} key={metric.label}>
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
