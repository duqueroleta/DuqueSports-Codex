import assert from 'node:assert/strict';
import { markets } from '../src/data/markets.js';
import { matches } from '../src/data/matches.js';
import { ALL_MARKETS, ALL_TIERS, filterBatchOpportunities, getBatchFilterOptions } from '../src/engine/batch/BatchFilters.js';
import { ALL_MARKET_COMPETITIONS, filterMarketRankings, runMarketRankingService } from '../src/engine/batch/MarketRankingService.js';
import { runMarketDetailIntelligence } from '../src/engine/batch/MarketDetailIntelligenceService.js';
import { runMarketAuditService } from '../src/engine/batch/MarketAuditService.js';
import { runMarketAuditDashboardService } from '../src/engine/batch/MarketAuditDashboardService.js';
import { runExecutiveDashboardService } from '../src/engine/batch/ExecutiveDashboardService.js';
import {
  getEngineSnapshotById,
  getEngineSnapshotHistory,
  resetEngineSnapshotRepository,
  saveEngineSnapshot,
} from '../src/engine/snapshot/EngineSnapshotRepository.js';
import {
  exportEngineSnapshotToJson,
  importEngineSnapshotFromJson,
  SNAPSHOT_JSON_FORMAT,
} from '../src/engine/snapshot/EngineSnapshotJsonService.js';
import {
  assessEngineSnapshotCompatibility,
  validateEngineSnapshotSchema,
} from '../src/engine/snapshot/EngineSnapshotSchemaService.js';
import { migrateEngineSnapshotToCurrentVersion } from '../src/engine/snapshot/EngineSnapshotMigrationService.js';
import { runEngineSnapshotService } from '../src/engine/snapshot/EngineSnapshotService.js';
import { runEngineAuditLogService } from '../src/engine/audit/EngineAuditLogService.js';
import { runEngineExecutiveReportService } from '../src/engine/pipeline/EngineExecutiveReportService.js';
import { runEngineExecutionPipeline } from '../src/engine/pipeline/EngineExecutionPipeline.js';
import { resolveExecutionStatus } from '../src/engine/pipeline/EngineExecutionStatusService.js';
import { createEnginePipelineApiResponse } from '../src/engine/api/EnginePipelineApiContract.js';
import { createMockEngineDataAdapter } from '../src/engine/data-source/MockEngineDataAdapter.js';
import { adaptMatchToEngineInput } from '../src/engine/adapters/mockMatchAdapter.js';
import { runBatchAnalysis } from '../src/engine/batch/BatchAnalysisService.js';
import { runProbabilityCalibrationEngine } from '../src/engine/calibration/ProbabilityCalibrationEngine.js';
import { runDataQuality } from '../src/engine/data-quality/DataQualityEngine.js';
import { FEATURE_CATALOG } from '../src/engine/feature-store/featureCatalog.js';
import { runProjectionPipeline } from '../src/engine/projection/ProjectionPipeline.js';
import { runPoissonEngine } from '../src/engine/statistical/PoissonEngine.js';

const sampleMatch = matches[0];
const engineInput = adaptMatchToEngineInput(sampleMatch);
const dataQuality = runDataQuality(engineInput);
const projection = runProjectionPipeline(engineInput);

