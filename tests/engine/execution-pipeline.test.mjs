import assert from 'node:assert/strict';
import { createEnginePipelineApiResponse } from '../../src/engine/api/EnginePipelineApiContract.js';
import { createDataAdapterQuarantine } from '../../src/engine/data-source/DataAdapterQuarantineService.js';
import { validateMatchesData } from '../../src/engine/data-source/DataAdapterValidationService.js';
import { createMockMarketsDataAdapter } from '../../src/engine/data-source/MockMarketsDataAdapter.js';
import { runEngineExecutionPipeline } from '../../src/engine/pipeline/EngineExecutionPipeline.js';
import { resolveExecutionStatus } from '../../src/engine/pipeline/EngineExecutionStatusService.js';
import { resetEngineSnapshotRepository } from '../../src/engine/snapshot/EngineSnapshotRepository.js';
import { createMockEngineTestContext } from './fixtures/engineTestContext.mjs';

const { dataSource, markets, mockEngineData } = createMockEngineTestContext();
const mockMarketsData = createMockMarketsDataAdapter();
const invalidMatchesValidation = validateMatchesData([{ id: 'broken-match' }]);
const invalidAdapterQuarantine = createDataAdapterQuarantine({
  source: 'test-invalid-source',
  validations: [invalidMatchesValidation, mockMarketsData.validation],
});
const warningAdapterQuarantine = {
  ...mockEngineData.quarantine,
  status: 'warning',
  rejectedItems: 1,
  rejectedRecords: [
    {
      id: 'markets-warning-1',
      entityName: 'markets',
      severity: 'warning',
      action: 'review-record',
      reason: 'market odds freshness near tolerance limit',
    },
  ],
};

resetEngineSnapshotRepository();

const engineExecution = runEngineExecutionPipeline({
  matches: mockEngineData.matches,
  markets: mockEngineData.markets,
  batchAnalysis: mockEngineData.batchAnalysis,
  dataSource,
});

assert.equal(engineExecution.model, 'engine-execution-pipeline-v1', 'Engine execution pipeline should expose its model');
assert.equal(engineExecution.status, 'completed', 'Engine execution pipeline should complete healthy runs');
assert.equal(engineExecution.preflight.status, 'passed', 'Healthy pipeline should pass preflight');
assert.equal(engineExecution.executionStatus.model, 'engine-execution-status-v1', 'Pipeline should expose execution status contract');
assert.equal(engineExecution.executionStatus.messages.length, 1, 'Healthy pipeline should expose one status message');
assert.equal(engineExecution.executiveReport.model, 'engine-executive-report-v1', 'Pipeline should expose executive report');
assert.equal(engineExecution.executiveReport.health, 'healthy', 'Pipeline executive report should expose health');
assert.equal(engineExecution.apiResponse.model, 'engine-pipeline-api-contract-v1', 'Pipeline should expose API contract');
assert.equal(engineExecution.apiResponse.statusCode, 200, 'Healthy API contract should expose HTTP 200');
assert.equal(engineExecution.apiResponse.data.snapshot.snapshotId, engineExecution.engineSnapshot.snapshotId, 'API contract should expose snapshot');
assert.equal(engineExecution.dataSource.model, 'mock-engine-data-adapter-v1', 'Pipeline should preserve data source contract');
assert.equal(engineExecution.dataSource.validation.valid, true, 'Pipeline should preserve data source validation');
assert.equal(engineExecution.dataSource.quarantine.status, 'clear', 'Pipeline should preserve data source quarantine');
assert.equal(engineExecution.apiResponse.data.dataSource.source, 'mock-local-dataset', 'API contract should expose data source');
assert.equal(engineExecution.apiResponse.data.dataSource.quarantine.rejectedItems, 0, 'API contract should expose quarantine');
assert.equal(engineExecution.apiResponse.data.dataSource.totals.audits, markets.length, 'API contract should expose audits total');
assert.equal(engineExecution.executiveDashboard.totals.matches, mockEngineData.matches.length, 'Pipeline should include executive dashboard');
assert.equal(engineExecution.persistedSnapshot.snapshotId, engineExecution.engineSnapshot.snapshotId, 'Pipeline should persist snapshot');
assert.equal(engineExecution.importedSnapshotEnvelope.compatibility.status, 'current', 'Pipeline should import current snapshot');
assert.equal(engineExecution.auditLog.totalEvents, 3, 'Pipeline should include audit events');

