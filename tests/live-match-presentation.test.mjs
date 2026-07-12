import assert from 'node:assert/strict';
import {
  LIVE_TEXT_FALLBACKS,
  calculateAverageLivePressure,
  formatLiveMinute,
  formatLivePressure,
  getLiveMatchStage,
  getLivePressureTone,
  normalizeLiveMatchPresentation,
  normalizeLiveMatchesPresentation,
  normalizeLiveMinute,
} from '../src/utils/liveMatchPresentation.js';

assert.equal(normalizeLiveMinute('63'), 63, 'Numeric minute strings should become numbers');
assert.equal(normalizeLiveMinute(150), 130, 'Minutes should not exceed the supported match duration');
assert.equal(normalizeLiveMinute(-4), 0, 'Minutes should not be negative');
assert.equal(normalizeLiveMinute(undefined), null, 'Missing minutes should be unavailable');
assert.equal(formatLiveMinute(71), "71'", 'Valid minutes should include their unit');
assert.equal(formatLiveMinute(null), '--', 'Unavailable minutes should have a neutral display');

assert.equal(formatLivePressure(84), '84%', 'Valid pressure should include its unit');
assert.equal(formatLivePressure(undefined), '--', 'Unavailable pressure should have a neutral display');
assert.equal(getLiveMatchStage(75), 'Reta final', 'Minute seventy-five should enter the final stage');
assert.equal(getLiveMatchStage(46), 'Segundo tempo', 'Minute forty-six should enter the second half');
assert.equal(getLiveMatchStage(null), 'Tempo indisponivel', 'Missing minute should not infer a stage');
assert.equal(getLivePressureTone(80), 'Zona quente', 'Pressure from eighty should enter the hot zone');
assert.equal(getLivePressureTone(null), 'Dados indisponiveis', 'Missing pressure should not infer a tone');

const sourceMatch = {
  id: 1,
  minute: '52',
  pressure: 140,
  league: '',
  home: ' Palmeiras ',
  away: null,
  score: '0 - 0',
  signal: '',
  alert: 'Laterais agressivos',
};
const normalizedMatch = normalizeLiveMatchPresentation(sourceMatch);

assert.equal(normalizedMatch.minute, 52, 'Live presentation should normalize its minute');
assert.equal(normalizedMatch.pressure, 100, 'Live presentation should clamp pressure');
assert.equal(normalizedMatch.home, 'Palmeiras', 'Live presentation should trim valid text');
assert.equal(normalizedMatch.away, LIVE_TEXT_FALLBACKS.away, 'Invalid away team should use its fallback');
assert.equal(normalizedMatch.signal, LIVE_TEXT_FALLBACKS.signal, 'Invalid signal should use its fallback');
assert.equal(sourceMatch.home, ' Palmeiras ', 'Live presentation should not mutate its input');

assert.equal(
  calculateAverageLivePressure([{ pressure: 70 }, { pressure: '90' }, { pressure: null }]),
  80,
  'Average pressure should ignore unavailable values',
);
assert.equal(calculateAverageLivePressure([]), null, 'An empty collection should not report zero pressure');
assert.deepEqual(normalizeLiveMatchesPresentation([sourceMatch, null]), [normalizedMatch]);

console.log('Live match presentation tests passed');
