import { adaptCompetitionReadModels, adaptMatchReadModel, adaptMatchReadModels } from './sportsApiAdapter.js';

function createSportsDataGateway({
  apiClient,
  enabled = false,
  fallbackCompetitions = [],
  fallbackMatches = [],
  loadFallbackMatches,
  reportSource = () => {},
} = {}) {
  if (enabled && !apiClient) {
    throw new TypeError('O cliente da API e obrigatorio quando a integracao esta ativa.');
  }

  async function getFallbackMatches() {
    return loadFallbackMatches ? loadFallbackMatches() : fallbackMatches;
  }

  function report(scope, source, data, reason = null, status = 'ready') {
    reportSource({
      scope,
      source,
      status,
      itemCount: Array.isArray(data) ? data.length : Number(Boolean(data)),
      reason,
    });
  }

  function getErrorReason(error) {
    return typeof error?.code === 'string' ? error.code : 'unavailable';
  }

  async function getReportedFallbackMatches(source, reason = null) {
    try {
      const matches = await getFallbackMatches();
      report('matches', source, matches, reason);
      return matches;
    } catch (error) {
      report('matches', source, [], getErrorReason(error), 'error');
      throw error;
    }
  }

  async function findReportedFallbackMatch(id, source, reason = null) {
    try {
      const matches = await getFallbackMatches();
      const match = matches.find((item) => item.id === Number(id)) ?? null;
      report('match-detail', source, match, reason);
      return match;
    } catch (error) {
      report('match-detail', source, null, getErrorReason(error), 'error');
      throw error;
    }
  }

  return Object.freeze({
    async getCompetitions() {
      if (!enabled) {
        report('competitions', 'mock', fallbackCompetitions);
        return fallbackCompetitions;
      }

      try {
        const apiCompetitions = adaptCompetitionReadModels(await apiClient.getCompetitions());
        report('competitions', 'api', apiCompetitions);
        return apiCompetitions;
      } catch (error) {
        report('competitions', 'fallback', fallbackCompetitions, getErrorReason(error));
        return fallbackCompetitions;
      }
    },
    async getMatchById(id) {
      if (!enabled) {
        return findReportedFallbackMatch(id, 'mock');
      }

      try {
        const match = adaptMatchReadModel(await apiClient.getMatchById(id), fallbackMatches);
        report('match-detail', 'api', match);
        return match;
      } catch (error) {
        return findReportedFallbackMatch(id, 'fallback', getErrorReason(error));
      }
    },
    async getMatches() {
      if (!enabled) {
        return getReportedFallbackMatches('mock');
      }

      try {
        const apiMatches = adaptMatchReadModels(await apiClient.getMatches(), fallbackMatches);
        report('matches', 'api', apiMatches);
        return apiMatches;
      } catch (error) {
        return getReportedFallbackMatches('fallback', getErrorReason(error));
      }
    },
  });
}

export { createSportsDataGateway };
