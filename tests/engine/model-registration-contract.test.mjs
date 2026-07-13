import assert from 'node:assert/strict';
import { ENGINE_VERSION } from '../../src/engine/core/contracts.js';
import { SYNTHETIC_HISTORICAL_DATASET_V1 } from '../../src/engine/datasets/examples/syntheticHistoricalDataset.v1.js';
import {
  MODEL_REGISTRATION_SCHEMA_VERSION,
  buildModelRegistrationId,
  validateModelRegistration,
} from '../../src/engine/registry/ModelRegistrationContract.js';
import { CANDIDATE_MODEL_REGISTRATION_V1 } from '../../src/engine/registry/examples/candidateModelRegistration.v1.js';
import { validateModelRegistrationEvidence } from '../../src/engine/registry/modelRegistrationRelationship.js';

const valid = validateModelRegistration(CANDIDATE_MODEL_REGISTRATION_V1);

assert.equal(valid.valid, true, 'Candidate manifest should satisfy the registry contract');
assert.equal(valid.schemaVersion, MODEL_REGISTRATION_SCHEMA_VERSION);
assert.equal(
  buildModelRegistrationId({
    name: CANDIDATE_MODEL_REGISTRATION_V1.name,
    version: CANDIDATE_MODEL_REGISTRATION_V1.version,
    codeRevision: CANDIDATE_MODEL_REGISTRATION_V1.code.revision,
    registeredAt: CANDIDATE_MODEL_REGISTRATION_V1.registeredAt,
  }),
  CANDIDATE_MODEL_REGISTRATION_V1.id,
);
assert.equal(CANDIDATE_MODEL_REGISTRATION_V1.governance.deploymentAllowed, false);

const backtestRun = {
  id: CANDIDATE_MODEL_REGISTRATION_V1.evaluation.backtestRunId,
  dataset: {
    id: SYNTHETIC_HISTORICAL_DATASET_V1.id,
    evidenceLevel: 'infrastructure-only',
  },
  execution: {
    runAt: '2026-07-13T23:10:00.000Z',
    engineVersions: [ENGINE_VERSION],
  },
  validation: { valid: true },
};
const calibrationReport = {
  id: CANDIDATE_MODEL_REGISTRATION_V1.evaluation.calibrationReportId,
  source: {
    backtestRunId: backtestRun.id,
    evidenceLevel: 'infrastructure-only',
  },
  execution: { generatedAt: '2026-07-13T23:20:00.000Z' },
};
const relationship = validateModelRegistrationEvidence(CANDIDATE_MODEL_REGISTRATION_V1, {
  dataset: SYNTHETIC_HISTORICAL_DATASET_V1,
  backtestRun,
  calibrationReport,
});

assert.equal(relationship.valid, true, 'Registration should reconcile every supplied artifact');

const invalid = validateModelRegistration({
  ...CANDIDATE_MODEL_REGISTRATION_V1,
  id: 'random-registration',
  roi: 10,
  code: { ...CANDIDATE_MODEL_REGISTRATION_V1.code, revision: 'short-sha' },
  parameters: { ...CANDIDATE_MODEL_REGISTRATION_V1.parameters, checksum: 'sha256:invalid' },
  governance: {
    ...CANDIDATE_MODEL_REGISTRATION_V1.governance,
    status: 'production',
    deploymentAllowed: true,
  },
});
const invalidCodes = new Set(invalid.errors.map((error) => error.code));

assert.equal(invalid.valid, false);
assert.ok(invalidCodes.has('non-idempotent-id'));
assert.ok(invalidCodes.has('commercial-data-not-allowed'));
assert.ok(invalidCodes.has('invalid-code-revision'));
assert.ok(invalidCodes.has('invalid-checksum'));
assert.ok(invalidCodes.has('unsupported-registration-status'));
assert.ok(invalidCodes.has('deployment-not-allowed'));

const mismatched = validateModelRegistrationEvidence(
  { ...CANDIDATE_MODEL_REGISTRATION_V1, registeredAt: '2026-07-13T23:00:00.000Z' },
  {
    dataset: SYNTHETIC_HISTORICAL_DATASET_V1,
    backtestRun: {
      ...backtestRun,
      id: 'backtest:wrong',
      execution: { ...backtestRun.execution, engineVersions: ['engine:wrong'] },
    },
    calibrationReport,
  },
);
const mismatchCodes = new Set(mismatched.errors.map((error) => error.code));

assert.equal(mismatched.valid, false);
assert.ok(mismatchCodes.has('backtest-mismatch'));
assert.ok(mismatchCodes.has('calibration-mismatch'));
assert.ok(mismatchCodes.has('engine-version-mismatch'));
assert.ok(mismatchCodes.has('registration-before-evaluation'));
assert.ok(mismatchCodes.has('non-idempotent-id'));
assert.equal(validateModelRegistration(null).valid, false);
assert.equal(validateModelRegistrationEvidence(null).valid, false);

console.log('Model registration contract tests passed');
