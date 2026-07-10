import '../../../styles/market-intelligence-panel.css';

function MarketIntelligencePanel({ intelligence }) {
  if (!intelligence) {
    return null;
  }

  const topOpportunity = intelligence.summary.topOpportunity;
  const topOpportunityLabel = topOpportunity
    ? `${topOpportunity.home} x ${topOpportunity.away}`
    : 'Monitorar';

  return (
    <section className="market-intelligence-panel" aria-label="Inteligência do mercado">
      <div className="market-intelligence-main">
        <span>Market Intelligence</span>
        <strong>{intelligence.summary.relatedGames} jogos relacionados</strong>
        <p>{intelligence.explanation}</p>
      </div>

      <div className="market-intelligence-grid">
        <article>
          <span>Score médio</span>
          <strong>{intelligence.summary.averageScore}</strong>
        </article>
        <article>
          <span>Probabilidade</span>
          <strong>{intelligence.summary.averageProbability}%</strong>
        </article>
        <article>
          <span>Top jogo</span>
          <strong>{topOpportunityLabel}</strong>
        </article>
        <article className="market-intelligence-risk">
          <span>Risco</span>
          <p>{intelligence.riskAlert}</p>
        </article>
      </div>
    </section>
  );
}

export default MarketIntelligencePanel;
