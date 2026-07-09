import { createMockEngineDataAdapter } from '../engine/data-source/MockEngineDataAdapter.js';
import { mockRequest } from './mockApi.js';

function getEngineDataSource() {
  return mockRequest('engine-data-source', createMockEngineDataAdapter());
}

export { getEngineDataSource };
