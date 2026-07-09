import { matches } from '../../data/matches.js';

const MOCK_MATCHES_DATA_ADAPTER_MODEL = 'mock-matches-data-adapter-v1';

function createMockMatchesDataAdapter() {
  return {
    model: MOCK_MATCHES_DATA_ADAPTER_MODEL,
    source: 'mock-matches-dataset',
    freshness: 'mock-current-state',
    provider: 'duque-score-local',
    matches,
    totals: {
      matches: matches.length,
      liveMatches: matches.filter((match) => match.status === 'Ao vivo').length,
    },
  };
}

export { MOCK_MATCHES_DATA_ADAPTER_MODEL, createMockMatchesDataAdapter };
