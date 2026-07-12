import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from './contractValidation.js';

const CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION = 'canonical-odds-snapshot.v1';
const CANONICAL_ODDS_FORMAT = 'decimal';
const CANONICAL_ODDS_STATUSES = Object.freeze(['open', 'suspended', 'closed']);
const CANONICAL_SELECTION_STATUSES = Object.freeze(['open', 'suspended', 'settled']);

function buildCanonicalOddsSnapshotId({
  provider,
  bookmakerId,
  externalMatchId,
  externalMarketId,
  capturedAt,
} = {}) {
  const parts = [provider, bookmakerId, externalMatchId, externalMarketId, capturedAt];

  if (!parts.every(isRequiredText) || !isUtcIsoDate(capturedAt)) {
    return null;
  }

  return ['odds', ...parts.map((part) => encodeURIComponent(part.trim()))].join(':');
}

function validateSelectionPrice(errors, selection, path) {
  const hasValidPrice = selection.decimalOdds === null
    || (Number.isFinite(selection.decimalOdds) && selection.decimalOdds > 1);

  if (!hasValidPrice) {
    addError(
      errors,
      `${path}.decimalOdds`,
      'invalid-decimal-odds',
      'decimalOdds must be null or greater than 1',
    );
  }

  if (selection.status === 'open'
    && (!Number.isFinite(selection.decimalOdds) || selection.decimalOdds <= 1)) {
    addError(errors, `${path}.decimalOdds`, 'missing-open-price', 'open selections require decimal odds');
  }
}

function validateOddsSelections(errors, selections) {
  if (!Array.isArray(selections) || selections.length === 0) {
    addError(errors, 'selections', 'required-array', 'selections must be a non-empty array');
    return;
  }

  const keys = new Set();
  const externalIds = new Set();

  selections.forEach((selection, index) => {
    const path = `selections.${index}`;

    if (!isRecord(selection)) {
      addError(errors, path, 'required-object', `${path} must be an object`);
      return;
    }

    validateRequiredText(errors, selection.key, `${path}.key`);
    validateRequiredText(errors, selection.externalId, `${path}.externalId`);

    if (!CANONICAL_SELECTION_STATUSES.includes(selection.status)) {
      addError(errors, `${path}.status`, 'unsupported-selection-status', 'selection status must be supported');
    }

    validateSelectionPrice(errors, selection, path);

    if (keys.has(selection.key) || externalIds.has(selection.externalId)) {
      addError(errors, path, 'duplicate-selection', 'selection keys and external IDs must be unique');
    }

    keys.add(selection.key);
    externalIds.add(selection.externalId);
  });
}

function validateCaptureChronology(errors, capturedAt, fetchedAt) {
  if (isUtcIsoDate(capturedAt)
    && isUtcIsoDate(fetchedAt)
    && Date.parse(capturedAt) > Date.parse(fetchedAt)) {
    addError(errors, 'capturedAt', 'capture-after-fetch', 'capturedAt cannot be later than source.fetchedAt');
  }
}

