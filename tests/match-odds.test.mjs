import assert from 'node:assert/strict';
import { formatMatchOdds, normalizeMatchOdds } from '../src/utils/matchOdds.js';

assert.equal(normalizeMatchOdds('1.82'), 1.82, 'Decimal strings should become numbers');
assert.equal(normalizeMatchOdds('1,74'), 1.74, 'Comma decimal strings should be supported');
assert.equal(normalizeMatchOdds(2.1), 2.1, 'Numeric odds should remain numeric');
assert.equal(normalizeMatchOdds(1), null, 'Decimal odds must be greater than one');
assert.equal(normalizeMatchOdds(0.95), null, 'Odds below one should be unavailable');
assert.equal(normalizeMatchOdds(''), null, 'Empty odds should be unavailable');
assert.equal(normalizeMatchOdds(null), null, 'Missing odds should be unavailable');
assert.equal(normalizeMatchOdds(Number.POSITIVE_INFINITY), null, 'Non-finite odds should be unavailable');

assert.equal(formatMatchOdds('1.82'), '1.82', 'Valid odds should preserve two decimal places');
assert.equal(formatMatchOdds(2.1), '2.10', 'Numeric odds should receive two decimal places');
assert.equal(formatMatchOdds(undefined), '--', 'Unavailable odds should have a neutral display');

console.log('Match odds tests passed');
