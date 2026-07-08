import { matches } from '../data/matches.js';
import { runBatchAnalysis } from '../engine/batch/BatchAnalysisService.js';
import { mockRequest } from './mockApi.js';

function getBatchAnalysis() {
  return mockRequest('batch-analysis', runBatchAnalysis(matches));
}

export { getBatchAnalysis };
