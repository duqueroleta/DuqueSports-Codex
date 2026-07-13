import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from '../contracts/contractValidation.js';
import {
  validateHistoricalRecords,
  validatePartitionWindows,
} from './historicalDatasetValidation.js';

const HISTORICAL_DATASET_SCHEMA_VERSION = 'canonical-historical-dataset.v1';
const HISTORICAL_DATASET_KINDS = Object.freeze(['synthetic', 'observed']);

function buildHistoricalDatasetId({ name, version, createdAt } = {}) {
  if (![name, version].every(isRequiredText) || !isUtcIsoDate(createdAt)) {
    return null;
  }

  return ['dataset', name, version, createdAt]
    .map((part) => encodeURIComponent(part.trim()))
    .join(':');
}

function validateProvenance(errors, provenance, datasetKind, createdAt) {
  if (!isRecord(provenance)) {
    addError(errors, 'provenance', 'required-object', 'provenance must be an object');
    return;
  }

  validateRequiredText(errors, provenance.source, 'provenance.source');
  validateRequiredText(errors, provenance.license, 'provenance.license');

  if (!isUtcIsoDate(provenance.importedAt)) {
    addError(errors, 'provenance.importedAt', 'invalid-utc-date', 'importedAt must be an ISO UTC date');
  }

  if (isUtcIsoDate(provenance.importedAt)
    && isUtcIsoDate(createdAt)
    && Date.parse(provenance.importedAt) > Date.parse(createdAt)) {
    addError(errors, 'provenance.importedAt', 'import-after-freeze', 'source import cannot follow dataset creation');
  }

  if (datasetKind === 'synthetic' && provenance.license !== 'internal-test-only') {
    addError(errors, 'provenance.license', 'synthetic-license-mismatch', 'synthetic fixtures must be marked internal-test-only');
  }
}

function validateHistoricalDataset(dataset) {
  const errors = [];

  if (!isRecord(dataset)) {
    addError(errors, 'dataset', 'required-object', 'historical dataset must be an object');
    return { schemaVersion: HISTORICAL_DATASET_SCHEMA_VERSION, valid: false, errors };
  }

  if (dataset.schemaVersion !== HISTORICAL_DATASET_SCHEMA_VERSION) {
    addError(errors, 'schemaVersion', 'unsupported-version', `schemaVersion must be ${HISTORICAL_DATASET_SCHEMA_VERSION}`);
  }

  validateRequiredText(errors, dataset.name, 'name');
  validateRequiredText(errors, dataset.version, 'version');

  if (!HISTORICAL_DATASET_KINDS.includes(dataset.kind)) {
    addError(errors, 'kind', 'unsupported-dataset-kind', 'dataset kind must be synthetic or observed');
  }

  if (!isUtcIsoDate(dataset.createdAt)) {
    addError(errors, 'createdAt', 'invalid-utc-date', 'createdAt must be an ISO UTC date');
  }

  const expectedId = buildHistoricalDatasetId(dataset);

  if (!expectedId || dataset.id !== expectedId) {
    addError(errors, 'id', 'non-idempotent-id', 'dataset ID must be derived from name, version and creation time');
  }

  validateProvenance(errors, dataset.provenance, dataset.kind, dataset.createdAt);
  const windows = validatePartitionWindows(errors, dataset.partitions);
  validateHistoricalRecords(errors, dataset.records, windows, dataset.createdAt);

  return {
    schemaVersion: HISTORICAL_DATASET_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  HISTORICAL_DATASET_KINDS,
  HISTORICAL_DATASET_SCHEMA_VERSION,
  buildHistoricalDatasetId,
  validateHistoricalDataset,
};
