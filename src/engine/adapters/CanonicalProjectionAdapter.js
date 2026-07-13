import {
  CANONICAL_PROJECTION_SCHEMA_VERSION,
  buildCanonicalProjectionId,
  validateCanonicalProjection,
  validateProjectionAgainstMarkets,
} from '../contracts/CanonicalProjectionContract.js';
import { validateCanonicalMarket } from '../contracts/CanonicalMarketContract.js';
import { createCanonicalProjectionMarkets } from './canonicalProjectionMarkets.js';

const CANONICAL_PROJECTION_ADAPTER_MODEL = 'canonical-projection-adapter-v1';

const BLOCKED_PIPELINE_MODELS = Object.freeze({
  statistical: 'poisson-goals-v1',
  calibration: 'probability-calibration-v1',
  explanation: 'explanation-engine-v1',
});

function normalizeCanonicalMatchId(matchId) {
  const normalized = String(matchId ?? '').trim();

  if (!normalized) {
    return '';
  }

  return normalized.startsWith('match:') ? normalized : `match:internal:${normalized}`;
}

function buildFeatureSnapshotId(inputSnapshotId, catalogVersion) {
  if (typeof inputSnapshotId !== 'string'
    || inputSnapshotId.trim().length === 0
    || typeof catalogVersion !== 'string'
    || catalogVersion.trim().length === 0) {
    return null;
  }

  return [
    'feature-snapshot',
    encodeURIComponent(inputSnapshotId.trim()),
    encodeURIComponent(catalogVersion.trim()),
  ].join(':');
}

function findMarket(markets, type) {
  return markets.find((market) => market.type === type);
}

function buildCanonicalPredictions(markets, probabilities) {
  const matchResult = findMarket(markets, 'match-result');
  const totalGoals = findMarket(markets, 'total-goals');
  const bothTeamsScore = findMarket(markets, 'both-teams-score');
  const bttsNo = Number.isFinite(probabilities?.btts)
    ? Number((100 - probabilities.btts).toFixed(1))
    : null;

  return [
    {
      marketId: matchResult?.id,
      selections: [
        { key: 'home', probability: probabilities?.homeWin },
        { key: 'draw', probability: probabilities?.draw },
        { key: 'away', probability: probabilities?.awayWin },
      ],
    },
    {
      marketId: totalGoals?.id,
      selections: [
        { key: 'over', probability: probabilities?.over25 },
        { key: 'under', probability: probabilities?.under25 },
      ],
    },
    {
      marketId: bothTeamsScore?.id,
      selections: [
        { key: 'yes', probability: probabilities?.btts },
        { key: 'no', probability: bttsNo },
      ],
    },
  ];
}

function getCompletedModels(projection) {
  return {
    statistical: projection.trace?.statistical?.poisson?.model,
    calibration: projection.trace?.calibration?.model,
    explanation: projection.trace?.explainability?.model,
  };
}

function buildCanonicalMetrics(projection, status) {
  if (status === 'blocked') {
    return {
      expectedGoals: { home: null, away: null },
      confidence: null,
      dataQualityScore: projection.dataQualityScore,
      calibrationReliability: null,
    };
  }

  return {
    expectedGoals: {
      home: projection.expectedHomeGoals,
      away: projection.expectedAwayGoals,
    },
    confidence: projection.confidence,
    dataQualityScore: projection.dataQualityScore,
    calibrationReliability: projection.trace?.calibration?.reliability,
  };
}

function buildCanonicalEvidence(projection, status, inputSnapshotId) {
  if (status === 'blocked') {
    return {
      featureSnapshotId: null,
      keyDrivers: [],
      riskFlags: [],
      blockReasons: Array.isArray(projection.issues) ? [...projection.issues] : [],
    };
  }

  return {
    featureSnapshotId: buildFeatureSnapshotId(
      inputSnapshotId,
      projection.trace?.featureStore?.catalogVersion,
    ),
    keyDrivers: Array.isArray(projection.aiExplanation?.keyDrivers)
      ? [...projection.aiExplanation.keyDrivers]
      : [],
    riskFlags: Array.isArray(projection.aiExplanation?.riskFlags)
      ? [...projection.aiExplanation.riskFlags]
      : [],
    blockReasons: [],
  };
}

function adaptProjectionToCanonical({
  projection,
  inputSnapshotId,
  dataCutoffAt,
  generatedAt,
} = {}) {
  const sourceProjection = projection ?? {};
  const matchId = normalizeCanonicalMatchId(sourceProjection.matchId);
  const status = sourceProjection.blocked ? 'blocked' : 'completed';
  const markets = status === 'completed' ? createCanonicalProjectionMarkets(matchId) : [];
  const models = status === 'blocked' ? BLOCKED_PIPELINE_MODELS : getCompletedModels(sourceProjection);
  const canonicalProjection = {
    schemaVersion: CANONICAL_PROJECTION_SCHEMA_VERSION,
    id: buildCanonicalProjectionId({
      matchId,
      inputSnapshotId,
      engineVersion: sourceProjection.engineVersion,
      generatedAt,
    }),
    matchId,
    status,
    input: {
      snapshotId: inputSnapshotId,
      dataCutoffAt,
    },
    execution: {
      engineVersion: sourceProjection.engineVersion,
      generatedAt,
    },
    models,
    metrics: buildCanonicalMetrics(sourceProjection, status),
    predictions: status === 'completed'
      ? buildCanonicalPredictions(markets, sourceProjection.probabilities)
      : [],
    evidence: buildCanonicalEvidence(sourceProjection, status, inputSnapshotId),
  };
  const marketValidations = markets.map(validateCanonicalMarket);
  const projectionValidation = validateCanonicalProjection(canonicalProjection);
  const relationshipValidation = status === 'completed'
    ? validateProjectionAgainstMarkets(canonicalProjection, markets)
    : { valid: true, skipped: true, reason: 'Blocked projections do not expose markets.' };
  const valid = projectionValidation.valid
    && marketValidations.every((validation) => validation.valid)
    && relationshipValidation.valid;

  return {
    model: CANONICAL_PROJECTION_ADAPTER_MODEL,
    sourceMatchId: sourceProjection.matchId ?? null,
    markets,
    projection: canonicalProjection,
    validation: {
      valid,
      markets: marketValidations,
      projection: projectionValidation,
      relationship: relationshipValidation,
    },
  };
}

export {
  CANONICAL_PROJECTION_ADAPTER_MODEL,
  adaptProjectionToCanonical,
  normalizeCanonicalMatchId,
};
