import assert from 'node:assert/strict';
import {
  DETAIL_PAGE_STATES,
  resolveDetailPageState,
} from '../src/components/detail/detailPageState.js';

const match = { id: 'match-1' };
const requestError = new Error('Falha simulada');

assert.equal(
  resolveDetailPageState({ data: null, error: null, isLoading: true }),
  DETAIL_PAGE_STATES.LOADING,
  'Detail page should expose loading while the request is active',
);

assert.equal(
  resolveDetailPageState({ data: null, error: requestError, isLoading: false }),
  DETAIL_PAGE_STATES.ERROR,
  'Detail page should expose error after a failed request',
);

assert.equal(
  resolveDetailPageState({ data: null, error: null, isLoading: false }),
  DETAIL_PAGE_STATES.NOT_FOUND,
  'Detail page should expose not-found when the request succeeds without a resource',
);

assert.equal(
  resolveDetailPageState({ data: match, error: null, isLoading: false }),
  DETAIL_PAGE_STATES.READY,
  'Detail page should expose ready when the resource is available',
);

assert.equal(
  resolveDetailPageState({ data: match, error: requestError, isLoading: true }),
  DETAIL_PAGE_STATES.LOADING,
  'Loading should take precedence while a retry is active',
);

console.log('Detail page state tests passed');
