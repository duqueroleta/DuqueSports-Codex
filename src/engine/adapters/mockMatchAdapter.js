function buildRecentMatches(seedXg, seedShots) {
  return [
    { xg: seedXg, xgot: seedXg * 0.92, shots: seedShots, shotsOnTarget: Math.round(seedShots * 0.42), goals: Math.max(0, Math.round(seedXg - 0.25)) },
    { xg: seedXg * 0.88, xgot: seedXg * 0.84, shots: seedShots - 2, shotsOnTarget: Math.round((seedShots - 2) * 0.4), goals: Math.max(0, Math.round(seedXg - 0.55)) },
    { xg: seedXg * 1.1, xgot: seedXg, shots: seedShots + 1, shotsOnTarget: Math.round((seedShots + 1) * 0.44), goals: Math.max(0, Math.round(seedXg)) },
    { xg: seedXg * 0.76, xgot: seedXg * 0.72, shots: seedShots - 3, shotsOnTarget: Math.round((seedShots - 3) * 0.38), goals: Math.max(0, Math.round(seedXg - 0.8)) },
    { xg: seedXg * 0.64, xgot: seedXg * 0.6, shots: seedShots - 4, shotsOnTarget: Math.round((seedShots - 4) * 0.36), goals: Math.max(0, Math.round(seedXg - 1)) },
  ];
}

function inferOpponentTier(confidence) {
  if (confidence >= 86) {
    return 'elite';
  }

  if (confidence >= 80) {
    return 'strong';
  }

  if (confidence >= 73) {
    return 'balanced';
  }

  return 'weak';
}

function adaptMatchToEngineInput(match) {
  const homeBaseXg = Number((1.05 + (match.confidence / 100)).toFixed(2));
  const awayBaseXg = Number((0.82 + ((100 - match.confidence) / 130)).toFixed(2));

  return {
    id: match.id,
    competition: match.league,
    homeTeam: {
      id: `${match.id}-home`,
      name: match.home,
      opponentTier: inferOpponentTier(match.confidence),
      recentMatches: buildRecentMatches(homeBaseXg, 14),
    },
    awayTeam: {
      id: `${match.id}-away`,
      name: match.away,
      opponentTier: 'balanced',
      recentMatches: buildRecentMatches(awayBaseXg, 11),
    },
    context: {
      isNeutralVenue: match.league === 'Copa do Mundo',
      isKnockout: match.league.includes('Copa') || match.league.includes('Libertadores'),
      dataFreshnessHours: match.status === 'Ao vivo' ? 1 : 6,
    },
  };
}

export { adaptMatchToEngineInput };
