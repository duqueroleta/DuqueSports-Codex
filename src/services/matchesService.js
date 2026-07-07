import { matches } from '../data/matches.js';
import { mockRequest } from './mockApi.js';

function getMatches() {
  return mockRequest('matches', matches);
}

function getMatchById(id) {
  return mockRequest('matches', matches.find((match) => match.id === Number(id)));
}

export { getMatchById, getMatches };
