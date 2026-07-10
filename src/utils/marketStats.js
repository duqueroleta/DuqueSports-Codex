function getStrongestMarket(markets = []) {
  return markets.reduce((strongest, market) => {
    if (!strongest || market.strength > strongest.strength) {
      return market;
    }

    return strongest;
  }, null);
}

export { getStrongestMarket };
