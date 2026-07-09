import { runBatchAnalysis } from '../batch/BatchAnalysisService.js';
import { createMockAuditsDataAdapter } from './MockAuditsDataAdapter.js';
import { createMockMarketsDataAdapter } from './MockMarketsDataAdapter.js';
import { createMockMatchesDataAdapter } from './MockMatchesDataAdapter.js';

const MOCK_ENGINE_DATA_ADAPTER_MODEL = 'mock-engine-data-adapter-v1';

function createMockEngineDataAdapter() {
  const matchesData = createMockMatchesDataAdapter();
  const marketsData = createMockMarketsDataAdapter();
  const auditsData = createMockAuditsDataAdapter();
  const batchAnalysis = runBatchAnalysis(matchesData.matches);

  return {
    model: MOCK_ENGINE_DATA_ADAPTER_MODEL,
    source: 'mock-local-dataset',
    freshness: 'mock-current-state',
    provider: 'duque-score-local',
    adapters: {
      matches: matchesData,
      markets: marketsData,
      audits: auditsData,
    },
    matches: matchesData.matches,
    markets: marketsData.markets,
    audits: auditsData.audits,
    batchAnalysis,
    totals: {
      matches: matchesData.totals.matches,
      markets: marketsData.totals.markets,
      audits: auditsData.totals.audits,
      opportunities: batchAnalysis.opportunities.length,
    },
  };
}

export { MOCK_ENGINE_DATA_ADAPTER_MODEL, createMockEngineDataAdapter };
