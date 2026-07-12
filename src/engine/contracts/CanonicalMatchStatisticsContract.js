import {
  addError,
  isRecord,
  isUtcIsoDate,
  validateRequiredText,
} from './contractValidation.js';

const CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION = 'canonical-match-statistics.v1';

const CANONICAL_STATISTICS_PERIODS = Object.freeze([
  'full-match',
  'first-half',
  'second-half',
  'live',
]);

const INTEGER_METRICS = [
  'goals',
  'shots',
  'shotsOnTarget',
  'corners',
  'fouls',
  'yellowCards',
  'redCards',
];

const DECIMAL_METRICS = ['xg', 'xgot'];

function isNullableNonNegativeInteger(value) {
  return value === null || (Number.isInteger(value) && value >= 0);
}

function isNullableNonNegativeNumber(value) {
  return value === null || (Number.isFinite(value) && value >= 0);
}

function isNullablePercentage(value) {
  return value === null || (Number.isFinite(value) && value >= 0 && value <= 100);
}

function validateTeamStatistics(errors, statistics, side) {
  const path = `teams.${side}`;

  if (!isRecord(statistics)) {
    addError(errors, path, 'required-object', `${path} must be an object`);
    return;
  }

  INTEGER_METRICS.forEach((metric) => {
    if (!isNullableNonNegativeInteger(statistics[metric])) {
      addError(errors, `${path}.${metric}`, 'invalid-integer', `${metric} must be null or a non-negative integer`);
    }
  });

  DECIMAL_METRICS.forEach((metric) => {
    if (!isNullableNonNegativeNumber(statistics[metric])) {
      addError(errors, `${path}.${metric}`, 'invalid-number', `${metric} must be null or a non-negative number`);
    }
  });

  if (!isNullablePercentage(statistics.possession)) {
    addError(errors, `${path}.possession`, 'invalid-percentage', 'possession must be null or stay within 0-100');
  }

  if (Number.isInteger(statistics.shots)
    && Number.isInteger(statistics.shotsOnTarget)
    && statistics.shotsOnTarget > statistics.shots) {
    addError(errors, path, 'inconsistent-shots', 'shotsOnTarget cannot exceed shots');
  }
}

function validateCanonicalMatchStatistics(statistics) {
  const errors = [];

  if (!isRecord(statistics)) {
    addError(errors, 'statistics', 'required-object', 'statistics must be an object');
    return {
      schemaVersion: CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (statistics.schemaVersion !== CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION) {
    addError(
      errors,
      'schemaVersion',
      'unsupported-version',
      `schemaVersion must be ${CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION}`,
    );
  }

  validateRequiredText(errors, statistics.matchId, 'matchId');

  const source = isRecord(statistics.source) ? statistics.source : {};
  validateRequiredText(errors, source.provider, 'source.provider');
  validateRequiredText(errors, source.externalMatchId, 'source.externalMatchId');

  if (!isUtcIsoDate(source.fetchedAt)) {
    addError(errors, 'source.fetchedAt', 'invalid-utc-date', 'source.fetchedAt must be an ISO UTC date');
  }

  if (!CANONICAL_STATISTICS_PERIODS.includes(statistics.period)) {
    addError(errors, 'period', 'unsupported-period', 'period must be supported by the canonical contract');
  }

  const minuteIsValid = statistics.minute === null
    || (Number.isInteger(statistics.minute) && statistics.minute >= 0 && statistics.minute <= 130);

  if (!minuteIsValid || (statistics.period === 'live' && statistics.minute === null)) {
    addError(errors, 'minute', 'invalid-minute', 'minute must identify a live snapshot or be null outside live');
  }

  const teams = isRecord(statistics.teams) ? statistics.teams : {};
  validateTeamStatistics(errors, teams.home, 'home');
  validateTeamStatistics(errors, teams.away, 'away');

  if (Number.isFinite(teams.home?.possession) && Number.isFinite(teams.away?.possession)) {
    const possessionTotal = teams.home.possession + teams.away.possession;

    if (possessionTotal < 99 || possessionTotal > 101) {
      addError(errors, 'teams', 'inconsistent-possession', 'combined possession must be approximately 100');
    }
  }

  const dataQuality = isRecord(statistics.dataQuality) ? statistics.dataQuality : {};

  if (!Number.isFinite(dataQuality.freshnessHours) || dataQuality.freshnessHours < 0) {
    addError(errors, 'dataQuality.freshnessHours', 'invalid-range', 'freshnessHours must be zero or greater');
  }

  if (!Number.isFinite(dataQuality.completeness)
    || dataQuality.completeness < 0
    || dataQuality.completeness > 100) {
    addError(errors, 'dataQuality.completeness', 'invalid-range', 'completeness must stay within 0-100');
  }

  return {
    schemaVersion: CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION,
  CANONICAL_STATISTICS_PERIODS,
  validateCanonicalMatchStatistics,
};
