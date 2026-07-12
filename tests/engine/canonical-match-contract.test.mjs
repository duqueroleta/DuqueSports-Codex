import assert from 'node:assert/strict';
import {
  CANONICAL_MATCH_SCHEMA_VERSION,
  CANONICAL_MATCH_STATUSES,
  validateCanonicalMatch,
} from '../../src/engine/contracts/CanonicalMatchContract.js';

const validMatch = {
  schemaVersion: CANONICAL_MATCH_SCHEMA_VERSION,
  id: 'match:internal:1',
  source: {
    provider: 'provider-candidate',
    externalId: 'external-123',
    fetchedAt: '2026-07-12T18:00:00.000Z',
  },
  competition: {
    id: 'competition:copa-do-mundo',
    name: 'Copa do Mundo',
    season: '2026',
  },
  kickoffAt: '2026-07-12T21:00:00.000Z',
  status: 'scheduled',
  teams: {
    home: { id: 'team:colombia', name: 'Colombia' },
    away: { id: 'team:ghana', name: 'Gana' },
  },
  score: { home: null, away: null },
  context: {
    neutralVenue: true,
    stage: 'group',
    round: '1',
  },
  dataQuality: {
    freshnessHours: 3,
    completeness: 96,
  },
};

const validResult = validateCanonicalMatch(validMatch);

assert.equal(validResult.valid, true, 'A complete canonical match should be valid');
assert.equal(validResult.errors.length, 0, 'A valid canonical match should not expose errors');
assert.equal(validResult.schemaVersion, CANONICAL_MATCH_SCHEMA_VERSION, 'Validation should expose schema version');
assert.ok(CANONICAL_MATCH_STATUSES.includes('live'), 'Canonical statuses should include live matches');

const invalidResult = validateCanonicalMatch({
  ...validMatch,
  schemaVersion: 'canonical-match.v0',
  kickoffAt: '2026-07-12 21:00',
  status: 'unknown',
  teams: {
    home: validMatch.teams.home,
    away: { ...validMatch.teams.home },
  },
  score: { home: -1, away: 1.5 },
  context: { neutralVenue: 'yes' },
  dataQuality: { freshnessHours: -2, completeness: 140 },
});
const invalidPaths = new Set(invalidResult.errors.map((error) => error.path));

assert.equal(invalidResult.valid, false, 'Invalid canonical values should fail validation');
assert.ok(invalidPaths.has('schemaVersion'), 'Validation should reject unsupported schema versions');
assert.ok(invalidPaths.has('kickoffAt'), 'Validation should require UTC kickoff dates');
assert.ok(invalidPaths.has('status'), 'Validation should reject unsupported statuses');
assert.ok(invalidPaths.has('teams'), 'Validation should reject duplicate teams');
assert.ok(invalidPaths.has('score.home'), 'Validation should reject negative scores');
assert.ok(invalidPaths.has('score.away'), 'Validation should reject fractional scores');
assert.ok(invalidPaths.has('context.neutralVenue'), 'Validation should require a boolean venue flag');
assert.ok(invalidPaths.has('dataQuality.freshnessHours'), 'Validation should reject negative freshness');
assert.ok(invalidPaths.has('dataQuality.completeness'), 'Validation should bound completeness');

const missingResult = validateCanonicalMatch(null);

assert.equal(missingResult.valid, false, 'A missing canonical match should be invalid');
assert.equal(missingResult.errors[0].path, 'match', 'A missing match should expose its root path');

console.log('Canonical match contract tests passed');
