const CANONICAL_MATCH_SCHEMA_VERSION = 'canonical-match.v1';

const CANONICAL_MATCH_STATUSES = Object.freeze([
  'scheduled',
  'live',
  'halftime',
  'finished',
  'postponed',
  'cancelled',
  'suspended',
]);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isRequiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUtcIsoDate(value) {
  return isRequiredText(value)
    && value.endsWith('Z')
    && Number.isFinite(Date.parse(value));
}

function isNullableScore(value) {
  return value === null || (Number.isInteger(value) && value >= 0);
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function validateRequiredText(errors, value, path) {
  if (!isRequiredText(value)) {
    addError(errors, path, 'required-text', `${path} must be a non-empty string`);
  }
}

function validateTeam(errors, team, side) {
  const path = `teams.${side}`;

  if (!isRecord(team)) {
    addError(errors, path, 'required-object', `${path} must be an object`);
    return;
  }

  validateRequiredText(errors, team.id, `${path}.id`);
  validateRequiredText(errors, team.name, `${path}.name`);
}

function validateCanonicalMatch(match) {
  const errors = [];

  if (!isRecord(match)) {
    addError(errors, 'match', 'required-object', 'match must be an object');
    return {
      schemaVersion: CANONICAL_MATCH_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (match.schemaVersion !== CANONICAL_MATCH_SCHEMA_VERSION) {
    addError(errors, 'schemaVersion', 'unsupported-version', `schemaVersion must be ${CANONICAL_MATCH_SCHEMA_VERSION}`);
  }

  validateRequiredText(errors, match.id, 'id');

  const source = isRecord(match.source) ? match.source : {};
  validateRequiredText(errors, source.provider, 'source.provider');
  validateRequiredText(errors, source.externalId, 'source.externalId');

  if (!isUtcIsoDate(source.fetchedAt)) {
    addError(errors, 'source.fetchedAt', 'invalid-utc-date', 'source.fetchedAt must be an ISO UTC date');
  }

  const competition = isRecord(match.competition) ? match.competition : {};
  validateRequiredText(errors, competition.id, 'competition.id');
  validateRequiredText(errors, competition.name, 'competition.name');
  validateRequiredText(errors, competition.season, 'competition.season');

  if (!isUtcIsoDate(match.kickoffAt)) {
    addError(errors, 'kickoffAt', 'invalid-utc-date', 'kickoffAt must be an ISO UTC date');
  }

  if (!CANONICAL_MATCH_STATUSES.includes(match.status)) {
    addError(errors, 'status', 'unsupported-status', 'status must be supported by the canonical contract');
  }

  const teams = isRecord(match.teams) ? match.teams : {};
  validateTeam(errors, teams.home, 'home');
  validateTeam(errors, teams.away, 'away');

  if (isRequiredText(teams.home?.id) && teams.home.id === teams.away?.id) {
    addError(errors, 'teams', 'duplicate-team', 'home and away teams must be different');
  }

  const score = isRecord(match.score) ? match.score : {};

  if (!isNullableScore(score.home)) {
    addError(errors, 'score.home', 'invalid-score', 'score.home must be null or a non-negative integer');
  }

  if (!isNullableScore(score.away)) {
    addError(errors, 'score.away', 'invalid-score', 'score.away must be null or a non-negative integer');
  }

  const context = isRecord(match.context) ? match.context : {};

  if (typeof context.neutralVenue !== 'boolean') {
    addError(errors, 'context.neutralVenue', 'invalid-boolean', 'context.neutralVenue must be a boolean');
  }

  const dataQuality = isRecord(match.dataQuality) ? match.dataQuality : {};

  if (!Number.isFinite(dataQuality.freshnessHours) || dataQuality.freshnessHours < 0) {
    addError(errors, 'dataQuality.freshnessHours', 'invalid-range', 'freshnessHours must be zero or greater');
  }

  if (!Number.isFinite(dataQuality.completeness)
    || dataQuality.completeness < 0
    || dataQuality.completeness > 100) {
    addError(errors, 'dataQuality.completeness', 'invalid-range', 'completeness must stay within 0-100');
  }

  return {
    schemaVersion: CANONICAL_MATCH_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  CANONICAL_MATCH_SCHEMA_VERSION,
  CANONICAL_MATCH_STATUSES,
  validateCanonicalMatch,
};
