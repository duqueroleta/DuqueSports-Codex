import '../../../styles/engine-projection-panel.css';

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
    { label: 'Gols', home: formatRange(homeGoals, 0.45), away: formatRange(awayGoals, 0.45) },
    { label: 'xG', home: formatRange(homeGoals, 0.28, 2), away: formatRange(awayGoals, 0.28, 2) },
    { label: 'xGOT', home: formatRange(homeGoals * 0.9, 0.3, 2), away: formatRange(awayGoals * 0.9, 0.3, 2) },
    { label: 'Posse de bola', home: formatPercentRange(homePossession, 3), away: formatPercentRange(awayPossession, 3) },
    { label: 'Finalizacoes', home: formatRange(homeShots, 2), away: formatRange(awayShots, 2) },
    { label: 'Finalizacoes no alvo', home: formatRange(homeOnTarget, 1), away: formatRange(awayOnTarget, 1) },
    { label: 'Finalizacoes na area', home: formatRange(homeShots * 0.58, 1), away: formatRange(awayShots * 0.58, 1) },
    { label: 'Grandes chances', home: formatRange(homeGoals * 1.35, 1), away: formatRange(awayGoals * 1.35, 1) },
    { label: 'Escanteios', home: formatRange(homeCorners, 1), away: formatRange(awayCorners, 1) },
    { label: 'Cartoes amarelos', home: formatRange(homeCards, 1), away: formatRange(awayCards, 1) },
    { label: 'Desarmes', home: formatRange(13 + (awayPossession / 10), 2), away: formatRange(13 + (homePossession / 10), 2) },
    { label: 'Defesas do goleiro', home: formatRange(awayOnTarget * 0.65, 1), away: formatRange(homeOnTarget * 0.65, 1) },
    { label: 'Total xG do jogo', home: formatRange(totalXg, 0.35, 2), away: formatRange(totalXg, 0.35, 2) },
  ];
}

function EngineProjectionPanel({ match, projection }) {
  if (!projection || projection.blocked) {
    return null;
  }

  const projectionRows = buildFutureProjectionRows(projection, match);

  return (
    <section className="engine-projection-panel" id="projecao-engine" aria-label="Projecao estatistica do jogo">
      <header className="projection-match-header">
        <div>
          <span>{match?.league ?? 'Jogo'}</span>
          <strong>{match?.home ?? 'Mandante'} x {match?.away ?? 'Visitante'}</strong>
        </div>
        <small>Hoje, {match?.time ?? '--:--'}</small>
      </header>

      <div className="future-projection-board" aria-label="Projecao estatistica futura da partida">
        <header>
          <div>
            <span>Projecao pre-jogo</span>
            <strong>Estatisticas provaveis da partida</strong>
          </div>
          <p>Estimativa de desempenho para cada time antes da bola rolar.</p>
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
              <b>
                <small>{match?.home ?? 'Mandante'}</small>
                <em>{row.home}</em>
              </b>
              <b>
                <small>{match?.away ?? 'Visitante'}</small>
                <em>{row.away}</em>
              </b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EngineProjectionPanel;
