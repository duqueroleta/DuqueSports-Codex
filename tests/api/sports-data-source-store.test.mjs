import assert from 'node:assert/strict';
import { createSportsDataSourceStore } from '../../src/services/sportsDataSourceStore.js';

const store = createSportsDataSourceStore({
  apiEnabled: true,
  now: () => new Date('2026-07-14T01:10:00.000Z'),
});
const initialSnapshot = store.getSnapshot();
let notificationCount = 0;
const unsubscribe = store.subscribe(() => {
  notificationCount += 1;
});

assert.equal(initialSnapshot.apiEnabled, true);
assert.equal(initialSnapshot.operations.matches.source, 'idle');
assert.equal(Object.isFrozen(initialSnapshot), true);
assert.equal(Object.isFrozen(initialSnapshot.operations), true);

store.report({
  scope: 'matches',
  source: 'api',
  itemCount: 16,
});

const apiSnapshot = store.getSnapshot();
assert.notEqual(apiSnapshot, initialSnapshot);
assert.equal(apiSnapshot.operations.matches.source, 'api');
assert.equal(apiSnapshot.operations.matches.itemCount, 16);
assert.equal(apiSnapshot.operations.matches.updatedAt, '2026-07-14T01:10:00.000Z');
assert.equal(notificationCount, 1);

store.report({ scope: 'unknown', source: 'fallback' });
assert.equal(store.getSnapshot(), apiSnapshot, 'Unknown scopes must not mutate diagnostics');
assert.equal(notificationCount, 1);

unsubscribe();
store.report({
  scope: 'competitions',
  source: 'fallback',
  itemCount: -1,
  reason: 'network-error',
});

assert.equal(notificationCount, 1, 'Unsubscribed listeners must not receive updates');
assert.equal(store.getSnapshot().operations.competitions.itemCount, 0);
assert.equal(store.getSnapshot().operations.competitions.reason, 'network-error');

console.log('Sports data source store tests passed');