assert.equal(dataQuality.passed, true, 'Data Quality should approve the sample match');
assert.equal(projection.blocked, undefined, 'Projection should not be blocked');
assert.ok(projection.expectedHomeGoals > 0, 'Expected home goals should be positive');
assert.ok(projection.expectedAwayGoals > 0, 'Expected away goals should be positive');
assert.ok(projection.confidence >= 0 && projection.confidence <= 100, 'Confidence should stay within 0-100');
assert.ok(projection.probabilities.over25 >= 1 && projection.probabilities.over25 <= 98, 'Over 2.5 probability should be calibrated');
assert.ok(projection.probabilities.btts >= 1 && projection.probabilities.btts <= 98, 'BTTS probability should be calibrated');
assert.equal(projection.trace.recency.home.sampleSize, 5, 'Recency Engine should use five recent matches');
assert.equal(FEATURE_CATALOG.length, 6, 'Feature catalog should expose six phase-two features');
assert.equal(projection.trace.featureStore.valid, true, 'Feature Store snapshot should be valid');
assert.equal(projection.trace.featureStore.catalogSize, 6, 'Projection trace should include the Feature Store catalog size');
assert.ok(
  projection.trace.featureStore.features.home.some((feature) => feature.featureId === 'adjusted_xg'),
  'Feature Store should register home adjusted_xg',
);
assert.ok(
  projection.trace.featureStore.features.match.some((feature) => feature.featureId === 'xg_differential'),
  'Feature Store should register match xg_differential',
);
assert.equal(projection.trace.statistical.poisson.model, 'poisson-goals-v1', 'Projection should use Poisson statistical core');
assert.ok(projection.trace.statistical.poisson.matrix.length > 0, 'Poisson Engine should expose a score matrix');
assert.ok(
  projection.trace.statistical.poisson.correctScore.probability > 0,
  'Poisson Engine should expose the most likely scoreline',
);
assert.equal(projection.trace.calibration.model, 'probability-calibration-v1', 'Projection should use probability calibration');
assert.ok(
  projection.trace.calibration.reliability >= 0.35 && projection.trace.calibration.reliability <= 0.92,
  'Calibration reliability should stay within defined bounds',
);
assert.equal(projection.trace.explainability.model, 'explanation-engine-v1', 'Projection should use the Explanation Engine');
assert.equal(projection.aiExplanation.model, 'explanation-engine-v1', 'Projection should expose AI explanation');
assert.ok(projection.aiExplanation.keyDrivers.length >= 3, 'AI explanation should expose key drivers');
assert.ok(projection.aiExplanation.riskFlags.length >= 1, 'AI explanation should expose risk flags');
assert.equal(projection.trace.ranking.model, 'opportunity-ranking-v1', 'Projection should use Opportunity Ranking Engine');
assert.ok(projection.opportunityRanking.opportunityScore >= 0, 'Opportunity score should be non-negative');
assert.ok(projection.opportunityRanking.opportunityScore <= 100, 'Opportunity score should stay within 0-100');
assert.ok(projection.opportunityRanking.tier.length > 0, 'Opportunity ranking should expose a tier');

const poisson = runPoissonEngine({ homeLambda: 1.8, awayLambda: 1.1 });
const oneXTwoTotal = poisson.probabilities.homeWin + poisson.probabilities.draw + poisson.probabilities.awayWin;
const totalsMarket = poisson.probabilities.over25 + poisson.probabilities.under25;
const calibration = runProbabilityCalibrationEngine({
  probabilities: poisson.probabilities,
  dataQualityScore: 88,
  confidence: 81,
});
const calibratedOneXTwoTotal = calibration.probabilities.homeWin + calibration.probabilities.draw + calibration.probabilities.awayWin;
const calibratedTotalsMarket = calibration.probabilities.over25 + calibration.probabilities.under25;

assert.ok(Math.abs(oneXTwoTotal - 100) <= 0.2, 'Poisson 1X2 probabilities should sum to 100');
assert.ok(Math.abs(totalsMarket - 100) <= 0.2, 'Poisson totals market should sum to 100');
assert.ok(Math.abs(calibratedOneXTwoTotal - 100) <= 0.2, 'Calibrated 1X2 probabilities should sum to 100');
assert.ok(Math.abs(calibratedTotalsMarket - 100) <= 0.2, 'Calibrated totals market should sum to 100');

const batchAnalysis = runBatchAnalysis(matches);
const mockEngineData = createMockEngineDataAdapter();

