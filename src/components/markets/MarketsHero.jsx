import '../../styles/markets-hero.css';

function getSummaryContent(bestMarket, isLoading, hasError) {
  if (isLoading) {
    return { score: '--%', description: 'Calculando melhor oportunidade' };
  }

  if (hasError) {
    return { score: '--%', description: 'Resumo indisponível no momento' };
  }

  if (!bestMarket) {
    return { score: '--%', description: 'Nenhum mercado disponível' };
  }

  return {
    score: `${bestMarket.strength}%`,
    description: `${bestMarket.name} lidera o radar atual`,
  };
}

function MarketsHero({ bestMarket, hasError, isLoading }) {
  const summary = getSummaryContent(bestMarket, isLoading, hasError);

  return (
    <section className="markets-page-hero" aria-labelledby="markets-page-title">
      <div>
        <span>Radar de mercados</span>
        <h1 id="markets-page-title">Ranking completo de oportunidades</h1>
        <p>
          Mercados classificados por força estatística, risco operacional, preço médio e
          consistência de auditoria.
        </p>
      </div>

      <aside className="markets-page-summary" aria-live="polite">
        <span>Melhor mercado</span>
        <strong>{summary.score}</strong>
        <p>{summary.description}</p>
      </aside>
    </section>
  );
}

export default MarketsHero;
