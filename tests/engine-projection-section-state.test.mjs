import assert from 'node:assert/strict';
import {
  ENGINE_PROJECTION_SECTION_STATES,
  resolveEngineProjectionSectionState,
} from '../src/components/matches/detail/engineProjectionSectionState.js';

assert.equal(
  resolveEngineProjectionSectionState({ error: null, isLoading: true }),
  ENGINE_PROJECTION_SECTION_STATES.LOADING,
  'Projection section should expose loading while the request is active',
);

assert.equal(
  resolveEngineProjectionSectionState({ error: new Error('Falha simulada'), isLoading: false }),
  ENGINE_PROJECTION_SECTION_STATES.ERROR,
  'Projection section should expose an isolated error after the request fails',
);

assert.equal(
  resolveEngineProjectionSectionState({ error: null, isLoading: false }),
  ENGINE_PROJECTION_SECTION_STATES.READY,
  'Projection section should expose ready when loading completes without an error',
);

assert.equal(
  resolveEngineProjectionSectionState({ error: new Error('Falha simulada'), isLoading: true }),
  ENGINE_PROJECTION_SECTION_STATES.LOADING,
  'Loading should take precedence while a retry is active',
);

console.log('Engine projection section state tests passed');
