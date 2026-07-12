import { ENGINE_VERSION } from '../../core/contracts.js';
import {
  CANONICAL_MARKET_SCHEMA_VERSION,
  buildCanonicalMarketId,
} from '../CanonicalMarketContract.js';
import {
  CANONICAL_PROJECTION_SCHEMA_VERSION,
  buildCanonicalProjectionId,
} from '../CanonicalProjectionContract.js';
import { CANONICAL_MARKET_V1_EXAMPLE } from './canonicalMarket.v1.js';

const MATCH_ID = 'match:internal:1';
const INPUT_SNAPSHOT_ID = 'engine-input:match:internal:1:2026-07-12T18:00:00.000Z';
const GENERATED_AT = '2026-07-12T18:00:01.000Z';

const MATCH_RESULT_MARKET = Object.freeze({
  schemaVersion: CANONICAL_MARKET_SCHEMA_VERSION,
  id: buildCanonicalMarketId(MATCH_ID, 'match-result', 'full-match', null),
  matchId: MATCH_ID,
  name: 'Resultado da partida',
  type: 'match-result',
  period: 'full-match',
  line: null,
  selections: [
    { key: 'home', label: 'Mandante' },
    { key: 'draw', label: 'Empate' },
    { key: 'away', label: 'Visitante' },
  ],
});

const BTTS_MARKET = Object.freeze({
  schemaVersion: CANONICAL_MARKET_SCHEMA_VERSION,
  id: buildCanonicalMarketId(MATCH_ID, 'both-teams-score', 'full-match', null),
  matchId: MATCH_ID,
  name: 'Ambas as equipes marcam',
  type: 'both-teams-score',
  period: 'full-match',
  line: null,
  selections: [
    { key: 'yes', label: 'Sim' },
    { key: 'no', label: 'Nao' },
  ],
});

const CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE = Object.freeze([
  MATCH_RESULT_MARKET,
  CANONICAL_MARKET_V1_EXAMPLE,
  BTTS_MARKET,
]);

const CANONICAL_PROJECTION_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_PROJECTION_SCHEMA_VERSION,
  id: buildCanonicalProjectionId({
    matchId: MATCH_ID,
    inputSnapshotId: INPUT_SNAPSHOT_ID,
    engineVersion: ENGINE_VERSION,
    generatedAt: GENERATED_AT,
  }),
  matchId: MATCH_ID,
  status: 'completed',
  input: {
    snapshotId: INPUT_SNAPSHOT_ID,
    dataCutoffAt: '2026-07-12T18:00:00.000Z',
  },
  execution: {
    engineVersion: ENGINE_VERSION,
    generatedAt: GENERATED_AT,
  },
  models: {
    statistical: 'poisson-goals-v1',
    calibration: 'probability-calibration-v1',
    explanation: 'explanation-engine-v1',
  },
  metrics: {
    expectedGoals: { home: 1.84, away: 1.12 },
    confidence: 87,
    dataQualityScore: 96,
    calibrationReliability: 0.84,
  },
  predictions: [
    {
      marketId: MATCH_RESULT_MARKET.id,
      selections: [
        { key: 'home', probability: 51.2 },
        { key: 'draw', probability: 26.8 },
        { key: 'away', probability: 22 },
      ],
    },
    {
      marketId: CANONICAL_MARKET_V1_EXAMPLE.id,
      selections: [
        { key: 'over', probability: 58.4 },
        { key: 'under', probability: 41.6 },
      ],
    },
    {
      marketId: BTTS_MARKET.id,
      selections: [
        { key: 'yes', probability: 54.7 },
        { key: 'no', probability: 45.3 },
      ],
    },
  ],
  evidence: {
    featureSnapshotId: 'feature-snapshot:match:internal:1:phase-80',
    keyDrivers: [
      'Adjusted expected goals favor the home team.',
      'Poisson and calibration agree on the totals direction.',
    ],
    riskFlags: ['Knockout context can reduce attacking volume.'],
    blockReasons: [],
  },
});

export {
  CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE,
  CANONICAL_PROJECTION_V1_EXAMPLE,
};
