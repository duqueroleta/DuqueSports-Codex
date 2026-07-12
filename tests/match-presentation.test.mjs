import assert from 'node:assert/strict';
import {
  MATCH_TEXT_FALLBACKS,
  normalizeMatchPresentation,
  normalizeMatchesPresentation,
} from '../src/utils/matchPresentation.js';

const sourceMatch = {
  id: 1,
  home: '  Real Madrid ',
  away: 'Manchester City',
  league: ' ',
  signal: null,
  time: 2100,
  status: 'Pre-jogo',
  score: '0 - 0',
  insight: '',
  confidence: 87,
};
const normalizedMatch = normalizeMatchPresentation(sourceMatch);

assert.equal(normalizedMatch.home, 'Real Madrid', 'Valid text should be trimmed');
assert.equal(normalizedMatch.away, 'Manchester City', 'Valid team names should be preserved');
assert.equal(normalizedMatch.league, MATCH_TEXT_FALLBACKS.league, 'Empty league should use its fallback');
assert.equal(normalizedMatch.signal, MATCH_TEXT_FALLBACKS.signal, 'Invalid signal should use its fallback');
assert.equal(normalizedMatch.time, MATCH_TEXT_FALLBACKS.time, 'Non-text time should use its fallback');
assert.equal(normalizedMatch.insight, MATCH_TEXT_FALLBACKS.insight, 'Empty insight should use its fallback');
assert.equal(normalizedMatch.confidence, 87, 'Non-text match fields should be preserved');
assert.notEqual(normalizedMatch, sourceMatch, 'Normalization should create a new match object');
assert.equal(sourceMatch.home, '  Real Madrid ', 'Normalization should not mutate its input');

assert.equal(normalizeMatchPresentation(undefined), null, 'A missing match should remain not-found');
assert.deepEqual(normalizeMatchesPresentation(undefined), [], 'A missing collection should become empty');
assert.deepEqual(
  normalizeMatchesPresentation([sourceMatch, null]),
  [normalizedMatch],
  'Invalid collection entries should be discarded',
);

console.log('Match presentation tests passed');
