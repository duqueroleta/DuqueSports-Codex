const CANONICAL_SETTLEMENT_RULE_VERSION = 'canonical-market-settlement-v1';

function createSettlement(status, observedSelectionKey = null) {
  return {
    ruleVersion: CANONICAL_SETTLEMENT_RULE_VERSION,
    status,
    observedSelectionKey: status === 'settled' ? observedSelectionKey : null,
  };
}

function hasValidScore(score) {
  return Number.isInteger(score?.home)
    && score.home >= 0
    && Number.isInteger(score?.away)
    && score.away >= 0;
}

function settleTotal(line, observedTotal) {
  if (!Number.isFinite(line) || !Number.isInteger(line * 4) || !Number.isInteger(observedTotal)) {
    return createSettlement('void');
  }

  const fraction = Number((line % 1).toFixed(2));

  if (fraction === 0 && observedTotal === line) {
    return createSettlement('push');
  }

  if ((fraction === 0.25 && observedTotal === Math.floor(line))
    || (fraction === 0.75 && observedTotal === Math.ceil(line))) {
    return createSettlement('partial');
  }

  return createSettlement('settled', observedTotal > line ? 'over' : 'under');
}

function getObservedCorners(result) {
  const corners = result?.statistics?.corners;

  if (!Number.isInteger(corners?.home)
    || corners.home < 0
    || !Number.isInteger(corners?.away)
    || corners.away < 0) {
    return null;
  }

  return corners.home + corners.away;
}

function settleCanonicalMarket(market, result) {
  if (!market || market.period !== 'full-match') {
    return createSettlement('void');
  }

  const score = result?.score;

  if (market.type === 'total-corners') {
    const observedCorners = getObservedCorners(result);
    return observedCorners === null
      ? createSettlement('void')
      : settleTotal(market.line, observedCorners);
  }

  if (!hasValidScore(score)) {
    return createSettlement('void');
  }

  if (market.type === 'match-result') {
    const observedSelectionKey = score.home === score.away
      ? 'draw'
      : score.home > score.away ? 'home' : 'away';
    return createSettlement('settled', observedSelectionKey);
  }

  if (market.type === 'total-goals') {
    return settleTotal(market.line, score.home + score.away);
  }

  if (market.type === 'both-teams-score') {
    return createSettlement('settled', score.home > 0 && score.away > 0 ? 'yes' : 'no');
  }

  return createSettlement('void');
}

export {
  CANONICAL_SETTLEMENT_RULE_VERSION,
  settleCanonicalMarket,
  settleTotal,
};
