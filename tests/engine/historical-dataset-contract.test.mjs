import assert from 'node:assert/strict';
import {
  HISTORICAL_DATASET_KINDS,
  HISTORICAL_DATASET_SCHEMA_VERSION,
  buildHistoricalDatasetId,
  validateHistoricalDataset,
} from '../../src/engine/datasets/HistoricalDatasetContract.js';
import { SYNTHETIC_HISTORICAL_DATASET_V1 } from '../../src/engine/datasets/examples/syntheticHistoricalDataset.v1.js';

const valid = validateHistoricalDataset(SYNTHETIC_HISTORICAL_DATASET_V1);

assert.equal(valid.valid, true, 'Synthetic historical fixture should satisfy the contract');
assert.equal(valid.errors.length, 0);
assert.equal(valid.schemaVersion, HISTORICAL_DATASET_SCHEMA_VERSION);
assert.deepEqual(HISTORICAL_DATASET_KINDS, ['synthetic', 'observed']);
assert.equal(
  buildHistoricalDatasetId(SYNTHETIC_HISTORICAL_DATASET_V1),
  SYNTHETIC_HISTORICAL_DATASET_V1.id,
  'Dataset identity should be reproducible',
);
assert.deepEqual(
  [...new Set(SYNTHETIC_HISTORICAL_DATASET_V1.records.map((record) => record.partition))],
  ['train', 'calibration', 'test'],
  'Fixture should preserve chronological partition order',
);

const invalid = validateHistoricalDataset({
  ...SYNTHETIC_HISTORICAL_DATASET_V1,
  id: 'random-dataset',
  kind: 'unknown',
  provenance: {
    ...SYNTHETIC_HISTORICAL_DATASET_V1.provenance,
    importedAt: '2026-07-14T00:00:00.000Z',
  },
  partitions: [
    SYNTHETIC_HISTORICAL_DATASET_V1.partitions[0],
    {
      ...SYNTHETIC_HISTORICAL_DATASET_V1.partitions[1],
      startAt: '2025-02-01T00:00:00.000Z',
    },
    SYNTHETIC_HISTORICAL_DATASET_V1.partitions[2],
  ],
  records: [
    SYNTHETIC_HISTORICAL_DATASET_V1.records[0],
    {
      ...SYNTHETIC_HISTORICAL_DATASET_V1.records[1],
      matchId: SYNTHETIC_HISTORICAL_DATASET_V1.records[0].matchId,
      featureCutoffAt: '2025-02-15T21:00:00.000Z',
    },
    ...SYNTHETIC_HISTORICAL_DATASET_V1.records.slice(2),
  ],
});
const invalidCodes = new Set(invalid.errors.map((error) => error.code));

assert.equal(invalid.valid, false);
assert.ok(invalidCodes.has('non-idempotent-id'));
assert.ok(invalidCodes.has('unsupported-dataset-kind'));
assert.ok(invalidCodes.has('import-after-freeze'));
assert.ok(invalidCodes.has('overlapping-partitions'));
assert.ok(invalidCodes.has('temporal-leakage'));
assert.ok(invalidCodes.has('duplicate-match'));

const misplaced = validateHistoricalDataset({
  ...SYNTHETIC_HISTORICAL_DATASET_V1,
  records: SYNTHETIC_HISTORICAL_DATASET_V1.records.map((record, index) => (
    index === 0 ? { ...record, partition: 'test' } : record
  )),
});

assert.ok(
  misplaced.errors.some((error) => error.code === 'record-outside-partition'),
  'Records cannot be moved across temporal partitions',
);

const reversed = validateHistoricalDataset({
  ...SYNTHETIC_HISTORICAL_DATASET_V1,
  records: [
    SYNTHETIC_HISTORICAL_DATASET_V1.records[1],
    SYNTHETIC_HISTORICAL_DATASET_V1.records[0],
    ...SYNTHETIC_HISTORICAL_DATASET_V1.records.slice(2),
  ],
});

assert.ok(
  reversed.errors.some((error) => error.code === 'records-not-chronological'),
  'Historical records must remain chronological',
);
assert.equal(validateHistoricalDataset(null).valid, false, 'Missing dataset should fail without throwing');

console.log('Historical dataset contract tests passed');
