function normalizeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function detectCompetitionFamily(competition) {
  const normalized = normalizeText(competition);

  if (normalized.includes('copa do mundo') || normalized.includes('campeonato do mundo')) {
    return 'world-cup';
  }

  if (normalized.includes('libertadores') || normalized.includes('sul-americana')) {
    return 'continental-cup';
  }

  if (normalized.includes('copa') || normalized.includes('liga europa') || normalized.includes('conferencia')) {
    return 'knockout-cup';
  }

  if (normalized.includes('brasileirao') || normalized.includes('premier') || normalized.includes('liga') || normalized.includes('serie')) {
    return 'league';
  }

  return 'standard';
}

function getFamilyProfile(family) {
  const profiles = {
    'continental-cup': { awayModifier: 0.96, goalModifier: 0.95, homeModifier: 1.04, riskPenalty: 4 },
    league: { awayModifier: 0.98, goalModifier: 1, homeModifier: 1.06, riskPenalty: 0 },
    'knockout-cup': { awayModifier: 0.96, goalModifier: 0.94, homeModifier: 1.03, riskPenalty: 5 },
    standard: { awayModifier: 0.97, goalModifier: 1, homeModifier: 1.05, riskPenalty: 1 },
    'world-cup': { awayModifier: 1, goalModifier: 0.96, homeModifier: 1, riskPenalty: 4 },
  };

  return profiles[family] ?? profiles.standard;
}

function runCompetitiveContextEngine(matchInput) {
  const family = detectCompetitionFamily(matchInput.competition);
  const profile = getFamilyProfile(family);
  const knockoutPenalty = matchInput.context.isKnockout ? 3 : 0;
  const neutralPenalty = matchInput.context.isNeutralVenue ? 2 : 0;
  const goalModifier = profile.goalModifier * (matchInput.context.isKnockout ? 0.98 : 1);
  const homeModifier = matchInput.context.isNeutralVenue ? 1 : profile.homeModifier;
  const awayModifier = matchInput.context.isNeutralVenue ? 1 : profile.awayModifier;

  return {
    awayModifier,
    family,
    goalModifier,
    homeModifier,
    model: 'competitive-context-engine-v1',
    riskPenalty: profile.riskPenalty + knockoutPenalty + neutralPenalty,
    tags: [
      family,
      matchInput.context.isKnockout ? 'knockout' : 'non-knockout',
      matchInput.context.isNeutralVenue ? 'neutral-venue' : 'venue-advantage',
    ],
  };
}

export { runCompetitiveContextEngine };
