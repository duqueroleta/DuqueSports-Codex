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

function buildProjectionRow(label, homeValue, awayValue, formatter) {
  const total = Math.max(homeValue + awayValue, 0.01);

  return {
    away: formatter(awayValue),
    awayShare: Math.round((awayValue / total) * 100),
    home: formatter(homeValue),
    homeShare: Math.round((homeValue / total) * 100),
    label,
  };
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
    buildProjectionRow('xG', homeGoals, awayGoals, (value) => formatRange(value, 0.28, 2)),
    buildProjectionRow('Gols', homeGoals, awayGoals, (value) => formatRange(value, 0.45)),
    buildProjectionRow('Finalizacoes no alvo', homeOnTarget, awayOnTarget, (value) => formatRange(value, 1)),
    buildProjectionRow('Grandes chances', homeGoals * 1.35, awayGoals * 1.35, (value) => formatRange(value, 1)),
    buildProjectionRow('Finalizacoes', homeShots, awayShots, (value) => formatRange(value, 2)),
    buildProjectionRow('xGOT', homeGoals * 0.9, awayGoals * 0.9, (value) => formatRange(value, 0.3, 2)),
    buildProjectionRow('Posse de bola', homePossession, awayPossession, (value) => formatPercentRange(value, 3)),
    buildProjectionRow('Finalizacoes na area', homeShots * 0.58, awayShots * 0.58, (value) => formatRange(value, 1)),
    buildProjectionRow('Escanteios', homeCorners, awayCorners, (value) => formatRange(value, 1)),
    buildProjectionRow('Cartoes amarelos', homeCards, awayCards, (value) => formatRange(value, 1)),
    buildProjectionRow('Desarmes', 13 + (awayPossession / 10), 13 + (homePossession / 10), (value) => formatRange(value, 2)),
    buildProjectionRow('Defesas do goleiro', awayOnTarget * 0.65, homeOnTarget * 0.65, (value) => formatRange(value, 1)),
    buildProjectionRow('Total xG do jogo', totalXg, totalXg, (value) => formatRange(value, 0.35, 2)),
  ];
}

function EngineProjectionPanel({ match, projection }) {
  if (!projection || projection.blocked) {
    return null;
  }

  const projectionRows = buildFutureProjectionRows(projection, match);
  const featuredRows = projectionRows.slice(0, 4);

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

        <div className="future-projection-featured" aria-label="Principais projecoes do jogo">
          {featuredRows.map((row) => (
            <article key={row.label}>
              <span>{row.label}</span>
              <strong>{row.home}</strong>
              <small>{match?.home ?? 'Mandante'}</small>
              <b>{row.away}</b>
              <em>{match?.away ?? 'Visitante'}</em>
            </article>
          ))}
        </div>

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
              <i
                aria-hidden="true"
                className="future-projection-balance"
                style={{
                  '--away-share': `${row.awayShare}%`,
                  '--home-share': `${row.homeShare}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EngineProjectionPanel;
