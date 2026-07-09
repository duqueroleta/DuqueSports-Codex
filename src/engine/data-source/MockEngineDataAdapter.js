import { markets } from '../../data/markets.js';
import { matches } from '../../data/matches.js';
import { runBatchAnalysis } from '../batch/BatchAnalysisService.js';

const MOCK_ENGINE_DATA_ADAPTER_MODEL = 'mock-engine-data-adapter-v1';

function createMockEngineDataAdapter() {
  const batchAnalysis = runBatchAnalysis(matches);

  return {
    model: MOCK_ENGINE_DATA_ADAPTER_MODEL,
    source: 'mock-local-dataset',
    freshness: 'mock-current-state',
    provider: 'duque-score-local',
    matches,
    markets,
    batchAnalysis,
    totals: {
      matches: matches.length,
      markets: markets.length,
      opportunities: batchAnalysis.opportunities.length,
    },
  };
}

export { MOCK_ENGINE_DATA_ADAPTER_MODEL, createMockEngineDataAdapter };
