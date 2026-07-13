import { ENGINE_VERSION } from '../../core/contracts.js';
import { SYNTHETIC_HISTORICAL_DATASET_V1 } from '../../datasets/examples/syntheticHistoricalDataset.v1.js';
import {
  MODEL_REGISTRATION_SCHEMA_VERSION,
  buildModelRegistrationId,
} from '../ModelRegistrationContract.js';

const REGISTERED_AT = '2026-07-13T23:30:00.000Z';
const CODE_REVISION = '1111111111111111111111111111111111111111';
const MODEL_NAME = 'duque-score-projection-engine';
const MODEL_VERSION = 'candidate-1.0.0';

const CANDIDATE_MODEL_REGISTRATION_V1 = Object.freeze({
  schemaVersion: MODEL_REGISTRATION_SCHEMA_VERSION,
  id: buildModelRegistrationId({
    name: MODEL_NAME,
    version: MODEL_VERSION,
    codeRevision: CODE_REVISION,
    registeredAt: REGISTERED_AT,
  }),
  name: MODEL_NAME,
  version: MODEL_VERSION,
  registeredAt: REGISTERED_AT,
  engineVersion: ENGINE_VERSION,
  code: {
    repository: 'https://github.com/duqueroleta/DuqueSports-Codex',
    revision: CODE_REVISION,
  },
  components: {
    statistical: 'poisson-goals-v1',
    calibration: 'probability-calibration-v1',
    explanation: 'explanation-engine-v1',
  },
  features: {
    catalogVersion: 'phase-2-memory',
    schemaVersion: 'feature-snapshot.v1',
  },
  parameters: {
    snapshotId: 'parameters:synthetic:candidate-1.0.0',
    checksum: `sha256:${'a'.repeat(64)}`,
  },
  dataset: {
    id: SYNTHETIC_HISTORICAL_DATASET_V1.id,
    kind: SYNTHETIC_HISTORICAL_DATASET_V1.kind,
  },
  evaluation: {
    backtestRunId: 'backtest:synthetic:phase-88',
    calibrationReportId: 'calibration-report:synthetic:phase-88',
    evidenceLevel: 'infrastructure-only',
  },
  governance: {
    status: 'candidate',
    deploymentAllowed: false,
    note: 'Synthetic evidence validates infrastructure only.',
  },
});

export { CANDIDATE_MODEL_REGISTRATION_V1 };