const partialExecutionStatus = resolveExecutionStatus({
  persistedSnapshot: engineExecution.engineSnapshot,
  importedSnapshotEnvelope: {
    ...engineExecution.importedSnapshotEnvelope,
    migration: {
      ...engineExecution.importedSnapshotEnvelope.migration,
      migrated: true,
    },
  },
  auditLog: engineExecution.auditLog,
});
const blockedExecutionStatus = resolveExecutionStatus({
  persistedSnapshot: null,
  importedSnapshotEnvelope: engineExecution.importedSnapshotEnvelope,
  auditLog: {
    ...engineExecution.auditLog,
    health: 'critical',
  },
});
const invalidDataSource = {
  model: mockEngineData.model,
  source: 'invalid-mock-local-dataset',
  freshness: mockEngineData.freshness,
  provider: mockEngineData.provider,
  validation: invalidMatchesValidation,
  quarantine: invalidAdapterQuarantine,
  totals: mockEngineData.totals,
};
const blockedByDataSourceStatus = resolveExecutionStatus({
  persistedSnapshot: engineExecution.engineSnapshot,
  importedSnapshotEnvelope: engineExecution.importedSnapshotEnvelope,
  auditLog: engineExecution.auditLog,
  dataSource: invalidDataSource,
});
const blockedDataSourceExecution = runEngineExecutionPipeline({
  matches: mockEngineData.matches,
  markets: mockEngineData.markets,
  batchAnalysis: mockEngineData.batchAnalysis,
  dataSource: invalidDataSource,
});
const warningDataSourceExecution = runEngineExecutionPipeline({
  matches: mockEngineData.matches,
  markets: mockEngineData.markets,
  batchAnalysis: mockEngineData.batchAnalysis,
  dataSource: {
    ...invalidDataSource,
    validation: mockEngineData.validation,
    quarantine: warningAdapterQuarantine,
  },
});

assert.equal(partialExecutionStatus.status, 'partial', 'Execution status should expose partial runs');
assert.equal(blockedExecutionStatus.status, 'blocked', 'Execution status should expose blocked runs');
assert.equal(blockedByDataSourceStatus.status, 'blocked', 'Invalid data source should block execution status');
assert.ok(
  blockedByDataSourceStatus.messages.some((message) => message.code === 'data-source.validation.invalid'),
  'Invalid data source should expose validation message',
);
assert.equal(blockedDataSourceExecution.status, 'blocked', 'Pipeline should block invalid data sources');
assert.equal(blockedDataSourceExecution.preflight.status, 'blocked', 'Pipeline should block invalid data sources at preflight');
assert.equal(blockedDataSourceExecution.engineSnapshot, null, 'Preflight block should skip snapshot generation');
assert.equal(blockedDataSourceExecution.executiveDashboard, null, 'Preflight block should skip executive dashboard generation');
assert.equal(blockedDataSourceExecution.auditLog, null, 'Preflight block should skip audit generation');
assert.equal(blockedDataSourceExecution.apiResponse.statusCode, 409, 'Blocked data source API response should expose HTTP 409');
assert.equal(blockedDataSourceExecution.apiResponse.data.snapshot, null, 'Blocked preflight API response should omit snapshot');
assert.equal(blockedDataSourceExecution.apiResponse.data.topOpportunities.length, 0, 'Blocked preflight API response should omit opportunities');
assert.ok(
  blockedDataSourceExecution.executionStatus.messages.some((message) => message.code === 'preflight.quarantine.blocked'),
  'Preflight block should expose quarantine message',
);
assert.equal(warningDataSourceExecution.preflight.status, 'warning', 'Warning quarantine should expose warning preflight');
assert.equal(warningDataSourceExecution.preflight.shouldContinue, true, 'Warning quarantine should keep pipeline running');
assert.equal(warningDataSourceExecution.status, 'completed', 'Warning quarantine should not block execution');
assert.equal(warningDataSourceExecution.apiResponse.statusCode, 200, 'Warning quarantine should keep API response healthy');
assert.ok(
  warningDataSourceExecution.preflight.messages.some((message) => message.code === 'preflight.quarantine.warning'),
  'Warning quarantine should expose preflight warning message',
);
assert.equal(
  warningDataSourceExecution.preflight.severityPolicy.toleratesWarnings,
  true,
  'Preflight policy should document warning tolerance',
);

const blockedApiResponse = createEnginePipelineApiResponse({
  ...engineExecution,
  status: 'blocked',
});

assert.equal(blockedApiResponse.statusCode, 409, 'Blocked API contract should expose HTTP 409');

resetEngineSnapshotRepository();

console.log('Engine execution pipeline tests passed');
