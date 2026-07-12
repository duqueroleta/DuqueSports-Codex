import { markets } from '../../../src/data/markets.js';
import { matches } from '../../../src/data/matches.js';
import { runExecutiveDashboardService } from '../../../src/engine/batch/ExecutiveDashboardService.js';
import { createMockEngineDataAdapter } from '../../../src/engine/data-source/MockEngineDataAdapter.js';
import { runEngineSnapshotService } from '../../../src/engine/snapshot/EngineSnapshotService.js';

function createMockDataSourceContract(mockEngineData) {
  return {
    model: mockEngineData.model,
    source: mockEngineData.source,
    freshness: mockEngineData.freshness,
    provider: mockEngineData.provider,
    validation: mockEngineData.validation,
    quarantine: mockEngineData.quarantine,
    totals: mockEngineData.totals,
  };
}

function createMockEngineTestContext() {
  const mockEngineData = createMockEngineDataAdapter();

  return {
    dataSource: createMockDataSourceContract(mockEngineData),
    markets,
    matches,
    mockEngineData,
  };
}

function createSnapshotTestContext() {
  const context = createMockEngineTestContext();
  const batchAnalysis = context.mockEngineData.batchAnalysis;
  const executiveDashboard = runExecutiveDashboardService({
    matches: context.matches,
    markets: context.markets,
    batchAnalysis,
  });
  const engineSnapshot = runEngineSnapshotService({
    matches: context.matches,
    markets: context.markets,
    batchAnalysis,
    executiveDashboard,
  });

  return {
    ...context,
    batchAnalysis,
    engineSnapshot,
    executiveDashboard,
  };
}

export {
  createMockDataSourceContract,
  createMockEngineTestContext,
  createSnapshotTestContext,
};
