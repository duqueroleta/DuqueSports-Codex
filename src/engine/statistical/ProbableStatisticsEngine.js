function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals = 0) {
  return Number(value.toFixed(decimals));
}

function averageRecentMetric(matches, field, fallback) {
  const values = Array.isArray(matches)
    ? matches.map((match) => match[field]).filter((value) => Number.isFinite(value))
    : [];

  if (!values.length) {
    return fallback;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function buildRange(center, spread, { decimals = 0, max = Infinity, min = 0, suffix = '' } = {}) {
  const start = clamp(center - spread, min, max);
  const end = clamp(center + spread, min, max);

  return `${round(start, decimals).toFixed(decimals)}-${round(end, decimals).toFixed(decimals)}${suffix}`;
}

function getPossessionCenter({ fallback, matches }) {
  return averageRecentMetric(matches, 'possession', fallback);
}

function buildTeamProbableStatistics({
  expectedGoals,
  matchInput,
  opponentShotsOnTarget,
  side,
  teamAdjusted,
}) {
  const matches = side === 'home' ? matchInput.homeTeam.recentMatches : matchInput.awayTeam.recentMatches;
  const opponentMatches = side === 'home' ? matchInput.awayTeam.recentMatches : matchInput.homeTeam.recentMatches;
  const xgotRatio = teamAdjusted.metrics.xg > 0
    ? clamp(teamAdjusted.metrics.xgot / teamAdjusted.metrics.xg, 0.78, 1.24)
    : 0.92;
  const xgot = expectedGoals * xgotRatio;
  const possessionFallback = side === 'home'
    ? 50 + ((expectedGoals - averageRecentMetric(opponentMatches, 'xg', expectedGoals)) * 4)
    : 50 - ((averageRecentMetric(opponentMatches, 'xg', expectedGoals) - expectedGoals) * 4);
  const possession = getPossessionCenter({
    fallback: clamp(possessionFallback, 35, 65),
    matches,
  });
  const shots = Math.max(5, teamAdjusted.metrics.shots);
  const shotsOnTarget = Math.max(1, teamAdjusted.metrics.shotsOnTarget);
  const inBoxShots = shots * 0.58;
  const bigChances = expectedGoals * 1.35;
  const boxTouches = (shots * 1.18) + (expectedGoals * 3.2);
  const corners = averageRecentMetric(matches, 'corners', 3 + (shots / 5));
  const cardsBase = matchInput.context.isKnockout ? 2.4 : 2;
  const cards = cardsBase + ((100 - possession) / 80);
  const fouls = 9 + ((100 - possession) / 9);
  const tackles = 9 + ((100 - possession) / 8);
  const interceptions = 6 + ((100 - possession) / 12);
  const keeperSaves = Math.max(1, opponentShotsOnTarget * 0.62);

  return {
    bigChances: buildRange(bigChances, 1, { max: 8 }),
    boxTouches: buildRange(boxTouches, 4, { max: 45 }),
    cards: buildRange(cards, 1, { max: 7 }),
    corners: buildRange(corners, 2, { max: 14 }),
    fouls: buildRange(fouls, 3, { max: 28 }),
    goals: buildRange(expectedGoals, 0.55, { max: 7 }),
    inBoxShots: buildRange(inBoxShots, 2, { max: 24 }),
    interceptions: buildRange(interceptions, 2, { max: 22 }),
    keeperSaves: buildRange(keeperSaves, 2, { max: 12 }),
    possession: buildRange(possession, 4, { max: 75, min: 25, suffix: '%' }),
    shots: buildRange(shots, 3, { max: 35 }),
    shotsOnTarget: buildRange(shotsOnTarget, 2, { max: 16 }),
    tackles: buildRange(tackles, 3, { max: 28 }),
    xg: buildRange(expectedGoals, 0.32, { decimals: 2, max: 5 }),
    xgot: buildRange(xgot, 0.35, { decimals: 2, max: 5 }),
  };
}

function runProbableStatisticsEngine({
  awayAdjusted,
  expectedAwayGoals,
  expectedHomeGoals,
  homeAdjusted,
  matchInput,
}) {
  const homeStats = buildTeamProbableStatistics({
    expectedGoals: expectedHomeGoals,
    matchInput,
    opponentShotsOnTarget: awayAdjusted.metrics.shotsOnTarget,
    side: 'home',
    teamAdjusted: homeAdjusted,
  });
  const awayStats = buildTeamProbableStatistics({
    expectedGoals: expectedAwayGoals,
    matchInput,
    opponentShotsOnTarget: homeAdjusted.metrics.shotsOnTarget,
    side: 'away',
    teamAdjusted: awayAdjusted,
  });

  return {
    model: 'probable-statistics-engine-v1',
    rows: [
      { key: 'goals', label: 'Gols', away: awayStats.goals, home: homeStats.goals },
      { key: 'xg', label: 'xG', away: awayStats.xg, home: homeStats.xg },
      { key: 'xgot', label: 'xGOT', away: awayStats.xgot, home: homeStats.xgot },
      { key: 'possession', label: 'Posse', away: awayStats.possession, home: homeStats.possession },
      { key: 'shots', label: 'Finalizacoes', away: awayStats.shots, home: homeStats.shots },
      { key: 'shotsOnTarget', label: 'No alvo', away: awayStats.shotsOnTarget, home: homeStats.shotsOnTarget },
      { key: 'inBoxShots', label: 'Dentro da area', away: awayStats.inBoxShots, home: homeStats.inBoxShots },
      { key: 'bigChances', label: 'Chances claras', away: awayStats.bigChances, home: homeStats.bigChances },
      { key: 'boxTouches', label: 'Toques na area', away: awayStats.boxTouches, home: homeStats.boxTouches },
      { key: 'corners', label: 'Escanteios', away: awayStats.corners, home: homeStats.corners },
      { key: 'cards', label: 'Cartoes', away: awayStats.cards, home: homeStats.cards },
      { key: 'fouls', label: 'Faltas', away: awayStats.fouls, home: homeStats.fouls },
      { key: 'tackles', label: 'Desarmes', away: awayStats.tackles, home: homeStats.tackles },
      { key: 'interceptions', label: 'Interceptacoes', away: awayStats.interceptions, home: homeStats.interceptions },
      { key: 'keeperSaves', label: 'Defesas do goleiro', away: awayStats.keeperSaves, home: homeStats.keeperSaves },
    ],
    teams: {
      away: awayStats,
      home: homeStats,
    },
  };
}

export { runProbableStatisticsEngine };
