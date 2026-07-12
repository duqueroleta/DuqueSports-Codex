import { getEngineProjectionByMatchId } from '../services/engineProjectionService.js';
import { getMatchById } from '../services/matchesService.js';
import { useAsyncData } from './useAsyncData.js';

function useMatchDetailData(matchId) {
  const {
    data: match,
    error,
    isLoading,
    retry: retryMatch,
  } = useAsyncData(() => getMatchById(matchId), [matchId], null);
  const {
    data: engineProjection,
    error: projectionError,
    isLoading: isProjectionLoading,
    retry: retryProjection,
  } = useAsyncData(() => getEngineProjectionByMatchId(matchId), [matchId], null);

  function retry() {
    retryMatch();
    retryProjection();
  }

  return {
    engineProjection,
    error,
    isLoading,
    isProjectionLoading,
    match,
    projectionError,
    retry,
    retryProjection,
  };
}

export { useMatchDetailData };
