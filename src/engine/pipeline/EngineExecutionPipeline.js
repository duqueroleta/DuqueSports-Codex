import { runEngineAuditLogService } from '../audit/EngineAuditLogService.js';
import { runExecutiveDashboardService } from '../batch/ExecutiveDashboardService.js';
import {
  exportEngineSnapshotToJson,
  importEngineSnapshotFromJson,
} from '../snapshot/EngineSnapshotJsonService.js';
import {
  getEngineSnapshotById,
  getEngineSnapshotHistory,
  saveEngineSnapshot,
} from '../snapshot/EngineSnapshotRepository.js';
import { runEngineSnapshotService } from '../snapshot/EngineSnapshotService.js';

function runEngineExecutionPipeline({ matches, markets, batchAnalysis }) {
  const executiveDashboard = runExecutiveDashboardService({ matches, markets, batchAnalysis });
  const engineSnapshot = runEngineSnapshotService({ matches, markets, batchAnalysis, executiveDashboard });
  const persistedSnapshot = saveEngineSnapshot(engineSnapshot);
  const snapshotHistory = getEngineSnapshotHistory();
  const recoveredSnapshot = getEngineSnapshotById(persistedSnapshot.snapshotId);
  const exportedSnapshotJson = exportEngineSnapshotToJson(persistedSnapshot);
  const importedSnapshotEnvelope = importEngineSnapshotFromJson(exportedSnapshotJson);
  const auditLog = runEngineAuditLogService({ snapshot: engineSnapshot, importedSnapshotEnvelope });

  return {
    model: 'engine-execution-pipeline-v1',
    status: auditLog.health === 'critical' ? 'blocked' : 'completed',
    batchAnalysis,
    executiveDashboard,
    engineSnapshot,
    persistedSnapshot,
    snapshotHistory,
    recoveredSnapshot,
    exportedSnapshotJson,
    importedSnapshotEnvelope,
    auditLog,
  };
}

export { runEngineExecutionPipeline };
