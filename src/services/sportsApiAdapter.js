import { normalizeMatchPresentation, normalizeMatchesPresentation } from '../utils/matchPresentation.js';

const API_STATUS_TO_UI = Object.freeze({
  live: 'Ao vivo',
  scheduled: 'Pre-jogo',
});

function parseInternalMatchId(id) {
  const match = String(id ?? '').match(/^match:internal:(\d+)$/);
  return match ? Number(match[1]) : null;
}

function formatScore(score) {
  const home = Number.isInteger(score?.home) ? score.home : null;
  const away = Number.isInteger(score?.away) ? score.away : null;
  return home === null || away === null ? '-' : `${home} - ${away}`;
}

function adaptCompetitionReadModel(competition) {
  if (!competition || typeof competition !== 'object') {
    return null;
  }

  return {
    id: competition.id,
    label: competition.name,
    region: competition.region,
  };
}

function adaptMatchReadModel(match, fallbackMatches = []) {
  if (!match || typeof match !== 'object') {
    return null;
  }

  const id = parseInternalMatchId(match.id);
  const fallback = fallbackMatches.find((item) => item.id === id) ?? {};
  const analysis = match.analysis ?? {};

  return normalizeMatchPresentation({
    ...fallback,
    id: id ?? fallback.id,
    league: match.competition?.name,
    time: match.schedule?.time,
    status: API_STATUS_TO_UI[match.status] ?? fallback.status,
    home: match.teams?.home?.name,
    away: match.teams?.away?.name,
    score: formatScore(match.score),
    signal: analysis.signal,
    confidence: analysis.confidence,
    metrics: Array.isArray(analysis.metrics) ? analysis.metrics : fallback.metrics,
    probabilities: Array.isArray(analysis.probabilities) ? analysis.probabilities : fallback.probabilities,
    insight: analysis.insight,
  });
}

function adaptCompetitionReadModels(competitions) {
  return Array.isArray(competitions)
    ? competitions.map(adaptCompetitionReadModel).filter(Boolean)
    : [];
}

function adaptMatchReadModels(apiMatches, fallbackMatches = []) {
  return normalizeMatchesPresentation(
    Array.isArray(apiMatches)
      ? apiMatches.map((match) => adaptMatchReadModel(match, fallbackMatches)).filter(Boolean)
      : [],
  );
}

export {
  API_STATUS_TO_UI,
  adaptCompetitionReadModel,
  adaptCompetitionReadModels,
  adaptMatchReadModel,
  adaptMatchReadModels,
  formatScore,
  parseInternalMatchId,
};
