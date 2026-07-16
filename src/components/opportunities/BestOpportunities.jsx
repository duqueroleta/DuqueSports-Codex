import { Link } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getBatchAnalysis } from '../../services/batchAnalysisService.js';
import '../../styles/best-opportunities.css';

function BestOpportunities() {
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const opportunities = batchAnalysis?.topOpportunities ?? [];
  const leader = opportunities[0];

  return (
    <section className="best-opportunities" aria-labelledby="best-opportunities-title">
      <div className="best-opportunities-header">
        <div className="section-heading">
          <span>Ranking Engine</span>
          <h2 id="best-opportunities-title">Melhores oportunidades do dia</h2>
          <p>Jogos ordenados pelo Duque Score Engine com probabilidade calibrada, confiança, qualidade dos dados e risco.</p>
        </div>

        <aside className="best-opportunities-summary" aria-label="Resumo do ranking">
          <span>Top oportunidade</span>
          <strong>{leader ? `${leader.home} x ${leader.away}` : 'Calculando ranking'}</strong>
          <div>
            <p>{batchAnalysis?.analyzedMatches ?? 0} jogos analisados</p>
            <p>{batchAnalysis?.averageOpportunityScore ?? 0}/100 média top 5</p>
          </div>
        </aside>
      </div>

      <div className="best-opportunities-grid">
        {opportunities.slice(0, 3).map((opportunity, index) => (
          <Link className="opportunity-card" key={opportunity.matchId} to={`/jogos/${opportunity.matchId}`}>
            <span>#{index + 1} • {opportunity.tier}</span>
            <strong>{opportunity.home} x {opportunity.away}</strong>
            <small>{opportunity.league} • Hoje, {opportunity.time}</small>
            <div className="opportunity-card-metrics">
              <p>
                <b>{opportunity.opportunityScore}</b>
                <span>score</span>
              </p>
              <p>
                <b>{opportunity.probability}%</b>
                <span>{opportunity.signal}</span>
              </p>
              <p>
                <b>{opportunity.confidence}</b>
                <span>confiança</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default BestOpportunities;
