import { Link } from 'react-router-dom';
import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/analysis-card.css';

function AnalysisCard({ opportunity, rank }) {
  return (
    <article className="analysis-library-card" aria-label={`${opportunity.home} contra ${opportunity.away}`}>
      <header>
        <div>
          <span>#{rank} {opportunity.tier}</span>
          <small>{opportunity.league} - Hoje, {opportunity.time}</small>
        </div>
        <strong>{opportunity.opportunityScore}</strong>
      </header>

      <div className="analysis-library-matchup">
        <span><TeamCrest size="small" teamName={opportunity.home} /><strong>{opportunity.home}</strong></span>
        <i>X</i>
        <span><TeamCrest size="small" teamName={opportunity.away} /><strong>{opportunity.away}</strong></span>
      </div>

      <div className="analysis-library-pick">
        <div>
          <span>Mercado recomendado</span>
          <strong>{opportunity.signal}</strong>
        </div>
        <small>{opportunity.status}</small>
      </div>

      <div className="analysis-library-metrics">
        <p><strong>{opportunity.probability}%</strong><span>Probabilidade</span></p>
        <p><strong>{opportunity.confidence}</strong><span>Confianca</span></p>
        <p><strong>{opportunity.dataQualityScore}</strong><span>Qualidade</span></p>
      </div>

      <p className="analysis-library-risk">{opportunity.risk}</p>

      <Link to={`/jogos/${opportunity.matchId}`}>Abrir relatorio completo</Link>
    </article>
  );
}

export default AnalysisCard;
