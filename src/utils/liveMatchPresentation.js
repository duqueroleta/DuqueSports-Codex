import { normalizeMatchConfidence } from './matchConfidence.js';
import { normalizeText } from './matchPresentation.js';

const MAX_MATCH_MINUTE = 130;
const LIVE_TEXT_FALLBACKS = Object.freeze({
  alert: 'Alerta estatístico indisponível',
  away: 'Visitante',
  home: 'Mandante',
  league: 'Competição não informada',
  score: '-',
  signal: 'Sinal indisponível',
});

function normalizeLiveMinute(value) {
  if (!['number', 'string'].includes(typeof value)) {
    return null;
  }

  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.min(MAX_MATCH_MINUTE, Math.max(0, Math.round(numericValue)));
}

function formatLiveMinute(value) {
  const minute = normalizeLiveMinute(value);
  return minute === null ? '--' : `${minute}'`;
}

function formatLivePressure(value) {
  const pressure = normalizeMatchConfidence(value);
  return pressure === null ? '--' : `${pressure}%`;
}

function getLiveMatchStage(value) {
  const minute = normalizeLiveMinute(value);

  if (minute === null) {
    return 'Tempo indisponível';
  }

  if (minute >= 75) {
    return 'Reta final';
  }

  return minute >= 46 ? 'Segundo tempo' : 'Primeiro tempo';
}

function getLivePressureTone(value) {
  const pressure = normalizeMatchConfidence(value);

  if (pressure === null) {
    return 'Dados indisponíveis';
  }

  return pressure >= 80 ? 'Zona quente' : 'Monitorar';
}

function calculateAverageLivePressure(matches) {
  if (!Array.isArray(matches)) {
    return null;
  }

  const values = matches
    .map((match) => normalizeMatchConfidence(match?.pressure))
    .filter((pressure) => pressure !== null);

  if (!values.length) {
    return null;
  }

  return Math.round(values.reduce((total, pressure) => total + pressure, 0) / values.length);
}

function normalizeLiveMatchPresentation(match) {
  if (!match || typeof match !== 'object' || Array.isArray(match)) {
    return null;
  }

  return {
    ...match,
    alert: normalizeText(match.alert, LIVE_TEXT_FALLBACKS.alert),
    away: normalizeText(match.away, LIVE_TEXT_FALLBACKS.away),
    home: normalizeText(match.home, LIVE_TEXT_FALLBACKS.home),
    league: normalizeText(match.league, LIVE_TEXT_FALLBACKS.league),
    minute: normalizeLiveMinute(match.minute),
    pressure: normalizeMatchConfidence(match.pressure),
    score: normalizeText(match.score, LIVE_TEXT_FALLBACKS.score),
    signal: normalizeText(match.signal, LIVE_TEXT_FALLBACKS.signal),
  };
}

function normalizeLiveMatchesPresentation(matches) {
  if (!Array.isArray(matches)) {
    return [];
  }

  return matches
    .map((match) => normalizeLiveMatchPresentation(match))
    .filter(Boolean);
}

export {
  LIVE_TEXT_FALLBACKS,
  calculateAverageLivePressure,
  formatLiveMinute,
  formatLivePressure,
  getLiveMatchStage,
  getLivePressureTone,
  normalizeLiveMatchPresentation,
  normalizeLiveMatchesPresentation,
  normalizeLiveMinute,
};
