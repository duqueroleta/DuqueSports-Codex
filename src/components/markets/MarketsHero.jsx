import '../../styles/markets-hero.css';

function getSummaryContent(bestMarket, isLoading, hasError) {
  if (isLoading || hasError || !bestMarket) {
    return { score: '--%', description: 'Radar em processamento' };
  }

  return {
    score: `${bestMarket.strength}%`,
    description: bestMarket.name,
  };
}

function MarketsHero({ bestMarket, hasError, isLoading }) {
  const summary = getSummaryContent(bestMarket, isLoading, hasError);

  return (
    <header className="markets-page-hero" aria-labelledby="markets-page-title">
      <div>
        <span>Radar de mercados</span>
        <h1 id="markets-page-title">Oportunidades por mercado</h1>
      </div>

      <div className="markets-page-summary" aria-live="polite">
        <span>Melhor mercado</span>
        <strong>{summary.score}</strong>
        <p>{summary.description}</p>
      </div>
    </header>
  );
}

export default MarketsHero;
