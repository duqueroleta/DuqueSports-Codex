import { buildAdminEngineProjection, buildProjectedStats } from './adminProjectionService.js';

const STORAGE_KEY = 'duque.admin.publishedProjections';

function getStorage() {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function readPublishedItems() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePublishedItems(items) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function range(value, spread, decimals = 0) {
  const start = Math.max(0, value - spread);
  const end = value + spread;

  return `${start.toFixed(decimals)}-${end.toFixed(decimals)}`;
}

function createPublishedProjectionRecord(form, projection, now = () => new Date()) {
  if (!projection || projection.blocked) {
    return null;
  }

  const stats = buildProjectedStats(projection);
  const id = `admin-${now().getTime()}`;
  const recommendedMarket = projection.aiExplanation?.recommendedMarket;

  return {
    match: {
      away: form.awayName,
      colors: ['#d9b45b', '#20f6a4', '#07111c'],
      confidence: projection.confidence,
      home: form.homeName,
      id,
      insight: projection.aiExplanation?.verdict ?? 'Projecao estatistica gerada pelo Duque Score.',
      league: form.competition,
      metrics: [
        `xG ${(stats.homeGoals + stats.awayGoals).toFixed(2)}`,
        `Finaliz. ${Math.round(stats.homeShots + stats.awayShots)}`,
        `Alvo ${Math.round(stats.homeShotsOnTarget + stats.awayShotsOnTarget)}`,
        `Escant. ${Math.round(stats.homeCorners + stats.awayCorners)}`,
      ],
      odds: String(form.odds ?? '1.00'),
      probabilities: [
        { label: 'Confianca', value: projection.confidence },
        { label: form.homeName, value: projection.probabilities?.homeWin ?? 0 },
        { label: '+1.5 gols', value: projection.probabilities?.over15 ?? projection.probabilities?.over25 ?? 0 },
      ],
      projectionRows: [
        { label: 'xG', away: range(stats.awayGoals, 0.28, 2), home: range(stats.homeGoals, 0.28, 2) },
        { label: 'Gols', away: range(stats.awayGoals, 0.45), home: range(stats.homeGoals, 0.45) },
        { label: 'Finalizacoes', away: range(stats.awayShots, 2), home: range(stats.homeShots, 2) },
        { label: 'No alvo', away: range(stats.awayShotsOnTarget, 1), home: range(stats.homeShotsOnTarget, 1) },
      ],
      score: '0 - 0',
      signal: recommendedMarket?.market ?? 'Projecao IA',
      status: 'Pre-jogo',
      time: form.time,
    },
    projection,
    publishedAt: now().toISOString(),
  };
}

function publishAdminProjection(form) {
  const projection = buildAdminEngineProjection(form);
  const record = createPublishedProjectionRecord(form, projection);

  if (!record) {
    return { ok: false, reason: projection.issues?.[0] ?? 'Projecao bloqueada.' };
  }

  const items = readPublishedItems().filter((item) => (
    item.match?.home !== record.match.home
    || item.match?.away !== record.match.away
    || item.match?.league !== record.match.league
  ));

  writePublishedItems([record, ...items].slice(0, 30));

  return { ok: true, match: record.match };
}

function getPublishedMatches() {
  return readPublishedItems().map((item) => item.match).filter(Boolean);
}

function getPublishedMatchById(id) {
  return getPublishedMatches().find((match) => String(match.id) === String(id)) ?? null;
}

function getPublishedProjectionByMatchId(id) {
  const item = readPublishedItems().find((record) => String(record.match?.id) === String(id));
  return item?.projection ?? null;
}

export {
  createPublishedProjectionRecord,
  getPublishedMatchById,
  getPublishedMatches,
  getPublishedProjectionByMatchId,
  publishAdminProjection,
};
