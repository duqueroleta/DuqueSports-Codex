import { competitions } from '../data/competitions.js';
import { matches } from '../data/matches.js';
import { normalizeMatchPresentation, normalizeMatchesPresentation } from '../utils/matchPresentation.js';
import { mockRequest } from './mockApi.js';
import { getPublishedMatchById, getPublishedMatches } from './publishedProjectionService.js';
import { createSportsApiClient, DEFAULT_API_BASE_URL } from './sportsApiClient.js';
import { createSportsDataGateway } from './sportsDataGateway.js';
import { createSportsDataSourceStore } from './sportsDataSourceStore.js';

const environment = import.meta.env ?? {};
const sportsApiEnabled = environment.VITE_SPORTS_API_ENABLED === 'true';
const sportsDataSourceStore = createSportsDataSourceStore({ apiEnabled: sportsApiEnabled });
const apiClient = createSportsApiClient({
  baseUrl: environment.VITE_SPORTS_API_URL || DEFAULT_API_BASE_URL,
});
const gateway = createSportsDataGateway({
  apiClient,
  enabled: sportsApiEnabled,
  fallbackCompetitions: competitions,
  fallbackMatches: matches,
  loadFallbackMatches: () => mockRequest('matches', normalizeMatchesPresentation(matches)),
  reportSource: sportsDataSourceStore.report,
});

function getCompetitions() {
  return gateway.getCompetitions();
}

async function getMatchById(id) {
  const publishedMatch = getPublishedMatchById(id);

  if (publishedMatch) {
    return normalizeMatchPresentation(publishedMatch);
  }

  const match = await gateway.getMatchById(id);
  return normalizeMatchPresentation(match);
}

async function getMatches() {
  const publishedMatches = getPublishedMatches();
  const matches = await gateway.getMatches();

  return normalizeMatchesPresentation([...publishedMatches, ...matches]);
}

export { getCompetitions, getMatchById, getMatches, sportsApiEnabled, sportsDataSourceStore };
