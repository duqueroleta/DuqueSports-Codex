import { liveMatches } from '../data/liveMatches.js';
import { normalizeLiveMatchesPresentation } from '../utils/liveMatchPresentation.js';
import { mockRequest } from './mockApi.js';

function getLiveMatches() {
  return mockRequest('live', normalizeLiveMatchesPresentation(liveMatches));
}

export { getLiveMatches };
