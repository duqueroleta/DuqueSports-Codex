import {
  HISTORICAL_DATASET_SCHEMA_VERSION,
  buildHistoricalDatasetId,
} from '../HistoricalDatasetContract.js';

const CREATED_AT = '2026-07-13T23:00:00.000Z';
const DATASET_NAME = 'duque-score-synthetic-history';
const DATASET_VERSION = '1.0.0';

const PARTITIONS = Object.freeze([
  Object.freeze({ key: 'train', startAt: '2025-01-01T00:00:00.000Z', endAt: '2025-02-28T23:59:59.999Z' }),
  Object.freeze({ key: 'calibration', startAt: '2025-03-01T00:00:00.000Z', endAt: '2025-04-30T23:59:59.999Z' }),
  Object.freeze({ key: 'test', startAt: '2025-05-01T00:00:00.000Z', endAt: '2025-06-30T23:59:59.999Z' }),
]);

function createRecord(index, partition, kickoffAt, featureCutoffAt, resultFinalizedAt) {
  return Object.freeze({
    matchId: `match:synthetic:${index}`,
    competitionId: 'competition:synthetic:validation',
    season: '2025',
    kickoffAt,
    featureSnapshotId: `feature-snapshot:synthetic:${index}`,
    featureCutoffAt,
    resultSnapshotId: `result-snapshot:synthetic:${index}:final`,
    resultFinalizedAt,
    partition,
  });
}

const RECORDS = Object.freeze([
  createRecord(1, 'train', '2025-01-15T20:00:00.000Z', '2025-01-15T19:00:00.000Z', '2025-01-15T22:00:00.000Z'),
  createRecord(2, 'train', '2025-02-15T20:00:00.000Z', '2025-02-15T19:00:00.000Z', '2025-02-15T22:00:00.000Z'),
  createRecord(3, 'calibration', '2025-03-15T20:00:00.000Z', '2025-03-15T19:00:00.000Z', '2025-03-15T22:00:00.000Z'),
  createRecord(4, 'calibration', '2025-04-15T20:00:00.000Z', '2025-04-15T19:00:00.000Z', '2025-04-15T22:00:00.000Z'),
  createRecord(5, 'test', '2025-05-15T20:00:00.000Z', '2025-05-15T19:00:00.000Z', '2025-05-15T22:00:00.000Z'),
  createRecord(6, 'test', '2025-06-15T20:00:00.000Z', '2025-06-15T19:00:00.000Z', '2025-06-15T22:00:00.000Z'),
]);

const SYNTHETIC_HISTORICAL_DATASET_V1 = Object.freeze({
  schemaVersion: HISTORICAL_DATASET_SCHEMA_VERSION,
  id: buildHistoricalDatasetId({ name: DATASET_NAME, version: DATASET_VERSION, createdAt: CREATED_AT }),
  name: DATASET_NAME,
  version: DATASET_VERSION,
  kind: 'synthetic',
  createdAt: CREATED_AT,
  provenance: {
    source: 'duque-score-engine-fixture',
    importedAt: '2026-07-13T22:59:00.000Z',
    license: 'internal-test-only',
  },
  partitions: PARTITIONS,
  records: RECORDS,
});

export { SYNTHETIC_HISTORICAL_DATASET_V1 };
