import { matches } from '../data/matches.js';
import { adaptMatchToEngineInput } from '../engine/adapters/mockMatchAdapter.js';
import { runProjectionPipeline } from '../engine/projection/ProjectionPipeline.js';
import { mockRequest } from './mockApi.js';

function getEngineProjectionByMatchId(matchId) {
  const match = matches.find((item) => item.id === Number(matchId));

  if (!match) {
    return mockRequest('engine-projection', null);
  }

  return mockRequest('engine-projection', runProjectionPipeline(adaptMatchToEngineInput(match)));
}

export { getEngineProjectionByMatchId };
