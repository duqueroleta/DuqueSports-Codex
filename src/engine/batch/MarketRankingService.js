const ALL_MARKET_COMPETITIONS = 'Todos os campeonatos';

function getMarketTier(score) {
  if (score >= 82) {
    return 'Elite';
  }

  if (score >= 72) {
    return 'Forte';
  }

  if (score >= 62) {
    return 'Monitorar';
  }

  return 'Baixa prioridade';
}

function average(items, selector) {
  if (!items.length) {
    return 0;
  }

  return Math.round(items.reduce((total, item) => total + selector(item), 0) / items.length);
}

function runMarketRankingService(opportunities) {
  const marketGroups = opportunities.reduce((groups, opportunity) => {
    const currentGroup = groups.get(opportunity.signal) ?? [];

    currentGroup.push(opportunity);
    groups.set(opportunity.signal, currentGroup);

    return groups;
  }, new Map());
  const rankings = [...marketGroups.entries()]
    .map(([marketName, items]) => {
      const sortedItems = [...items].sort((left, right) => right.opportunityScore - left.opportunityScore);
      const averageScore = average(sortedItems, (item) => item.opportunityScore);
      const averageProbability = average(sortedItems, (item) => item.probability);

      return {
        marketName,
        averageScore,
        averageProbability,
        averageConfidence: average(sortedItems, (item) => item.confidence),
        opportunitiesCount: sortedItems.length,
        tier: getMarketTier(averageScore),
        competitions: [...new Set(sortedItems.map((item) => item.league))],
        topOpportunity: sortedItems[0],
      };
    })
    .sort((left, right) => right.averageScore - left.averageScore);

  return {
    model: 'market-ranking-service-v1',
    rankings,
    filterOptions: {
      competitions: [ALL_MARKET_COMPETITIONS, ...new Set(opportunities.map((item) => item.league))],
    },
  };
}

function filterMarketRankings(rankings, competition = ALL_MARKET_COMPETITIONS) {
  if (competition === ALL_MARKET_COMPETITIONS) {
    return rankings;
  }

  return rankings.filter((ranking) => ranking.competitions.includes(competition));
}

export { ALL_MARKET_COMPETITIONS, filterMarketRankings, runMarketRankingService };
