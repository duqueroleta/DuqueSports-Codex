const ENGINE_TEST_SUITES = Object.freeze([
  'engine/projection.test.mjs',
  'engine/market-domain.test.mjs',
  'engine/data-source.test.mjs',
  'engine/snapshot.test.mjs',
  'engine/execution-pipeline.test.mjs',
]);

for (const suite of ENGINE_TEST_SUITES) {
  await import(new URL(suite, import.meta.url));
}

console.log(`DUQUE Engine Phase 1-71 tests passed across ${ENGINE_TEST_SUITES.length} suites`);
