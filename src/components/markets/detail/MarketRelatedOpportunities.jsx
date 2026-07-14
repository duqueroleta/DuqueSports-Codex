import { Link } from 'react-router-dom';
import '../../../styles/market-related-opportunities.css';

function MarketRelatedOpportunities({ intelligence }) {
  const opportunities = intelligence?.relatedOpportunities?.slice(0, 3) ?? [];

  return (
    <section
      className="market-related-opportunities"
      id="oportunidades-relacionadas"
      aria-labelledby="market-related-title"
    >
      <header>
        <div>
          <span>Jogos relacionados</span>
          <strong id="market-related-title">Melhores aderencias</strong>
        </div>
        <small>{opportunities.length} sinais</small>
      </header>

      {opportunities.length ? (
        <div className="market-related-track">
          {opportunities.map((opportunity) => (
            <article key={opportunity.matchId}>
              <span>{opportunity.league}</span>
              <strong>{opportunity.home} x {opportunity.away}</strong>
              <div>
                <p><b>{opportunity.opportunityScore}</b><small>Score</small></p>
                <p><b>{opportunity.probability}%</b><small>Prob.</small></p>
                <p><b>{opportunity.confidence}</b><small>Confianca</small></p>
              </div>
              <Link to={`/jogos/${opportunity.matchId}`}>Abrir analise</Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="market-related-empty">
          Nenhum jogo atingiu o corte estatistico para este mercado.
        </div>
      )}
    </section>
  );
}

export default MarketRelatedOpportunities;
