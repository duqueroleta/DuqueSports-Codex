const ALL_TIERS = 'Todos os tiers';
const ALL_MARKETS = 'Todos os mercados';

function getBatchFilterOptions(opportunities) {
  return {
    tiers: [ALL_TIERS, ...new Set(opportunities.map((item) => item.tier))],
    markets: [ALL_MARKETS, ...new Set(opportunities.map((item) => item.signal))],
  };
}

function filterBatchOpportunities(opportunities, { tier = ALL_TIERS, market = ALL_MARKETS } = {}) {
  return opportunities.filter((opportunity) => {
    const matchesTier = tier === ALL_TIERS || opportunity.tier === tier;
    const matchesMarket = market === ALL_MARKETS || opportunity.signal === market;

    return matchesTier && matchesMarket;
  });
}

export { ALL_MARKETS, ALL_TIERS, filterBatchOpportunities, getBatchFilterOptions };
