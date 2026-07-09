const ENGINE_PIPELINE_API_CONTRACT_MODEL = 'engine-pipeline-api-contract-v1';

function createEnginePipelineApiResponse(engineExecution) {
  return {
    model: ENGINE_PIPELINE_API_CONTRACT_MODEL,
    endpoint: '/api/v1/engine/pipeline',
    method: 'GET',
    statusCode: engineExecution.status === 'blocked' ? 409 : 200,
    generatedAt: 'mock-api-response-current-state',
    data: {
      status: engineExecution.status,
      preflight: engineExecution.preflight,
      executionStatus: engineExecution.executionStatus,
      executiveReport: engineExecution.executiveReport,
      snapshot: engineExecution.engineSnapshot
        ? {
          snapshotId: engineExecution.engineSnapshot.snapshotId,
          engineVersion: engineExecution.engineSnapshot.engineVersion,
          scope: engineExecution.engineSnapshot.scope,
        }
        : null,
      totals: engineExecution.executiveDashboard?.totals ?? null,
      topOpportunities: engineExecution.engineSnapshot?.topOpportunities ?? [],
      audit: engineExecution.auditLog
        ? {
          health: engineExecution.auditLog.health,
          totalEvents: engineExecution.auditLog.totalEvents,
        }
        : null,
      dataSource: engineExecution.dataSource,
    },
    meta: {
      mock: true,
      persistence: 'memory',
      transport: 'local-contract',
    },
  };
}

export { ENGINE_PIPELINE_API_CONTRACT_MODEL, createEnginePipelineApiResponse };
