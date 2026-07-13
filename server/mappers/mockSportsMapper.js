const STATUS_MAP = Object.freeze({
  'Pre-jogo': 'scheduled',
  'Ao vivo': 'live',
});

function mapCompetition(competition) {
  return {
    schemaVersion: 'competition-read.v1',
    id: competition.id,
    name: competition.label,
    region: competition.region,
  };
}

function parseScore(score) {
  const parts = String(score ?? '').split('-').map((part) => Number(part.trim()));

  return parts.length === 2 && parts.every(Number.isInteger)
    ? { home: parts[0], away: parts[1] }
    : { home: null, away: null };
}

function mapMatch(match, competitionsByName) {
  const competition = competitionsByName.get(match.league);

  return {
    schemaVersion: 'match-read.v1',
    id: `match:internal:${match.id}`,
    competition: {
      id: competition?.id ?? null,
      name: match.league,
    },
    schedule: {
      date: null,
      time: match.time,
      timezone: null,
    },
    status: STATUS_MAP[match.status] ?? 'unknown',
    teams: {
      home: { id: null, name: match.home },
      away: { id: null, name: match.away },
    },
    score: parseScore(match.score),
    analysis: {
      signal: match.signal,
      confidence: match.confidence,
      metrics: [...match.metrics],
      probabilities: match.probabilities.map((probability) => ({ ...probability })),
      insight: match.insight,
    },
  };
}

export { mapCompetition, mapMatch };