assert.equal(batchAnalysis.model, 'batch-analysis-service-v1', 'Batch Analysis Service should expose its model');
assert.equal(batchAnalysis.analyzedMatches, matches.length, 'Batch Analysis Service should process every mock match');
assert.equal(batchAnalysis.topOpportunities.length, 5, 'Batch Analysis Service should expose top five opportunities');
assert.ok(
  batchAnalysis.topOpportunities[0].opportunityScore >= batchAnalysis.topOpportunities[1].opportunityScore,
  'Batch Analysis Service should sort opportunities by score',
);
assert.equal(mockEngineData.model, 'mock-engine-data-adapter-v1', 'Mock data adapter should expose its model');
assert.equal(mockEngineData.matches.length, matches.length, 'Mock data adapter should expose matches');
assert.equal(mockEngineData.markets.length, markets.length, 'Mock data adapter should expose markets');
assert.equal(mockEngineData.batchAnalysis.analyzedMatches, matches.length, 'Mock data adapter should expose batch analysis');
const batchFilterOptions = getBatchFilterOptions(batchAnalysis.opportunities);
const eliteOpportunities = filterBatchOpportunities(batchAnalysis.opportunities, { tier: 'Elite', market: ALL_MARKETS });

assert.ok(batchFilterOptions.tiers.includes(ALL_TIERS), 'Batch filters should expose all tiers option');
assert.ok(batchFilterOptions.markets.includes(ALL_MARKETS), 'Batch filters should expose all markets option');
assert.ok(eliteOpportunities.every((opportunity) => opportunity.tier === 'Elite'), 'Batch tier filter should narrow opportunities');
const marketRanking = runMarketRankingService(batchAnalysis.opportunities);
const filteredMarketRanking = filterMarketRankings(marketRanking.rankings, ALL_MARKET_COMPETITIONS);

assert.equal(marketRanking.model, 'market-ranking-service-v1', 'Market Ranking Service should expose its model');
assert.ok(marketRanking.rankings.length > 0, 'Market Ranking Service should expose market rankings');
assert.equal(filteredMarketRanking.length, marketRanking.rankings.length, 'All competitions filter should preserve market rankings');
const marketDetailIntelligence = runMarketDetailIntelligence({
  market: markets[0],
  opportunities: batchAnalysis.opportunities,
});

assert.equal(
  marketDetailIntelligence.model,
  'market-detail-intelligence-v1',
  'Market Detail Intelligence should expose its model',
);
assert.ok(
  marketDetailIntelligence.summary.relatedGames >= 0,
  'Market Detail Intelligence should expose related games count',
);
assert.equal(
  marketDetailIntelligence.audit.model,
  'market-audit-service-v1',
  'Market Detail Intelligence should expose simulated audit',
);
const marketAudit = runMarketAuditService({
  market: markets[0],
  relatedOpportunities: marketDetailIntelligence.relatedOpportunities,
});

assert.ok(marketAudit.hitRate >= 42 && marketAudit.hitRate <= 88, 'Market audit hit rate should stay calibrated');
assert.ok(marketAudit.stabilityScore >= 35 && marketAudit.stabilityScore <= 94, 'Market audit stability should stay bounded');
const auditDashboard = runMarketAuditDashboardService({ markets, opportunities: batchAnalysis.opportunities });

assert.equal(auditDashboard.model, 'market-audit-dashboard-v1', 'Market audit dashboard should expose its model');
assert.equal(auditDashboard.marketAudits.length, markets.length, 'Market audit dashboard should audit every market');
assert.ok(auditDashboard.averageHitRate >= 42, 'Market audit dashboard should expose average hit rate');
const executiveDashboard = runExecutiveDashboardService({ matches, markets, batchAnalysis });

assert.equal(executiveDashboard.model, 'executive-dashboard-service-v1', 'Executive dashboard should expose its model');
assert.equal(executiveDashboard.totals.matches, matches.length, 'Executive dashboard should count matches');
assert.equal(executiveDashboard.totals.auditedMarkets, markets.length, 'Executive dashboard should count audited markets');
const engineSnapshot = runEngineSnapshotService({ matches, markets, batchAnalysis, executiveDashboard });

