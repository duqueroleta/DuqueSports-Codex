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
import { runEnginePreflightService } from './EnginePreflightService.js';
import { createPreflightBlockedExecutionStatus, resolveExecutionStatus } from './EngineExecutionStatusService.js';

function runEngineExecutionPipeline({ matches, markets, batchAnalysis, dataSource = null }) {
  const preflight = runEnginePreflightService({ dataSource });

  if (!preflight.shouldContinue) {
    const executionStatus = createPreflightBlockedExecutionStatus(preflight);
    const blockedExecution = {
      model: 'engine-execution-pipeline-v1',
      status: executionStatus.status,
      preflight,
      executionStatus,
      executiveReport: null,
      dataSource,
      batchAnalysis,
      executiveDashboard: null,
      engineSnapshot: null,
      persistedSnapshot: null,
      snapshotHistory: [],
      recoveredSnapshot: null,
      exportedSnapshotJson: '',
      importedSnapshotEnvelope: null,
      auditLog: null,
    };

    return {
      ...blockedExecution,
      apiResponse: createEnginePipelineApiResponse(blockedExecution),
    };
  }

  const executiveDashboard = runExecutiveDashboardService({ matches, markets, batchAnalysis });
  const engineSnapshot = runEngineSnapshotService({ matches, markets, batchAnalysis, executiveDashboard });
  const persistedSnapshot = saveEngineSnapshot(engineSnapshot);
  const snapshotHistory = getEngineSnapshotHistory();
  const recoveredSnapshot = getEngineSnapshotById(persistedSnapshot.snapshotId);
  const exportedSnapshotJson = exportEngineSnapshotToJson(persistedSnapshot);
  const importedSnapshotEnvelope = importEngineSnapshotFromJson(exportedSnapshotJson);
  const auditLog = runEngineAuditLogService({ snapshot: engineSnapshot, importedSnapshotEnvelope });
  const executionStatus = resolveExecutionStatus({
    persistedSnapshot,
    importedSnapshotEnvelope,
    auditLog,
    dataSource,
  });
  const executiveReport = runEngineExecutiveReportService({
    executionStatus,
    executiveDashboard,
    engineSnapshot,
    auditLog,
  });

  const engineExecution = {
    model: 'engine-execution-pipeline-v1',
    status: executionStatus.status,
    preflight,
    executionStatus,
    executiveReport,
    dataSource,
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
