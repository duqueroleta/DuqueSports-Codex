import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from '../contracts/contractValidation.js';

const MODEL_REGISTRATION_SCHEMA_VERSION = 'canonical-model-registration.v1';
const MODEL_REGISTRATION_STATUSES = Object.freeze(['candidate']);
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const GIT_REVISION_PATTERN = /^[a-f0-9]{40}$/;

function buildModelRegistrationId({ name, version, codeRevision, registeredAt } = {}) {
  if (![name, version, codeRevision].every(isRequiredText) || !isUtcIsoDate(registeredAt)) {
    return null;
  }

  return ['model-registration', name, version, codeRevision, registeredAt]
    .map((part) => encodeURIComponent(part.trim()))
    .join(':');
}

function validateComponents(errors, components) {
  if (!isRecord(components)) {
    addError(errors, 'components', 'required-object', 'model components are required');
    return;
  }

  ['statistical', 'calibration', 'explanation'].forEach((key) => {
    validateRequiredText(errors, components[key], `components.${key}`);
  });
}

function validateArtifacts(errors, registration) {
  const code = isRecord(registration.code) ? registration.code : {};
  validateRequiredText(errors, code.repository, 'code.repository');

  if (!GIT_REVISION_PATTERN.test(code.revision ?? '')) {
    addError(errors, 'code.revision', 'invalid-code-revision', 'code revision must be a full lowercase Git SHA');
  }

  const features = isRecord(registration.features) ? registration.features : {};
  validateRequiredText(errors, features.catalogVersion, 'features.catalogVersion');
  validateRequiredText(errors, features.schemaVersion, 'features.schemaVersion');

  const parameters = isRecord(registration.parameters) ? registration.parameters : {};
  validateRequiredText(errors, parameters.snapshotId, 'parameters.snapshotId');

  if (!SHA256_PATTERN.test(parameters.checksum ?? '')) {
    addError(errors, 'parameters.checksum', 'invalid-checksum', 'parameter checksum must use sha256 with 64 lowercase hex characters');
  }
}

function validateReferences(errors, registration) {
  const dataset = isRecord(registration.dataset) ? registration.dataset : {};
  validateRequiredText(errors, dataset.id, 'dataset.id');

  if (!['synthetic', 'observed'].includes(dataset.kind)) {
    addError(errors, 'dataset.kind', 'unsupported-dataset-kind', 'registered dataset kind must be synthetic or observed');
  }

  const evaluation = isRecord(registration.evaluation) ? registration.evaluation : {};
  validateRequiredText(errors, evaluation.backtestRunId, 'evaluation.backtestRunId');
  validateRequiredText(errors, evaluation.calibrationReportId, 'evaluation.calibrationReportId');
  validateRequiredText(errors, evaluation.evidenceLevel, 'evaluation.evidenceLevel');
}

function validateGovernance(errors, governance) {
  if (!isRecord(governance)) {
    addError(errors, 'governance', 'required-object', 'governance must be an object');
    return;
  }

  if (!MODEL_REGISTRATION_STATUSES.includes(governance.status)) {
    addError(errors, 'governance.status', 'unsupported-registration-status', 'v1 only registers model candidates');
  }

  if (governance.deploymentAllowed !== false) {
    addError(errors, 'governance.deploymentAllowed', 'deployment-not-allowed', 'candidate registration cannot authorize deployment');
  }

  validateRequiredText(errors, governance.note, 'governance.note');
}

function validateModelRegistration(registration) {
  const errors = [];

  if (!isRecord(registration)) {
    addError(errors, 'registration', 'required-object', 'model registration must be an object');
    return { schemaVersion: MODEL_REGISTRATION_SCHEMA_VERSION, valid: false, errors };
  }

  if (registration.schemaVersion !== MODEL_REGISTRATION_SCHEMA_VERSION) {
    addError(errors, 'schemaVersion', 'unsupported-version', `schemaVersion must be ${MODEL_REGISTRATION_SCHEMA_VERSION}`);
  }

  ['odds', 'stake', 'profit', 'roi', 'bookmaker'].forEach((field) => {
    if (Object.hasOwn(registration, field)) {
      addError(errors, field, 'commercial-data-not-allowed', 'model registry cannot contain betting returns');
    }
  });

  validateRequiredText(errors, registration.name, 'name');
  validateRequiredText(errors, registration.version, 'version');
  validateRequiredText(errors, registration.engineVersion, 'engineVersion');

  if (!isUtcIsoDate(registration.registeredAt)) {
    addError(errors, 'registeredAt', 'invalid-utc-date', 'registeredAt must be an ISO UTC date');
  }

  const expectedId = buildModelRegistrationId({
    name: registration.name,
    version: registration.version,
    codeRevision: registration.code?.revision,
    registeredAt: registration.registeredAt,
  });

  if (!expectedId || registration.id !== expectedId) {
    addError(errors, 'id', 'non-idempotent-id', 'registration ID must derive from model, code and time');
  }

  validateArtifacts(errors, registration);
  validateComponents(errors, registration.components);
  validateReferences(errors, registration);
  validateGovernance(errors, registration.governance);

  return {
    schemaVersion: MODEL_REGISTRATION_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  MODEL_REGISTRATION_SCHEMA_VERSION,
  MODEL_REGISTRATION_STATUSES,
  buildModelRegistrationId,
  validateModelRegistration,
};
