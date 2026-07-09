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
      executionStatus: engineExecution.executionStatus,
      executiveReport: engineExecution.executiveReport,
      snapshot: {
        snapshotId: engineExecution.engineSnapshot.snapshotId,
        engineVersion: engineExecution.engineSnapshot.engineVersion,
        scope: engineExecution.engineSnapshot.scope,
      },
      totals: engineExecution.executiveDashboard.totals,
      topOpportunities: engineExecution.engineSnapshot.topOpportunities,
      audit: {
        health: engineExecution.auditLog.health,
        totalEvents: engineExecution.auditLog.totalEvents,
      },
    },
    meta: {
      mock: true,
      persistence: 'memory',
      transport: 'local-contract',
    },
  };
}

export { ENGINE_PIPELINE_API_CONTRACT_MODEL, createEnginePipelineApiResponse };
