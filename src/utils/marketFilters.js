const MARKET_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'gols', label: 'Gols' },
  { id: 'ambas', label: 'Ambas' },
  { id: 'resultado', label: 'Resultado' },
  { id: 'escanteios', label: 'Escanteios' },
];

const MARKET_LIST_FILTERS = [
  'Todos',
  'Gols',
  'Resultado',
  'Escanteios',
  'Baixo risco',
  'Alta força',
];

function matchMarketFilter(match, activeMarket) {
  if (activeMarket === 'todos') {
    return true;
  }

  const signal = match.signal.toLowerCase();
  const metrics = match.metrics.join(' ').toLowerCase();

  if (activeMarket === 'gols') {
    return signal.includes('over') || signal.includes('under') || signal.includes('gol');
  }

  if (activeMarket === 'ambas') {
    return signal.includes('ambas') || metrics.includes('btts');
  }

  if (activeMarket === 'resultado') {
    return signal.includes('vence') || signal.includes('dnb');
  }

  if (activeMarket === 'escanteios') {
    return signal.includes('escanteios') || metrics.includes('escanteios');
  }

  return true;
}

function matchMarketListFilter(market, activeFilter) {
  if (activeFilter === 'Todos') {
    return true;
  }

  if (activeFilter === 'Gols') {
    return market.name.includes('gols')
      || market.name.includes('Over')
      || market.name.includes('Under');
  }

  if (activeFilter === 'Resultado') {
    return market.name.includes('vence') || market.name.includes('Empate');
  }

  if (activeFilter === 'Escanteios') {
    return market.name.includes('Escanteios');
  }

  if (activeFilter === 'Baixo risco') {
    return market.risk === 'Baixo' || market.risk === 'Controlado';
  }

  if (activeFilter === 'Alta força') {
    return market.strength >= 85;
  }

  return true;
}

export {
  MARKET_FILTERS,
  MARKET_LIST_FILTERS,
  matchMarketFilter,
  matchMarketListFilter,
};
