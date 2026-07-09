import { markets } from '../../data/markets.js';
import { validateMarketsData } from './DataAdapterValidationService.js';

const MOCK_MARKETS_DATA_ADAPTER_MODEL = 'mock-markets-data-adapter-v1';

function createMockMarketsDataAdapter() {
  const validation = validateMarketsData(markets);

  return {
    model: MOCK_MARKETS_DATA_ADAPTER_MODEL,
    source: 'mock-markets-dataset',
    freshness: 'mock-current-state',
    provider: 'duque-score-local',
    validation,
    markets,
    totals: {
      markets: markets.length,
      approvedMarkets: markets.filter((market) => ['Aprovado', 'Consistente'].includes(market.audit)).length,
    },
  };
}

export { MOCK_MARKETS_DATA_ADAPTER_MODEL, createMockMarketsDataAdapter };
