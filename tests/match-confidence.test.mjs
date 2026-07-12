import assert from 'node:assert/strict';
import {
  calculateAverageMatchConfidence,
  formatMatchConfidence,
  getMatchConfidenceLabel,
  normalizeMatchConfidence,
} from '../src/utils/matchConfidence.js';

assert.equal(normalizeMatchConfidence('84'), 84, 'Numeric strings should become numbers');
assert.equal(normalizeMatchConfidence(140), 100, 'Confidence should not exceed one hundred');
assert.equal(normalizeMatchConfidence(-12), 0, 'Confidence should not be negative');
assert.equal(normalizeMatchConfidence(''), null, 'Empty confidence should be unavailable');
assert.equal(normalizeMatchConfidence(null), null, 'Missing confidence should be unavailable');
assert.equal(normalizeMatchConfidence(Number.NaN), null, 'Non-finite confidence should be unavailable');

assert.equal(formatMatchConfidence(87), '87%', 'Valid confidence should include its unit');
assert.equal(formatMatchConfidence(undefined), '--', 'Unavailable confidence should have a neutral display');
assert.equal(getMatchConfidenceLabel(80), 'Confianca alta', 'Scores from eighty should be high confidence');
assert.equal(getMatchConfidenceLabel(79), 'Confianca moderada', 'Scores below eighty should be moderate');
assert.equal(
  getMatchConfidenceLabel(undefined),
  'Confianca indisponivel',
  'Missing confidence should not be classified as moderate',
);

assert.equal(
  calculateAverageMatchConfidence([
    { confidence: 80 },
    { confidence: '90' },
    { confidence: null },
  ]),
  85,
  'Average confidence should ignore unavailable values',
);
assert.equal(calculateAverageMatchConfidence([]), null, 'An empty collection should not report zero confidence');

console.log('Match confidence tests passed');
