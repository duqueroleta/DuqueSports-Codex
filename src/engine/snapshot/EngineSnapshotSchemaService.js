import { ENGINE_VERSION } from '../core/contracts.js';

const SNAPSHOT_SCHEMA_VERSION = 'engine-snapshot-schema-v1';

const REQUIRED_SNAPSHOT_FIELDS = [
  'model',
  'snapshotId',
  'createdAt',
  'engineVersion',
  'scope',
  'totals',
  'quality',
  'topOpportunities',
  'topMarkets',
  'auditSummary',
];

const REQUIRED_ARRAY_FIELDS = ['topOpportunities', 'topMarkets', 'auditSummary'];

function validateEngineSnapshotSchema(snapshot) {
  const errors = [];
  const warnings = [];

  if (!snapshot || typeof snapshot !== 'object') {
    return {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      valid: false,
      errors: ['snapshot must be an object'],
      warnings,
    };
  }

  REQUIRED_SNAPSHOT_FIELDS.forEach((field) => {
    if (!(field in snapshot)) {
      errors.push(`${field} is required`);
    }
  });

  if (snapshot.model !== 'engine-snapshot-service-v1') {
    errors.push('model must be engine-snapshot-service-v1');
  }

  REQUIRED_ARRAY_FIELDS.forEach((field) => {
    if (field in snapshot && !Array.isArray(snapshot[field])) {
      errors.push(`${field} must be an array`);
    }
  });

  if (snapshot.totals && typeof snapshot.totals !== 'object') {
    errors.push('totals must be an object');
  }

  if (snapshot.quality && typeof snapshot.quality !== 'object') {
    errors.push('quality must be an object');
  }

  if (Array.isArray(snapshot.topOpportunities) && snapshot.topOpportunities.length === 0) {
    warnings.push('topOpportunities is empty');
  }

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function assessEngineSnapshotCompatibility(snapshot) {
  const schemaValidation = validateEngineSnapshotSchema(snapshot);

  if (!schemaValidation.valid) {
    return {
      compatible: false,
      migrationRequired: false,
      status: 'invalid-schema',
      currentEngineVersion: ENGINE_VERSION,
      snapshotEngineVersion: snapshot?.engineVersion ?? null,
      schemaValidation,
    };
  }

  if (snapshot.engineVersion === ENGINE_VERSION) {
    return {
      compatible: true,
      migrationRequired: false,
      status: 'current',
      currentEngineVersion: ENGINE_VERSION,
      snapshotEngineVersion: snapshot.engineVersion,
      schemaValidation,
    };
  }

  if (String(snapshot.engineVersion).startsWith('duque-score-engine-v1.')) {
    return {
      compatible: true,
      migrationRequired: true,
      status: 'legacy-compatible',
      currentEngineVersion: ENGINE_VERSION,
      snapshotEngineVersion: snapshot.engineVersion,
      schemaValidation,
    };
  }

  return {
    compatible: false,
    migrationRequired: true,
    status: 'unsupported-version',
    currentEngineVersion: ENGINE_VERSION,
    snapshotEngineVersion: snapshot.engineVersion,
    schemaValidation,
  };
}

export {
  SNAPSHOT_SCHEMA_VERSION,
  assessEngineSnapshotCompatibility,
  validateEngineSnapshotSchema,
};
