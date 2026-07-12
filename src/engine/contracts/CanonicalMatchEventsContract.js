import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from './contractValidation.js';

const CANONICAL_MATCH_EVENTS_SCHEMA_VERSION = 'canonical-match-events.v1';

const CANONICAL_EVENT_TYPES = Object.freeze([
  'goal',
  'card',
  'substitution',
  'penalty-missed',
]);

const CANONICAL_EVENT_PERIODS = Object.freeze([
  'first-half',
  'second-half',
  'extra-time-first',
  'extra-time-second',
  'penalty-shootout',
]);

const GOAL_KINDS = Object.freeze(['regular', 'penalty', 'own-goal']);
const CARD_KINDS = Object.freeze(['yellow', 'second-yellow', 'red']);

const PERIOD_LIMITS = Object.freeze({
  'first-half': [0, 45],
  'second-half': [46, 90],
  'extra-time-first': [91, 105],
  'extra-time-second': [106, 120],
  'penalty-shootout': [120, 130],
});

function buildCanonicalEventId(provider, externalMatchId, externalEventId) {
  if (!isRequiredText(provider)
    || !isRequiredText(externalMatchId)
    || !isRequiredText(externalEventId)) {
    return null;
  }

  return [
    'event',
    encodeURIComponent(provider.trim()),
    encodeURIComponent(externalMatchId.trim()),
    encodeURIComponent(externalEventId.trim()),
  ].join(':');
}

function validatePlayer(errors, player, path, nullable = false) {
  if (nullable && player === null) {
    return;
  }

  if (!isRecord(player)) {
    addError(errors, path, 'required-player', `${path} must identify a player`);
    return;
  }

  validateRequiredText(errors, player.id, `${path}.id`);
  validateRequiredText(errors, player.name, `${path}.name`);
}

function validateGoalDetails(errors, details, path) {
  if (!GOAL_KINDS.includes(details.kind)) {
    addError(errors, `${path}.kind`, 'unsupported-goal-kind', 'goal kind must be supported');
  }

  validatePlayer(errors, details.scorer, `${path}.scorer`);
  validatePlayer(errors, details.assist, `${path}.assist`, true);

  if (isRequiredText(details.scorer?.id) && details.scorer.id === details.assist?.id) {
    addError(errors, path, 'duplicate-player-role', 'scorer and assist must identify different players');
  }
}

function validateCardDetails(errors, details, path) {
  if (!CARD_KINDS.includes(details.kind)) {
    addError(errors, `${path}.kind`, 'unsupported-card-kind', 'card kind must be supported');
  }

  validatePlayer(errors, details.player, `${path}.player`);
}

function validateSubstitutionDetails(errors, details, path) {
  validatePlayer(errors, details.playerIn, `${path}.playerIn`);
  validatePlayer(errors, details.playerOut, `${path}.playerOut`);

  if (isRequiredText(details.playerIn?.id) && details.playerIn.id === details.playerOut?.id) {
    addError(errors, path, 'duplicate-player-role', 'playerIn and playerOut must identify different players');
  }
}

function validateEventDetails(errors, event, path) {
  if (!isRecord(event.details)) {
    addError(errors, `${path}.details`, 'required-object', 'event details must be an object');
    return;
  }

  if (event.type === 'goal') {
    validateGoalDetails(errors, event.details, `${path}.details`);
  } else if (event.type === 'card') {
    validateCardDetails(errors, event.details, `${path}.details`);
  } else if (event.type === 'substitution') {
    validateSubstitutionDetails(errors, event.details, `${path}.details`);
  } else if (event.type === 'penalty-missed') {
    validatePlayer(errors, event.details.player, `${path}.details.player`);
  }
}

function validateEventMinute(errors, event, path) {
  const limits = PERIOD_LIMITS[event.period];

  if (!Number.isInteger(event.minute) || event.minute < 0 || event.minute > 130) {
    addError(errors, `${path}.minute`, 'invalid-minute', 'minute must be an integer within 0-130');
  } else if (limits && (event.minute < limits[0] || event.minute > limits[1])) {
    addError(errors, `${path}.minute`, 'period-minute-mismatch', 'minute must belong to the selected period');
  }

  if (event.stoppageMinute !== null
    && (!Number.isInteger(event.stoppageMinute)
      || event.stoppageMinute < 0
      || event.stoppageMinute > 30)) {
    addError(errors, `${path}.stoppageMinute`, 'invalid-stoppage-minute', 'stoppageMinute must be null or within 0-30');
  }
}

