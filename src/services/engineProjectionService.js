import { matches } from '../data/matches.js';
import { adaptMatchToEngineInput } from '../engine/adapters/mockMatchAdapter.js';
import { runProjectionPipeline } from '../engine/projection/ProjectionPipeline.js';
import { mockRequest } from './mockApi.js';
import { getPublishedProjectionByMatchId } from './publishedProjectionService.js';

function getEngineProjectionByMatchId(matchId) {
  const publishedProjection = getPublishedProjectionByMatchId(matchId);

  if (publishedProjection) {
    return mockRequest('engine-projection', publishedProjection);
  }

  const match = matches.find((item) => item.id === Number(matchId));

  if (!match) {
    return mockRequest('engine-projection', null);
  }

  return mockRequest('engine-projection', runProjectionPipeline(adaptMatchToEngineInput(match)));
}

export { getEngineProjectionByMatchId };
