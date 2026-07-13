import { SERVICE_NAME, SERVICE_VERSION } from './createHealthSnapshot.js';

const LIVENESS_SCHEMA_VERSION = 'liveness-read.v1';
const READINESS_SCHEMA_VERSION = 'readiness-read.v1';
const READINESS_STATUSES = Object.freeze(['ready', 'not-ready', 'not-configured']);

function createLivenessSnapshot({
  checkedAt,
  startedAt,
  serviceVersion = SERVICE_VERSION,
}) {
  const uptimeSeconds = Math.max(0, Math.floor((checkedAt.getTime() - startedAt.getTime()) / 1000));

  return Object.freeze({
    schemaVersion: LIVENESS_SCHEMA_VERSION,
    status: 'alive',
    service: Object.freeze({ name: SERVICE_NAME, version: serviceVersion }),
    time: Object.freeze({
      checkedAt: checkedAt.toISOString(),
      uptimeSeconds,
    }),
  });
}

function normalizeReadinessChecks(checks) {
  return Object.freeze(checks.map((check, index) => Object.freeze({
    name: typeof check?.name === 'string' && check.name ? check.name : `check-${index + 1}`,
    required: Boolean(check?.required),
    status: READINESS_STATUSES.includes(check?.status) ? check.status : 'not-ready',
  })));
}

function createReadinessSnapshot({
  checkedAt,
  checks,
  serviceVersion = SERVICE_VERSION,
}) {
  const normalizedChecks = normalizeReadinessChecks(Array.isArray(checks) ? checks : []);
  const isReady = normalizedChecks.every((check) => !check.required || check.status === 'ready');

  return Object.freeze({
    schemaVersion: READINESS_SCHEMA_VERSION,
    status: isReady ? 'ready' : 'not-ready',
    service: Object.freeze({ name: SERVICE_NAME, version: serviceVersion }),
    checkedAt: checkedAt.toISOString(),
    checks: normalizedChecks,
  });
}

export {
  LIVENESS_SCHEMA_VERSION,
  READINESS_SCHEMA_VERSION,
  READINESS_STATUSES,
  createLivenessSnapshot,
  createReadinessSnapshot,
  normalizeReadinessChecks,
};
