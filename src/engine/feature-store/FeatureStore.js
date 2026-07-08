import { FEATURE_CATALOG, getFeatureDefinition } from './featureCatalog.js';

function roundFeature(value) {
  return Number(value.toFixed(3));
}

function validateFeatureValue(definition, value) {
  const issues = [];

  if (definition.valueType === 'number' && !Number.isFinite(value)) {
    issues.push(`${definition.id}: value must be numeric`);
  }

  if (definition.validRange && Number.isFinite(value)) {
    const [min, max] = definition.validRange;

    if (value < min || value > max) {
      issues.push(`${definition.id}: value ${value} outside valid range ${min}-${max}`);
    }
  }

  return issues;
}

function createFeatureValue(featureId, entityId, entityType, value) {
  const definition = getFeatureDefinition(featureId);

  if (!definition) {
    throw new Error(`Unknown feature: ${featureId}`);
  }

  const roundedValue = roundFeature(value);
  const issues = validateFeatureValue(definition, roundedValue);

  return {
    featureId,
    entityId,
    entityType,
    value: roundedValue,
    version: definition.version,
    ownerEngine: definition.ownerEngine,
    dependencies: definition.dependencies,
    valid: issues.length === 0,
    issues,
  };
}

function buildTeamFeatureSet(adjustedOutput) {
  const entityId = adjustedOutput.teamId;
  const entityType = 'team';
  const shots = adjustedOutput.metrics.shots;
  const shotsOnTarget = adjustedOutput.metrics.shotsOnTarget;

  return [
    createFeatureValue('adjusted_xg', entityId, entityType, adjustedOutput.metrics.xg),
    createFeatureValue('adjusted_xgot', entityId, entityType, adjustedOutput.metrics.xgot),
    createFeatureValue('adjusted_shots', entityId, entityType, shots),
    createFeatureValue('adjusted_shots_on_target', entityId, entityType, shotsOnTarget),
    createFeatureValue('offensive_volume_index', entityId, entityType, (shots * 0.55) + (shotsOnTarget * 1.35)),
  ];
}

function buildMatchFeatureSet(matchId, homeFeatures, awayFeatures) {
  const homeXg = homeFeatures.find((feature) => feature.featureId === 'adjusted_xg')?.value || 0;
  const awayXg = awayFeatures.find((feature) => feature.featureId === 'adjusted_xg')?.value || 0;

  return [
    createFeatureValue('xg_differential', matchId, 'match', homeXg - awayXg),
  ];
}

function buildFeatureStoreSnapshot({ matchId, homeAdjusted, awayAdjusted }) {
  const home = buildTeamFeatureSet(homeAdjusted);
  const away = buildTeamFeatureSet(awayAdjusted);
  const match = buildMatchFeatureSet(matchId, home, away);
  const all = [...home, ...away, ...match];
  const issues = all.flatMap((feature) => feature.issues);

  return {
    catalogVersion: 'phase-2-memory',
    catalogSize: FEATURE_CATALOG.length,
    features: {
      home,
      away,
      match,
    },
    valid: issues.length === 0,
    issues,
  };
}

export { buildFeatureStoreSnapshot, createFeatureValue };
