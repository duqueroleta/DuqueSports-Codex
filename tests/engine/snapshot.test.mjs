import assert from 'node:assert/strict';
import { runEngineAuditLogService } from '../../src/engine/audit/EngineAuditLogService.js';
import { ENGINE_VERSION } from '../../src/engine/core/contracts.js';
import { runEngineExecutiveReportService } from '../../src/engine/pipeline/EngineExecutiveReportService.js';
import { resolveExecutionStatus } from '../../src/engine/pipeline/EngineExecutionStatusService.js';
import {
  exportEngineSnapshotToJson,
  importEngineSnapshotFromJson,
  SNAPSHOT_JSON_FORMAT,
} from '../../src/engine/snapshot/EngineSnapshotJsonService.js';
import { migrateEngineSnapshotToCurrentVersion } from '../../src/engine/snapshot/EngineSnapshotMigrationService.js';
import {
  getEngineSnapshotById,
  getEngineSnapshotHistory,
  resetEngineSnapshotRepository,
  saveEngineSnapshot,
} from '../../src/engine/snapshot/EngineSnapshotRepository.js';
import {
  assessEngineSnapshotCompatibility,
  validateEngineSnapshotSchema,
} from '../../src/engine/snapshot/EngineSnapshotSchemaService.js';
import { createSnapshotTestContext } from './fixtures/engineTestContext.mjs';

const {
  engineSnapshot,
  executiveDashboard,
  matches,
  mockEngineData,
} = createSnapshotTestContext();

assert.equal(engineSnapshot.model, 'engine-snapshot-service-v1', 'Engine snapshot should expose its model');
assert.ok(engineSnapshot.snapshotId.includes(ENGINE_VERSION), 'Engine snapshot should include engine version');
assert.equal(engineSnapshot.topOpportunities.length, 3, 'Engine snapshot should preserve top opportunities');

const snapshotSchemaValidation = validateEngineSnapshotSchema(engineSnapshot);
const snapshotCompatibility = assessEngineSnapshotCompatibility(engineSnapshot);
const legacySnapshot = {
  ...engineSnapshot,
  engineVersion: 'duque-score-engine-v1.phase-16',
  snapshotId: engineSnapshot.snapshotId.replace(ENGINE_VERSION, 'duque-score-engine-v1.phase-16'),
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
  dataSource: mockEngineData,
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

console.log('Engine snapshot tests passed');
