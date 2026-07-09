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
import { createEnginePipelineApiResponse } from '../api/EnginePipelineApiContract.js';
import { runEngineExecutiveReportService } from './EngineExecutiveReportService.js';
import { resolveExecutionStatus } from './EngineExecutionStatusService.js';

function runEngineExecutionPipeline({ matches, markets, batchAnalysis }) {
  const executiveDashboard = runExecutiveDashboardService({ matches, markets, batchAnalysis });
  const engineSnapshot = runEngineSnapshotService({ matches, markets, batchAnalysis, executiveDashboard });
  const persistedSnapshot = saveEngineSnapshot(engineSnapshot);
  const snapshotHistory = getEngineSnapshotHistory();
  const recoveredSnapshot = getEngineSnapshotById(persistedSnapshot.snapshotId);
  const exportedSnapshotJson = exportEngineSnapshotToJson(persistedSnapshot);
  const importedSnapshotEnvelope = importEngineSnapshotFromJson(exportedSnapshotJson);
  const auditLog = runEngineAuditLogService({ snapshot: engineSnapshot, importedSnapshotEnvelope });
  const executionStatus = resolveExecutionStatus({ persistedSnapshot, importedSnapshotEnvelope, auditLog });
  const executiveReport = runEngineExecutiveReportService({
    executionStatus,
    executiveDashboard,
    engineSnapshot,
    auditLog,
  });

  const engineExecution = {
    model: 'engine-execution-pipeline-v1',
    status: executionStatus.status,
    executionStatus,
    executiveReport,
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

  return {
    ...engineExecution,
    apiResponse: createEnginePipelineApiResponse(engineExecution),
  };
}

export { runEngineExecutionPipeline };
