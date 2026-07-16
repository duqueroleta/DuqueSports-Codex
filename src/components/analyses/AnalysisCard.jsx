import { Link } from 'react-router-dom';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/analysis-card.css';

function getAnalysisDecision(opportunity) {
  if (opportunity.opportunityScore >= 88 && opportunity.confidence >= 85) {
    return { label: 'Prioridade máxima', tone: 'hot' };
  }

  if (opportunity.risk.startsWith('Nenhum risco')) {
    return { label: 'Entrada limpa', tone: 'safe' };
  }

  return { label: 'Validar contexto', tone: 'watch' };
}

function AnalysisCard({ opportunity, rank }) {
  const decision = getAnalysisDecision(opportunity);

  return (
    <article className={`analysis-library-card analysis-decision-${decision.tone}`} aria-label={`${opportunity.home} contra ${opportunity.away}`}>
      <header>
        <div>
          <span>#{rank} {opportunity.tier}</span>
          <small>{opportunity.league} - Hoje, {opportunity.time}</small>
        </div>
        <div className="analysis-score-stack">
          <strong>{opportunity.opportunityScore}</strong>
          <small>{decision.label}</small>
        </div>
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
        <p><strong>{opportunity.confidence}</strong><span>Confiança</span></p>
        <p><strong>{opportunity.dataQualityScore}</strong><span>Qualidade</span></p>
      </div>

      <p className="analysis-library-risk">{opportunity.risk}</p>

      <div className="analysis-library-actions">
        <Link to={`/jogos/${opportunity.matchId}`}>Abrir relatório</Link>
        <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
          Bilhete pronto
        </a>
      </div>
    </article>
  );
}

export default AnalysisCard;