function validateCanonicalOddsSnapshot(snapshot) {
  const errors = [];

  if (!isRecord(snapshot)) {
    addError(errors, 'oddsSnapshot', 'required-object', 'oddsSnapshot must be an object');
    return {
      schemaVersion: CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (snapshot.schemaVersion !== CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION) {
    addError(
      errors,
      'schemaVersion',
      'unsupported-version',
      `schemaVersion must be ${CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION}`,
    );
  }

  validateRequiredText(errors, snapshot.matchId, 'matchId');
  validateRequiredText(errors, snapshot.marketId, 'marketId');

  const source = isRecord(snapshot.source) ? snapshot.source : {};
  validateRequiredText(errors, source.provider, 'source.provider');
  validateRequiredText(errors, source.externalMatchId, 'source.externalMatchId');
  validateRequiredText(errors, source.externalMarketId, 'source.externalMarketId');

  if (!isUtcIsoDate(source.fetchedAt)) {
    addError(errors, 'source.fetchedAt', 'invalid-utc-date', 'source.fetchedAt must be an ISO UTC date');
  }

  const bookmaker = isRecord(snapshot.bookmaker) ? snapshot.bookmaker : {};
  validateRequiredText(errors, bookmaker.id, 'bookmaker.id');
  validateRequiredText(errors, bookmaker.name, 'bookmaker.name');

  if (!isUtcIsoDate(snapshot.capturedAt)) {
    addError(errors, 'capturedAt', 'invalid-utc-date', 'capturedAt must be an ISO UTC date');
  }

  validateCaptureChronology(errors, snapshot.capturedAt, source.fetchedAt);

  if (snapshot.format !== CANONICAL_ODDS_FORMAT) {
    addError(errors, 'format', 'unsupported-odds-format', 'canonical odds must use decimal format');
  }

  if (!CANONICAL_ODDS_STATUSES.includes(snapshot.status)) {
    addError(errors, 'status', 'unsupported-odds-status', 'odds status must be supported');
  }

  const expectedId = buildCanonicalOddsSnapshotId({
    provider: source.provider,
    bookmakerId: bookmaker.id,
    externalMatchId: source.externalMatchId,
    externalMarketId: source.externalMarketId,
    capturedAt: snapshot.capturedAt,
  });

  if (!expectedId || snapshot.id !== expectedId) {
    addError(errors, 'id', 'non-idempotent-id', 'id must be derived from source, bookmaker and capture time');
  }

  validateOddsSelections(errors, snapshot.selections);

  const dataQuality = isRecord(snapshot.dataQuality) ? snapshot.dataQuality : {};

  if (!Number.isFinite(dataQuality.freshnessHours) || dataQuality.freshnessHours < 0) {
    addError(errors, 'dataQuality.freshnessHours', 'invalid-range', 'freshnessHours must be zero or greater');
  }

  if (!Number.isFinite(dataQuality.completeness)
    || dataQuality.completeness < 0
    || dataQuality.completeness > 100) {
    addError(errors, 'dataQuality.completeness', 'invalid-range', 'completeness must stay within 0-100');
  }

  return {
    schemaVersion: CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

function validateOddsSnapshotAgainstMarket(market, snapshot) {
  const errors = [];

  if (!isRecord(market) || !isRecord(snapshot)) {
    addError(errors, 'relationship', 'required-contracts', 'market and odds snapshot must be objects');
    return { valid: false, errors };
  }

  if (market.matchId !== snapshot.matchId) {
    addError(errors, 'matchId', 'match-mismatch', 'market and odds snapshot must reference the same match');
  }

  if (market.id !== snapshot.marketId) {
    addError(errors, 'marketId', 'market-mismatch', 'odds snapshot must reference the canonical market');
  }

  const marketSelections = Array.isArray(market.selections) ? market.selections : [];
  const oddsSelections = Array.isArray(snapshot.selections) ? snapshot.selections : [];

  if (marketSelections.length === 0 || oddsSelections.length === 0) {
    addError(errors, 'selections', 'required-selections', 'both contracts must expose selections');
    return { valid: false, errors };
  }

  const marketKeys = new Set(marketSelections.map((selection) => selection.key));
  const oddsKeys = new Set(oddsSelections.map((selection) => selection.key));
  const hasSameSelections = marketKeys.size === oddsKeys.size
    && [...marketKeys].every((key) => oddsKeys.has(key));

  if (!hasSameSelections) {
    addError(errors, 'selections', 'selection-set-mismatch', 'odds selections must match the canonical market');
  }

  return { valid: errors.length === 0, errors };
}

export {
  CANONICAL_ODDS_FORMAT,
  CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION,
  CANONICAL_ODDS_STATUSES,
  CANONICAL_SELECTION_STATUSES,
  buildCanonicalOddsSnapshotId,
  validateCanonicalOddsSnapshot,
  validateOddsSnapshotAgainstMarket,
};
