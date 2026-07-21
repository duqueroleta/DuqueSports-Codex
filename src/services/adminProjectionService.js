import { runProjectionPipeline } from '../engine/projection/ProjectionPipeline.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'time';
}

function inferOpponentTier(teamXg, opponentXg) {
  const gap = teamXg - opponentXg;

  if (gap >= 0.65) {
    return 'elite';
  }

  if (gap >= 0.28) {
    return 'strong';
  }

  if (gap <= -0.5) {
    return 'weak';
  }

  return 'balanced';
}

function buildRecentMatchesFromAverages({ shots, shotsOnTarget, xg }) {
  const safeXg = Math.max(0.15, toNumber(xg, 1));
  const safeShots = Math.max(3, toNumber(shots, 9));
  const safeOnTarget = Math.min(safeShots, Math.max(1, toNumber(shotsOnTarget, safeShots * 0.36)));
  const variations = [1, 0.92, 1.08, 0.84, 0.76];

  return variations.map((variation, index) => {
    const projectedShots = Math.max(1, Math.round(safeShots * variation));
    const projectedOnTarget = Math.min(projectedShots, Math.max(1, Math.round(safeOnTarget * variation)));
    const projectedXg = Number(Math.max(0.1, safeXg * variation).toFixed(2));

    return {
      goals: Math.max(0, Math.round(projectedXg - (index % 2 === 0 ? 0.2 : 0.55))),
      shots: projectedShots,
      shotsOnTarget: projectedOnTarget,
      xg: projectedXg,
      xgot: Number((projectedXg * 0.9).toFixed(2)),
    };
  });
}

function buildAdminEngineInput(form) {
  const homeXg = toNumber(form.homeXg, 1);
  const awayXg = toNumber(form.awayXg, 1);
  const matchId = `admin:${slugify(form.homeName)}-${slugify(form.awayName)}:${form.date}:${form.time}`;

  return {
    id: matchId,
    competition: form.competition,
    homeTeam: {
      id: `${matchId}:home`,
      name: form.homeName,
      opponentTier: inferOpponentTier(awayXg, homeXg),
      recentMatches: buildRecentMatchesFromAverages({
        shots: form.homeShots,
        shotsOnTarget: form.homeShotsOnTarget,
        xg: homeXg,
      }),
    },
    awayTeam: {
      id: `${matchId}:away`,
      name: form.awayName,
      opponentTier: inferOpponentTier(homeXg, awayXg),
      recentMatches: buildRecentMatchesFromAverages({
        shots: form.awayShots,
        shotsOnTarget: form.awayShotsOnTarget,
        xg: awayXg,
      }),
    },
    context: {
      dataFreshnessHours: 2,
      isKnockout: String(form.competition).includes('Copa') || String(form.competition).includes('Libertadores'),
      isNeutralVenue: String(form.competition).includes('Copa do Mundo'),
    },
  };
}

function buildAdminEngineProjection(form) {
  return runProjectionPipeline(buildAdminEngineInput(form));
}

function buildProjectedStats(projection) {
  if (!projection || projection.blocked) {
    return null;
  }

  const homeGoals = projection.expectedHomeGoals;
  const awayGoals = projection.expectedAwayGoals;
  const homeShots = 7 + (homeGoals * 4.3);
  const awayShots = 7 + (awayGoals * 4.3);
  const homePossession = clamp(50 + ((homeGoals - awayGoals) * 4), 35, 65);
  const awayPossession = 100 - homePossession;

  return {
    awayCorners: 3 + (awayShots / 5),
    awayGoals,
    awayPossession,
    awayShots,
    awayShotsOnTarget: 2 + (awayGoals * 1.7),
    awayXgot: awayGoals * 0.9,
    homeCorners: 3 + (homeShots / 5),
    homeGoals,
    homePossession,
    homeShots,
    homeShotsOnTarget: 2 + (homeGoals * 1.7),
    homeXgot: homeGoals * 0.9,
  };
}

export { buildAdminEngineInput, buildAdminEngineProjection, buildProjectedStats };
