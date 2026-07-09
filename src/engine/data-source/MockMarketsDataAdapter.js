import { markets } from '../../data/markets.js';

const MOCK_MARKETS_DATA_ADAPTER_MODEL = 'mock-markets-data-adapter-v1';

function createMockMarketsDataAdapter() {
  return {
    model: MOCK_MARKETS_DATA_ADAPTER_MODEL,
    source: 'mock-markets-dataset',
    freshness: 'mock-current-state',
    provider: 'duque-score-local',
    markets,
    totals: {
      markets: markets.length,
      approvedMarkets: markets.filter((market) => ['Aprovado', 'Consistente'].includes(market.audit)).length,
    },
  };
}

export { MOCK_MARKETS_DATA_ADAPTER_MODEL, createMockMarketsDataAdapter };