function validateEvent(errors, event, index, source) {
  const path = `events.${index}`;

  if (!isRecord(event)) {
    addError(errors, path, 'required-object', `${path} must be an object`);
    return;
  }

  validateRequiredText(errors, event.externalId, `${path}.externalId`);
  const expectedId = buildCanonicalEventId(
    source.provider,
    source.externalMatchId,
    event.externalId,
  );

  if (!expectedId || event.id !== expectedId) {
    addError(
      errors,
      `${path}.id`,
      'non-idempotent-id',
      'id must be derived from provider, externalMatchId and externalId',
    );
  }

  validateRequiredText(errors, event.teamId, `${path}.teamId`);

  if (!CANONICAL_EVENT_TYPES.includes(event.type)) {
    addError(errors, `${path}.type`, 'unsupported-event-type', 'event type must be supported');
  }

  if (!CANONICAL_EVENT_PERIODS.includes(event.period)) {
    addError(errors, `${path}.period`, 'unsupported-period', 'event period must be supported');
  }

  validateEventMinute(errors, event, path);

  if (!Number.isInteger(event.sequence) || event.sequence < 0) {
    addError(errors, `${path}.sequence`, 'invalid-sequence', 'sequence must be a non-negative integer');
  }

  validateEventDetails(errors, event, path);
}

function getEventPosition(event) {
  const period = CANONICAL_EVENT_PERIODS.indexOf(event.period);
  const stoppageMinute = Number.isInteger(event.stoppageMinute) ? event.stoppageMinute : 0;
  const sequence = Number.isInteger(event.sequence) ? event.sequence : 0;

  return [period, event.minute, stoppageMinute, sequence];
}

function comparePositions(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}

function validateCollectionIntegrity(errors, events) {
  const ids = new Set();
  const externalIds = new Set();
  let previousPosition = null;

  events.forEach((event, index) => {
    if (!isRecord(event)) {
      return;
    }

    if (ids.has(event.id) || externalIds.has(event.externalId)) {
      addError(errors, `events.${index}`, 'duplicate-event', 'event IDs must be unique within the match');
    }

    ids.add(event.id);
    externalIds.add(event.externalId);

    const position = getEventPosition(event);

    if (previousPosition && comparePositions(previousPosition, position) >= 0) {
      addError(errors, `events.${index}`, 'events-out-of-order', 'events must have a strict chronological order');
    }

    previousPosition = position;
  });
}

function validateCanonicalMatchEvents(collection) {
  const errors = [];

  if (!isRecord(collection)) {
    addError(errors, 'eventsCollection', 'required-object', 'eventsCollection must be an object');
    return {
      schemaVersion: CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (collection.schemaVersion !== CANONICAL_MATCH_EVENTS_SCHEMA_VERSION) {
    addError(
      errors,
      'schemaVersion',
      'unsupported-version',
      `schemaVersion must be ${CANONICAL_MATCH_EVENTS_SCHEMA_VERSION}`,
    );
  }

  validateRequiredText(errors, collection.matchId, 'matchId');

  const source = isRecord(collection.source) ? collection.source : {};
  validateRequiredText(errors, source.provider, 'source.provider');
  validateRequiredText(errors, source.externalMatchId, 'source.externalMatchId');

  if (!isUtcIsoDate(source.fetchedAt)) {
    addError(errors, 'source.fetchedAt', 'invalid-utc-date', 'source.fetchedAt must be an ISO UTC date');
  }

  if (!Array.isArray(collection.events)) {
    addError(errors, 'events', 'required-array', 'events must be an array');
  } else {
    collection.events.forEach((event, index) => validateEvent(errors, event, index, source));
    validateCollectionIntegrity(errors, collection.events);
  }

  const dataQuality = isRecord(collection.dataQuality) ? collection.dataQuality : {};

  if (!Number.isFinite(dataQuality.freshnessHours) || dataQuality.freshnessHours < 0) {
    addError(errors, 'dataQuality.freshnessHours', 'invalid-range', 'freshnessHours must be zero or greater');
  }

  if (!Number.isFinite(dataQuality.completeness)
    || dataQuality.completeness < 0
    || dataQuality.completeness > 100) {
    addError(errors, 'dataQuality.completeness', 'invalid-range', 'completeness must stay within 0-100');
  }

  return {
    schemaVersion: CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  CANONICAL_EVENT_PERIODS,
  CANONICAL_EVENT_TYPES,
  CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
  buildCanonicalEventId,
  validateCanonicalMatchEvents,
};
