import assert from 'node:assert/strict';
import { normalizeMatchMetrics } from '../src/utils/matchMetrics.js';

assert.deepEqual(
  normalizeMatchMetrics(undefined),
  [],
  'Missing metrics should produce an empty collection',
);

assert.deepEqual(
  normalizeMatchMetrics([' xG 2.24 ', 'Forma 84%', 'Volume alto']),
  ['xG 2.24', 'Forma 84%', 'Volume alto'],
  'Valid metrics should be trimmed and keep their original order',
);

assert.deepEqual(
  normalizeMatchMetrics([
    null,
    84,
    '',
    '   ',
    'BTTS 71%',
    'btts 71%',
    'Transicoes',
  ]),
  ['BTTS 71%', 'Transicoes'],
  'Invalid, empty and case-insensitive duplicated metrics should be discarded',
);

const sourceMetrics = ['Controle', 'Pressao alta'];
const normalizedMetrics = normalizeMatchMetrics(sourceMetrics);

assert.notEqual(normalizedMetrics, sourceMetrics, 'Normalization should return a new collection');
assert.deepEqual(sourceMetrics, ['Controle', 'Pressao alta'], 'Normalization should not mutate its input');

console.log('Match metrics tests passed');
