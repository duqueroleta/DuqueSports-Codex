const MARKET_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'gols', label: 'Gols' },
  { id: 'ambas', label: 'Ambas' },
  { id: 'resultado', label: 'Resultado' },
  { id: 'escanteios', label: 'Escanteios' },
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

export { MARKET_FILTERS, matchMarketFilter };
