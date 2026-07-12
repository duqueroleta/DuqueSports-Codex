import assert from 'node:assert/strict';
import { markets } from '../../src/data/markets.js';
import { matches } from '../../src/data/matches.js';
import { createDataAdapterQuarantine } from '../../src/engine/data-source/DataAdapterQuarantineService.js';
import { validateMatchesData, validateMarketsData } from '../../src/engine/data-source/DataAdapterValidationService.js';
import { createMockAuditsDataAdapter } from '../../src/engine/data-source/MockAuditsDataAdapter.js';
import { createMockEngineDataAdapter } from '../../src/engine/data-source/MockEngineDataAdapter.js';
import { createMockMarketsDataAdapter } from '../../src/engine/data-source/MockMarketsDataAdapter.js';
import { createMockMatchesDataAdapter } from '../../src/engine/data-source/MockMatchesDataAdapter.js';

const mockMatchesData = createMockMatchesDataAdapter();
const mockMarketsData = createMockMarketsDataAdapter();
const mockAuditsData = createMockAuditsDataAdapter();
const mockEngineData = createMockEngineDataAdapter();
const invalidMatchesValidation = validateMatchesData([{ id: 'broken-match' }]);
const invalidAdapterQuarantine = createDataAdapterQuarantine({
  source: 'test-invalid-source',
  validations: [
    invalidMatchesValidation,
    mockMarketsData.validation,
  ],
});

assert.equal(mockEngineData.model, 'mock-engine-data-adapter-v1', 'Mock data adapter should expose its model');
assert.equal(mockMatchesData.model, 'mock-matches-data-adapter-v1', 'Mock matches adapter should expose its model');
assert.equal(mockMarketsData.model, 'mock-markets-data-adapter-v1', 'Mock markets adapter should expose its model');
assert.equal(mockAuditsData.model, 'mock-audits-data-adapter-v1', 'Mock audits adapter should expose its model');
assert.equal(mockMatchesData.validation.valid, true, 'Mock matches adapter should validate its input');
assert.equal(mockMarketsData.validation.valid, true, 'Mock markets adapter should validate its input');
assert.equal(mockAuditsData.validation.valid, true, 'Mock audits adapter should validate its input');
assert.equal(mockEngineData.validation.valid, true, 'Aggregate mock data adapter should summarize valid inputs');
assert.equal(mockEngineData.quarantine.status, 'clear', 'Aggregate mock data adapter should expose clear quarantine');
assert.equal(mockEngineData.quarantine.rejectedItems, 0, 'Valid mock data should not reject records');
assert.equal(invalidMatchesValidation.valid, false, 'Data adapter validation should reject incomplete matches');
assert.equal(invalidAdapterQuarantine.status, 'quarantined', 'Invalid adapter validation should create quarantine');
assert.equal(invalidAdapterQuarantine.rejectedItems, 1, 'Invalid adapter quarantine should count rejected records');
assert.equal(
  invalidAdapterQuarantine.rejectedRecords[0].entityName,
  'matches',
  'Invalid adapter quarantine should preserve entity ownership',
);
assert.equal(validateMarketsData(markets).checkedItems, markets.length, 'Market validation should count checked items');
assert.equal(mockEngineData.matches.length, matches.length, 'Mock data adapter should expose matches');
assert.equal(mockEngineData.markets.length, markets.length, 'Mock data adapter should expose markets');
assert.equal(mockEngineData.audits.length, markets.length, 'Mock data adapter should expose audits');
assert.equal(mockEngineData.adapters.matches.model, mockMatchesData.model, 'Aggregate adapter should preserve matches adapter');
assert.equal(mockEngineData.adapters.markets.model, mockMarketsData.model, 'Aggregate adapter should preserve markets adapter');
assert.equal(mockEngineData.adapters.audits.model, mockAuditsData.model, 'Aggregate adapter should preserve audits adapter');
assert.equal(mockEngineData.batchAnalysis.analyzedMatches, matches.length, 'Mock data adapter should expose batch analysis');

console.log('Engine data source tests passed');