assert.equal(engineSnapshot.model, 'engine-snapshot-service-v1', 'Engine snapshot should expose its model');
assert.ok(engineSnapshot.snapshotId.includes('duque-score-engine-v1.phase-24'), 'Engine snapshot should include engine version');
assert.equal(engineSnapshot.topOpportunities.length, 3, 'Engine snapshot should preserve top opportunities');
const snapshotSchemaValidation = validateEngineSnapshotSchema(engineSnapshot);
const snapshotCompatibility = assessEngineSnapshotCompatibility(engineSnapshot);
const legacySnapshot = {
  ...engineSnapshot,
  engineVersion: 'duque-score-engine-v1.phase-16',
  snapshotId: engineSnapshot.snapshotId.replace('phase-24', 'phase-16'),
};
const migratedLegacySnapshot = migrateEngineSnapshotToCurrentVersion(legacySnapshot);
resetEngineSnapshotRepository();
const savedSnapshot = saveEngineSnapshot(engineSnapshot);
const recoveredSnapshot = getEngineSnapshotById(engineSnapshot.snapshotId);
const snapshotHistory = getEngineSnapshotHistory();
const exportedSnapshotJson = exportEngineSnapshotToJson(engineSnapshot);
const importedSnapshotEnvelope = importEngineSnapshotFromJson(exportedSnapshotJson);
const engineAuditLog = runEngineAuditLogService({ snapshot: engineSnapshot, importedSnapshotEnvelope });
const directExecutionStatus = resolveExecutionStatus({
  persistedSnapshot: engineSnapshot,
  importedSnapshotEnvelope,
  auditLog: engineAuditLog,
});
const directExecutiveReport = runEngineExecutiveReportService({
  executionStatus: directExecutionStatus,
  executiveDashboard,
  engineSnapshot,
  auditLog: engineAuditLog,
});

assert.equal(savedSnapshot.snapshotId, engineSnapshot.snapshotId, 'Snapshot repository should save snapshots by ID');
assert.equal(recoveredSnapshot.snapshotId, engineSnapshot.snapshotId, 'Snapshot repository should recover snapshots by ID');
assert.equal(snapshotHistory.length, 1, 'Snapshot repository should expose memory history');
assert.equal(snapshotSchemaValidation.valid, true, 'Snapshot schema should be valid');
assert.equal(snapshotCompatibility.compatible, true, 'Snapshot should be compatible with current engine');
assert.equal(snapshotCompatibility.migrationRequired, false, 'Current snapshot should not require migration');
assert.equal(migratedLegacySnapshot.migrated, true, 'Legacy snapshot should be migrated');
assert.equal(
  migratedLegacySnapshot.snapshot.engineVersion,
  engineSnapshot.engineVersion,
  'Legacy snapshot migration should update engine version',
);
assert.equal(importedSnapshotEnvelope.format, SNAPSHOT_JSON_FORMAT, 'Snapshot JSON should expose its format');
assert.equal(importedSnapshotEnvelope.schemaValidation.valid, true, 'Imported Snapshot JSON should include schema validation');
assert.equal(importedSnapshotEnvelope.compatibility.status, 'current', 'Imported Snapshot JSON should be current');
assert.equal(importedSnapshotEnvelope.migration.reason, 'already-current', 'Imported current snapshot should skip migration');
assert.equal(importedSnapshotEnvelope.snapshot.snapshotId, engineSnapshot.snapshotId, 'Snapshot JSON should preserve snapshot ID');
assert.equal(
  importedSnapshotEnvelope.snapshot.engineVersion,
  engineSnapshot.engineVersion,
  'Snapshot JSON should preserve engine version',
);
assert.equal(engineAuditLog.model, 'engine-audit-log-v1', 'Engine audit log should expose its model');
assert.equal(engineAuditLog.totalEvents, 3, 'Engine audit log should register key snapshot events');
assert.equal(engineAuditLog.health, 'healthy', 'Current audit log should be healthy');
assert.ok(
  engineAuditLog.events.some((event) => event.type === 'snapshot.migration.evaluated'),
  'Engine audit log should register migration evaluation',
);
assert.equal(directExecutiveReport.model, 'engine-executive-report-v1', 'Executive report should expose its model');
assert.equal(directExecutiveReport.status, 'completed', 'Executive report should inherit execution status');
assert.equal(directExecutiveReport.summary.matches, matches.length, 'Executive report should summarize matches');
assert.ok(directExecutiveReport.recommendation.length > 0, 'Executive report should expose recommendation');
resetEngineSnapshotRepository();
const engineExecution = runEngineExecutionPipeline({
  matches: mockEngineData.matches,
  markets: mockEngineData.markets,
  batchAnalysis: mockEngineData.batchAnalysis,
  dataSource: {
    model: mockEngineData.model,
    source: mockEngineData.source,
    freshness: mockEngineData.freshness,
    provider: mockEngineData.provider,
    totals: mockEngineData.totals,
  },
});

