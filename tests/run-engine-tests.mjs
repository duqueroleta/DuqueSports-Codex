import { ENGINE_VERSION } from '../src/engine/core/contracts.js';

const ENGINE_TEST_SUITES = Object.freeze([
  'engine/canonical-match-contract.test.mjs',
  'engine/canonical-match-statistics-contract.test.mjs',
  'engine/canonical-match-events-contract.test.mjs',
  'engine/canonical-market-odds-contract.test.mjs',
  'engine/canonical-projection-contract.test.mjs',
  'engine/canonical-projection-audit-contract.test.mjs',
  'engine/canonical-projection-adapter.test.mjs',
  'engine/canonical-settlement-service.test.mjs',
  'engine/projection.test.mjs',
  'engine/market-domain.test.mjs',
  'engine/data-source.test.mjs',
  'engine/snapshot.test.mjs',
  'engine/execution-pipeline.test.mjs',
]);

for (const suite of ENGINE_TEST_SUITES) {
  await import(new URL(suite, import.meta.url));
}

console.log(`Engine tests passed for ${ENGINE_VERSION} across ${ENGINE_TEST_SUITES.length} suites`);
