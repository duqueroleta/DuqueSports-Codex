import '../../../styles/engine-projection-panel.css';

const engineSteps = [
  'Dados',
  'Simulacao',
  'Calibracao',
  'Ranking',
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatRange(center, spread, decimals = 0) {
  const start = Math.max(0, center - spread);
  const end = center + spread;
  const formatter = (value) => value.toFixed(decimals);

  return `${formatter(start)}-${formatter(end)}`;
}

function formatPercentRange(center, spread) {
  return `${Math.round(clamp(center - spread, 30, 70))}-${Math.round(clamp(center + spread, 30, 70))}%`;
}

function buildFutureProjectionRows(projection, match) {
  const homeGoals = projection.expectedHomeGoals;
  const awayGoals = projection.expectedAwayGoals;
  const totalXg = homeGoals + awayGoals;
  const homePossession = 50 + ((homeGoals - awayGoals) * 4);
  const awayPossession = 100 - homePossession;
  const homeShots = 7 + (homeGoals * 4.3);
  const awayShots = 7 + (awayGoals * 4.3);
  const homeOnTarget = 2 + (homeGoals * 1.7);
  const awayOnTarget = 2 + (awayGoals * 1.7);
  const homeCorners = 3 + (homeShots / 5);
  const awayCorners = 3 + (awayShots / 5);
  const highContactGame = match?.league?.includes('Copa') || match?.league?.includes('Libertadores');
  const homeCards = highContactGame ? 2.5 : 1.8;
  const awayCards = homeCards + (awayGoals > homeGoals ? 0.1 : 0.4);

  return [
    { label: 'Gols projetados', home: formatRange(homeGoals, 0.45), away: formatRange(awayGoals, 0.45) },
    { label: 'xG esperado', home: formatRange(homeGoals, 0.28, 2), away: formatRange(awayGoals, 0.28, 2) },
    { label: 'xGOT provavel', home: formatRange(homeGoals * 0.9, 0.3, 2), away: formatRange(awayGoals * 0.9, 0.3, 2) },
    { label: 'Posse de bola', home: formatPercentRange(homePossession, 3), away: formatPercentRange(awayPossession, 3) },
    { label: 'Finalizacoes', home: formatRange(homeShots, 2), away: formatRange(awayShots, 2) },
    { label: 'Finalizacoes no alvo', home: formatRange(homeOnTarget, 1), away: formatRange(awayOnTarget, 1) },
    { label: 'Finalizacoes dentro da area', home: formatRange(homeShots * 0.58, 1), away: formatRange(awayShots * 0.58, 1) },
    { label: 'Grandes chances', home: formatRange(homeGoals * 1.35, 1), away: formatRange(awayGoals * 1.35, 1) },
    { label: 'Escanteios', home: formatRange(homeCorners, 1), away: formatRange(awayCorners, 1) },
    { label: 'Cartoes amarelos', home: formatRange(homeCards, 1), away: formatRange(awayCards, 1) },
    { label: 'Desarmes', home: formatRange(13 + (awayPossession / 10), 2), away: formatRange(13 + (homePossession / 10), 2) },
    { label: 'Defesas do goleiro', home: formatRange(awayOnTarget * 0.65, 1), away: formatRange(homeOnTarget * 0.65, 1) },
    { label: 'Total xG do jogo', home: formatRange(totalXg, 0.35, 2), away: formatRange(totalXg, 0.35, 2) },
  ];
}

function getProjectionMetrics(projection) {
  return [
    { helper: 'qualidade dos dados', label: 'Data Quality', tone: 'quality', value: projection.dataQualityScore },
    { helper: 'gols esperados', label: 'xG mandante', value: projection.expectedHomeGoals },
    { helper: 'gols esperados', label: 'xG visitante', value: projection.expectedAwayGoals },
    { helper: 'linha de gols', label: 'Over 2.5', tone: 'probability', value: `${projection.probabilities.over25}%` },
    { helper: 'resultado final', label: 'Casa vence', tone: 'probability', value: `${projection.probabilities.homeWin}%` },
    { helper: 'ambas marcam', label: 'BTTS', tone: 'probability', value: `${projection.probabilities.btts}%` },
    { helper: 'score interno', label: 'Oportunidade', tone: 'ranking', value: projection.opportunityRanking.opportunityScore },
    { helper: 'classificacao', label: 'Tier', tone: 'ranking', value: projection.opportunityRanking.tier },
  ];
}

function EngineProjectionPanel({ match, projection }) {
  if (!projection || projection.blocked) {
    return null;
  }

  const metrics = getProjectionMetrics(projection);
  const projectionRows = buildFutureProjectionRows(projection, match);
  const rankingExplanation = projection.explanation?.[7]
    ?? 'Ranking calculado pelo pipeline estatistico do Duque Score.';

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

      <div className="future-projection-board" aria-label="Projecao estatistica futura da partida">
        <header>
          <div>
            <span>Antes do jogo</span>
            <strong>Projecao Estatistica Futura</strong>
          </div>
          <p>
            Leitura provavel da partida antes da bola rolar. O Duque Score estima o cenario que normalmente
            so aparece em sites estatisticos depois do apito final.
          </p>
        </header>

        <div className="future-projection-table">
          <div className="future-projection-row future-projection-head">
            <strong>Estatistica</strong>
            <strong>{match?.home ?? 'Mandante'}</strong>
            <strong>{match?.away ?? 'Visitante'}</strong>
          </div>

          {projectionRows.map((row) => (
            <div className="future-projection-row" key={row.label}>
              <span>{row.label}</span>
              <b>{row.home}</b>
              <b>{row.away}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EngineProjectionPanel;
