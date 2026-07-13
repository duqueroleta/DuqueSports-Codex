import { adaptCompetitionReadModels, adaptMatchReadModel, adaptMatchReadModels } from './sportsApiAdapter.js';

function createSportsDataGateway({
  apiClient,
  enabled = false,
  fallbackCompetitions = [],
  fallbackMatches = [],
  loadFallbackMatches,
} = {}) {
  if (enabled && !apiClient) {
    throw new TypeError('O cliente da API e obrigatorio quando a integracao esta ativa.');
  }

  async function getFallbackMatches() {
    return loadFallbackMatches ? loadFallbackMatches() : fallbackMatches;
  }

  return Object.freeze({
    async getCompetitions() {
      if (!enabled) {
        return fallbackCompetitions;
      }

      try {
        return adaptCompetitionReadModels(await apiClient.getCompetitions());
      } catch {
        return fallbackCompetitions;
      }
    },
    async getMatchById(id) {
      if (!enabled) {
        const matches = await getFallbackMatches();
        return matches.find((match) => match.id === Number(id)) ?? null;
      }

      try {
        return adaptMatchReadModel(await apiClient.getMatchById(id), fallbackMatches);
      } catch {
        const matches = await getFallbackMatches();
        return matches.find((match) => match.id === Number(id)) ?? null;
      }
    },
    async getMatches() {
      if (!enabled) {
        return getFallbackMatches();
      }

      try {
        return adaptMatchReadModels(await apiClient.getMatches(), fallbackMatches);
      } catch {
        return getFallbackMatches();
      }
    },
  });
}

export { createSportsDataGateway };
