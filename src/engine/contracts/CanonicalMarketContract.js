import {
  addError,
  isRecord,
  isRequiredText,
  validateRequiredText,
} from './contractValidation.js';

const CANONICAL_MARKET_SCHEMA_VERSION = 'canonical-market.v1';

const CANONICAL_MARKET_PERIODS = Object.freeze([
  'full-match',
  'first-half',
  'second-half',
]);

const MARKET_DEFINITIONS = Object.freeze({
  'match-result': Object.freeze({
    requiresLine: false,
    selectionKeys: Object.freeze(['home', 'draw', 'away']),
  }),
  'double-chance': Object.freeze({
    requiresLine: false,
    selectionKeys: Object.freeze(['home-or-draw', 'home-or-away', 'draw-or-away']),
  }),
  'total-goals': Object.freeze({
    requiresLine: true,
    selectionKeys: Object.freeze(['over', 'under']),
  }),
  'both-teams-score': Object.freeze({
    requiresLine: false,
    selectionKeys: Object.freeze(['yes', 'no']),
  }),
  'total-corners': Object.freeze({
    requiresLine: true,
    selectionKeys: Object.freeze(['over', 'under']),
  }),
});

const CANONICAL_MARKET_TYPES = Object.freeze(Object.keys(MARKET_DEFINITIONS));

function buildCanonicalMarketId(matchId, type, period, line) {
  if (!isRequiredText(matchId)
    || !CANONICAL_MARKET_TYPES.includes(type)
    || !CANONICAL_MARKET_PERIODS.includes(period)) {
    return null;
  }

  const normalizedLine = line === null ? 'none' : String(line);

  return [
    'market',
    encodeURIComponent(matchId.trim()),
    encodeURIComponent(type),
    encodeURIComponent(period),
    encodeURIComponent(normalizedLine),
  ].join(':');
}

function validateMarketLine(errors, market, definition) {
  if (!definition) {
    return;
  }

  if (!definition.requiresLine) {
    if (market.line !== null) {
      addError(errors, 'line', 'unexpected-line', 'line must be null for this market type');
    }
    return;
  }

  const isQuarterLine = Number.isFinite(market.line)
    && market.line > 0
    && market.line <= 100
    && Number.isInteger(market.line * 4);

  if (!isQuarterLine) {
    addError(errors, 'line', 'invalid-line', 'line must be a positive quarter increment within 100');
  }
}

function validateMarketSelections(errors, selections, definition) {
  if (!Array.isArray(selections) || selections.length === 0) {
    addError(errors, 'selections', 'required-array', 'selections must be a non-empty array');
    return;
  }

  const keys = new Set();

  selections.forEach((selection, index) => {
    const path = `selections.${index}`;

    if (!isRecord(selection)) {
      addError(errors, path, 'required-object', `${path} must be an object`);
      return;
    }

    validateRequiredText(errors, selection.key, `${path}.key`);
    validateRequiredText(errors, selection.label, `${path}.label`);

    if (keys.has(selection.key)) {
      addError(errors, `${path}.key`, 'duplicate-selection', 'selection keys must be unique');
    }

    keys.add(selection.key);
  });

  if (definition) {
    const expectedKeys = definition.selectionKeys;
    const hasExpectedKeys = keys.size === expectedKeys.length
      && expectedKeys.every((key) => keys.has(key));

    if (!hasExpectedKeys) {
      addError(errors, 'selections', 'selection-set-mismatch', 'selections must match the market type');
    }
  }
}

function validateCanonicalMarket(market) {
  const errors = [];

  if (!isRecord(market)) {
    addError(errors, 'market', 'required-object', 'market must be an object');
    return {
      schemaVersion: CANONICAL_MARKET_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (market.schemaVersion !== CANONICAL_MARKET_SCHEMA_VERSION) {
    addError(
      errors,
      'schemaVersion',
      'unsupported-version',
      `schemaVersion must be ${CANONICAL_MARKET_SCHEMA_VERSION}`,
    );
  }

  validateRequiredText(errors, market.matchId, 'matchId');
  validateRequiredText(errors, market.name, 'name');

  const definition = MARKET_DEFINITIONS[market.type];

  if (!definition) {
    addError(errors, 'type', 'unsupported-market-type', 'market type must be supported');
  }

  if (!CANONICAL_MARKET_PERIODS.includes(market.period)) {
    addError(errors, 'period', 'unsupported-period', 'market period must be supported');
  }

  validateMarketLine(errors, market, definition);

  const expectedId = buildCanonicalMarketId(
    market.matchId,
    market.type,
    market.period,
    market.line,
  );

  if (!expectedId || market.id !== expectedId) {
    addError(errors, 'id', 'non-idempotent-id', 'id must be derived from matchId, type, period and line');
  }

  validateMarketSelections(errors, market.selections, definition);

  return {
    schemaVersion: CANONICAL_MARKET_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  CANONICAL_MARKET_PERIODS,
  CANONICAL_MARKET_SCHEMA_VERSION,
  CANONICAL_MARKET_TYPES,
  buildCanonicalMarketId,
  validateCanonicalMarket,
};