assert.equal(engineExecution.model, 'engine-execution-pipeline-v1', 'Engine execution pipeline should expose its model');
assert.equal(engineExecution.status, 'completed', 'Engine execution pipeline should complete healthy runs');
assert.equal(engineExecution.executionStatus.model, 'engine-execution-status-v1', 'Pipeline should expose execution status contract');
assert.equal(engineExecution.executionStatus.messages.length, 1, 'Healthy pipeline should expose one status message');
assert.equal(engineExecution.executiveReport.model, 'engine-executive-report-v1', 'Pipeline should expose executive report');
assert.equal(engineExecution.executiveReport.health, 'healthy', 'Pipeline executive report should expose health');
assert.equal(engineExecution.apiResponse.model, 'engine-pipeline-api-contract-v1', 'Pipeline should expose API contract');
assert.equal(engineExecution.apiResponse.statusCode, 200, 'Healthy API contract should expose HTTP 200');
assert.equal(engineExecution.apiResponse.data.snapshot.snapshotId, engineExecution.engineSnapshot.snapshotId, 'API contract should expose snapshot');
assert.equal(engineExecution.dataSource.model, 'mock-engine-data-adapter-v1', 'Pipeline should preserve data source contract');
assert.equal(engineExecution.apiResponse.data.dataSource.source, 'mock-local-dataset', 'API contract should expose data source');
assert.equal(engineExecution.executiveDashboard.totals.matches, matches.length, 'Pipeline should include executive dashboard');
assert.equal(engineExecution.persistedSnapshot.snapshotId, engineExecution.engineSnapshot.snapshotId, 'Pipeline should persist snapshot');
assert.equal(engineExecution.importedSnapshotEnvelope.compatibility.status, 'current', 'Pipeline should import current snapshot');
assert.equal(engineExecution.auditLog.totalEvents, 3, 'Pipeline should include audit events');
const partialExecutionStatus = resolveExecutionStatus({
  persistedSnapshot: engineSnapshot,
  importedSnapshotEnvelope: {
    ...importedSnapshotEnvelope,
    migration: {
      ...importedSnapshotEnvelope.migration,
      migrated: true,
    },
  },
  auditLog: engineAuditLog,
});
const blockedExecutionStatus = resolveExecutionStatus({
  persistedSnapshot: null,
  importedSnapshotEnvelope,
  auditLog: {
    ...engineAuditLog,
    health: 'critical',
  },
});

assert.equal(partialExecutionStatus.status, 'partial', 'Execution status should expose partial runs');
assert.equal(blockedExecutionStatus.status, 'blocked', 'Execution status should expose blocked runs');
const blockedApiResponse = createEnginePipelineApiResponse({
  ...engineExecution,
  status: 'blocked',
});

assert.equal(blockedApiResponse.statusCode, 409, 'Blocked API contract should expose HTTP 409');

console.log('DUQUE Engine Phase 1-24 tests passed');
