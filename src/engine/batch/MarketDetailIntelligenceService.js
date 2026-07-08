import { runMarketAuditService } from './MarketAuditService.js';

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function marketMatchesOpportunity(marketName, opportunity) {
  const normalizedMarket = normalizeText(marketName);
  const normalizedSignal = normalizeText(opportunity.signal);
  const probabilities = opportunity.projection?.probabilities ?? {};

  if (normalizedMarket.includes('over 2.5')) {
    return normalizedSignal.includes('over 2.5') || probabilities.over25 >= 52;
  }

  if (normalizedMarket.includes('ambas')) {
    return normalizedSignal.includes('ambas') || probabilities.btts >= 52;
  }

  if (normalizedMarket.includes('under')) {
    return normalizedSignal.includes('under') || probabilities.under25 >= 52;
  }

  if (normalizedMarket.includes('favorito') || normalizedMarket.includes('resultado')) {
    return normalizedSignal.includes('vence') || normalizedSignal.includes('empate');
  }

  return normalizedSignal.includes(normalizedMarket);
}

function average(items, selector) {
  if (!items.length) {
    return 0;
  }

  return Math.round(items.reduce((total, item) => total + selector(item), 0) / items.length);
}

function buildMarketRiskAlert(market, relatedOpportunities) {
  if (!relatedOpportunities.length) {
    return `Mercado ${market.name} sem oportunidade forte no batch atual. Manter em monitoramento ate surgir aderencia estatistica.`;
  }

  const highRiskOpportunity = relatedOpportunities.find((opportunity) => !opportunity.risk.startsWith('Nenhum risco'));

  if (highRiskOpportunity) {
    return highRiskOpportunity.risk;
  }

  return 'Nenhum risco estrutural critico nos jogos relacionados ao mercado.';
}

function runMarketDetailIntelligence({ market, opportunities }) {
  const relatedOpportunities = opportunities
    .filter((opportunity) => marketMatchesOpportunity(market.name, opportunity))
    .sort((left, right) => right.opportunityScore - left.opportunityScore);
  const topOpportunity = relatedOpportunities[0] ?? null;

  return {
    model: 'market-detail-intelligence-v1',
    marketId: market.id,
    marketName: market.name,
    relatedOpportunities,
    summary: {
      relatedGames: relatedOpportunities.length,
      averageScore: average(relatedOpportunities, (item) => item.opportunityScore),
      averageProbability: average(relatedOpportunities, (item) => item.probability),
      topOpportunity,
    },
    explanation: topOpportunity
      ? `${market.name} tem aderencia com ${relatedOpportunities.length} jogo(s) do ranking atual. O melhor sinal vem de ${topOpportunity.home} x ${topOpportunity.away}.`
      : `${market.name} ainda nao possui jogo classificado como oportunidade ativa pelo batch atual.`,
    riskAlert: buildMarketRiskAlert(market, relatedOpportunities),
    audit: runMarketAuditService({ market, relatedOpportunities }),
  };
}

export { marketMatchesOpportunity, runMarketDetailIntelligence };
