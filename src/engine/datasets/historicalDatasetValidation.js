import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from '../contracts/contractValidation.js';

const HISTORICAL_DATASET_PARTITIONS = Object.freeze(['train', 'calibration', 'test']);

function validatePartitionWindows(errors, partitions) {
  if (!Array.isArray(partitions) || partitions.length !== HISTORICAL_DATASET_PARTITIONS.length) {
    addError(errors, 'partitions', 'partition-set-mismatch', 'train, calibration and test partitions are required');
    return new Map();
  }

  const windows = new Map();

  partitions.forEach((partition, index) => {
    const path = `partitions.${index}`;

    if (!isRecord(partition)) {
      addError(errors, path, 'required-object', `${path} must be an object`);
      return;
    }

    const expectedKey = HISTORICAL_DATASET_PARTITIONS[index];

    if (partition.key !== expectedKey) {
      addError(errors, `${path}.key`, 'partition-order-mismatch', `partition ${index} must be ${expectedKey}`);
    }

    if (!isUtcIsoDate(partition.startAt) || !isUtcIsoDate(partition.endAt)) {
      addError(errors, path, 'invalid-partition-window', 'partition dates must be ISO UTC dates');
      return;
    }

    if (Date.parse(partition.startAt) > Date.parse(partition.endAt)) {
      addError(errors, path, 'invalid-partition-window', 'partition start cannot follow its end');
    }

    windows.set(partition.key, partition);

    const previous = partitions[index - 1];

    if (index > 0
      && isUtcIsoDate(previous?.endAt)
      && Date.parse(partition.startAt) <= Date.parse(previous.endAt)) {
      addError(errors, path, 'overlapping-partitions', 'historical partitions must not overlap');
    }
  });

  return windows;
}

function validateRecordChronology(errors, record, path, datasetCreatedAt) {
  const dates = ['kickoffAt', 'featureCutoffAt', 'resultFinalizedAt'];

  dates.forEach((field) => {
    if (!isUtcIsoDate(record[field])) {
      addError(errors, `${path}.${field}`, 'invalid-utc-date', `${field} must be an ISO UTC date`);
    }
  });

  if (isUtcIsoDate(record.featureCutoffAt)
    && isUtcIsoDate(record.kickoffAt)
    && Date.parse(record.featureCutoffAt) > Date.parse(record.kickoffAt)) {
    addError(errors, `${path}.featureCutoffAt`, 'temporal-leakage', 'features cannot include post-kickoff information');
  }

  if (isUtcIsoDate(record.resultFinalizedAt)
    && isUtcIsoDate(record.kickoffAt)
    && Date.parse(record.resultFinalizedAt) < Date.parse(record.kickoffAt)) {
    addError(errors, `${path}.resultFinalizedAt`, 'result-before-kickoff', 'result cannot be finalized before kickoff');
  }

  if (isUtcIsoDate(datasetCreatedAt)
    && isUtcIsoDate(record.resultFinalizedAt)
    && Date.parse(datasetCreatedAt) < Date.parse(record.resultFinalizedAt)) {
    addError(errors, `${path}.resultFinalizedAt`, 'dataset-before-result', 'dataset cannot freeze a future result');
  }
}

function validateHistoricalRecords(errors, records, windows, datasetCreatedAt) {
  if (!Array.isArray(records) || records.length === 0) {
    addError(errors, 'records', 'required-array', 'historical dataset must contain records');
    return;
  }

  const identities = new Set();
  const featureSnapshots = new Set();
  const resultSnapshots = new Set();
  let previousKickoff = null;

  records.forEach((record, index) => {
    const path = `records.${index}`;

    if (!isRecord(record)) {
      addError(errors, path, 'required-object', `${path} must be an object`);
      return;
    }

    ['matchId', 'competitionId', 'season', 'featureSnapshotId', 'resultSnapshotId'].forEach((field) => {
      validateRequiredText(errors, record[field], `${path}.${field}`);
    });

    if (!HISTORICAL_DATASET_PARTITIONS.includes(record.partition)) {
      addError(errors, `${path}.partition`, 'unsupported-partition', 'record partition must be train, calibration or test');
    }

    validateRecordChronology(errors, record, path, datasetCreatedAt);

    const window = windows.get(record.partition);

    if (window && isUtcIsoDate(record.kickoffAt)) {
      const kickoff = Date.parse(record.kickoffAt);

      if (kickoff < Date.parse(window.startAt) || kickoff > Date.parse(window.endAt)) {
        addError(errors, `${path}.partition`, 'record-outside-partition', 'kickoff must stay inside its partition window');
      }

      if (previousKickoff !== null && kickoff < previousKickoff) {
        addError(errors, `${path}.kickoffAt`, 'records-not-chronological', 'records must be ordered by kickoff');
      }

      previousKickoff = kickoff;
    }

    [
      [identities, record.matchId, `${path}.matchId`, 'duplicate-match'],
      [featureSnapshots, record.featureSnapshotId, `${path}.featureSnapshotId`, 'duplicate-feature-snapshot'],
      [resultSnapshots, record.resultSnapshotId, `${path}.resultSnapshotId`, 'duplicate-result-snapshot'],
    ].forEach(([registry, value, errorPath, code]) => {
      if (isRequiredText(value) && registry.has(value)) {
        addError(errors, errorPath, code, 'historical record identity must be unique');
      }

      registry.add(value);
    });
  });

  HISTORICAL_DATASET_PARTITIONS.forEach((partition) => {
    if (!records.some((record) => record?.partition === partition)) {
      addError(errors, 'records', 'empty-partition', `${partition} partition must contain at least one record`);
    }
  });
}

export {
  HISTORICAL_DATASET_PARTITIONS,
  validateHistoricalRecords,
  validatePartitionWindows,
};
