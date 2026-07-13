import { competitions } from '../../src/data/competitions.js';
import { matches } from '../../src/data/matches.js';
import { mapCompetition, mapMatch } from '../mappers/mockSportsMapper.js';

function clone(value) {
  return structuredClone(value);
}

class InMemorySportsRepository {
  constructor({ competitionRecords = competitions, matchRecords = matches } = {}) {
    const competitionsByName = new Map(
      competitionRecords.map((competition) => [competition.label, competition]),
    );

    this.competitions = competitionRecords.map(mapCompetition);
    this.matches = matchRecords.map((match) => mapMatch(match, competitionsByName));
  }

  listCompetitions() {
    return clone(this.competitions);
  }

  listMatches({ competitionId, status } = {}) {
    return clone(this.matches.filter((match) => (
      (!competitionId || match.competition.id === competitionId)
      && (!status || match.status === status)
    )));
  }

  findMatchById(matchId) {
    const match = this.matches.find((item) => item.id === matchId);
    return match ? clone(match) : null;
  }
}

export { InMemorySportsRepository };
