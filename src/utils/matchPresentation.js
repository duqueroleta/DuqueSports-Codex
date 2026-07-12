const MATCH_TEXT_FALLBACKS = Object.freeze({
  away: 'Visitante',
  home: 'Mandante',
  insight: 'Analise detalhada indisponivel para esta partida.',
  league: 'Competicao nao informada',
  score: '-',
  signal: 'Analise indisponivel',
  status: 'Status indisponivel',
  time: '--:--',
});

function normalizeText(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  return value.trim();
}

function normalizeMatchPresentation(match) {
  if (!match || typeof match !== 'object' || Array.isArray(match)) {
    return null;
  }

  return {
    ...match,
    away: normalizeText(match.away, MATCH_TEXT_FALLBACKS.away),
    home: normalizeText(match.home, MATCH_TEXT_FALLBACKS.home),
    insight: normalizeText(match.insight, MATCH_TEXT_FALLBACKS.insight),
    league: normalizeText(match.league, MATCH_TEXT_FALLBACKS.league),
    score: normalizeText(match.score, MATCH_TEXT_FALLBACKS.score),
    signal: normalizeText(match.signal, MATCH_TEXT_FALLBACKS.signal),
    status: normalizeText(match.status, MATCH_TEXT_FALLBACKS.status),
    time: normalizeText(match.time, MATCH_TEXT_FALLBACKS.time),
  };
}

function normalizeMatchesPresentation(matches) {
  if (!Array.isArray(matches)) {
    return [];
  }

  return matches
    .map((match) => normalizeMatchPresentation(match))
    .filter(Boolean);
}

export {
  MATCH_TEXT_FALLBACKS,
  normalizeMatchPresentation,
  normalizeMatchesPresentation,
  normalizeText,
};
