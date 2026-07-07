import { liveMatches } from '../data/liveMatches.js';
import { mockRequest } from './mockApi.js';

function getLiveMatches() {
  return mockRequest('live', liveMatches);
}

export { getLiveMatches };
