import assert from 'node:assert/strict';
import {
  normalizeMatchProbabilities,
  normalizeProbabilityValue,
} from '../src/utils/matchProbabilities.js';

assert.deepEqual(
  normalizeMatchProbabilities(undefined),
  [],
  'Missing probabilities should produce an empty collection',
);

assert.deepEqual(
  normalizeMatchProbabilities([
    { label: ' Confianca ', value: '84' },
    { label: 'Over 2.5', value: 61.5 },
  ]),
  [
    { label: 'Confianca', value: 84 },
    { label: 'Over 2.5', value: 61.5 },
  ],
  'Valid probabilities should normalize labels and numeric strings',
);

assert.deepEqual(
  normalizeMatchProbabilities([
    { label: 'Acima', value: 140 },
    { label: 'Abaixo', value: -12 },
  ]),
  [
    { label: 'Acima', value: 100 },
    { label: 'Abaixo', value: 0 },
  ],
  'Out-of-range probabilities should be clamped to the supported interval',
);

assert.deepEqual(
  normalizeMatchProbabilities([
    null,
    { label: '', value: 50 },
    { label: 'Invalida', value: 'indisponivel' },
    { label: 'Duplicada', value: 72 },
    { label: 'Duplicada', value: 90 },
  ]),
  [{ label: 'Duplicada', value: 72 }],
  'Invalid and duplicated entries should not reach the interface',
);

assert.equal(normalizeProbabilityValue(''), null, 'Empty values should be rejected');
assert.equal(normalizeProbabilityValue(null), null, 'Missing values should be rejected');
assert.equal(normalizeProbabilityValue(false), null, 'Boolean values should be rejected');
assert.equal(normalizeProbabilityValue(Number.NaN), null, 'Non-finite values should be rejected');

console.log('Match probabilities tests passed');
