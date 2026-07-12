import { matches } from '../data/matches.js';
import { normalizeMatchPresentation, normalizeMatchesPresentation } from '../utils/matchPresentation.js';
import { mockRequest } from './mockApi.js';

function getMatches() {
  return mockRequest('matches', normalizeMatchesPresentation(matches));
}

function getMatchById(id) {
  const match = matches.find((item) => item.id === Number(id));
  return mockRequest('matches', normalizeMatchPresentation(match));
}

export { getMatchById, getMatches };
