const HEALTH_SCHEMA_VERSION = 'health-read.v1';
const SERVICE_NAME = 'duque-score-api';
const SERVICE_VERSION = 'platform.phase-94';

function createHealthSnapshot({
  checkedAt,
  startedAt,
  serviceVersion = SERVICE_VERSION,
  requestMetrics = { active: 0, totalStarted: 0 },
}) {
  const checkedTime = checkedAt.getTime();
  const startedTime = startedAt.getTime();
  const uptimeSeconds = Math.max(0, Math.floor((checkedTime - startedTime) / 1000));

  return Object.freeze({
    schemaVersion: HEALTH_SCHEMA_VERSION,
    status: 'healthy',
    service: Object.freeze({
      name: SERVICE_NAME,
      version: serviceVersion,
    }),
    time: Object.freeze({
      startedAt: startedAt.toISOString(),
      checkedAt: checkedAt.toISOString(),
      uptimeSeconds,
    }),
    requests: Object.freeze({
      active: requestMetrics.active,
      totalStarted: requestMetrics.totalStarted,
    }),
    contracts: Object.freeze({
      envelope: 'api-envelope.v1',
      competitionRead: 'competition-read.v1',
      matchRead: 'match-read.v1',
      healthRead: HEALTH_SCHEMA_VERSION,
    }),
  });
}

export {
  HEALTH_SCHEMA_VERSION,
  SERVICE_NAME,
  SERVICE_VERSION,
  createHealthSnapshot,
};
