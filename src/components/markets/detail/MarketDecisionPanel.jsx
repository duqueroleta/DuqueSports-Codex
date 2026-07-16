import { AFFILIATE_LINKS } from '../../../config/affiliateLinks.js';
import '../../../styles/market-decision-panel.css';

function getDecisionLabel(market) {
  if (market.risk === 'Alto') {
    return 'Aguardar melhor ponto';
  }

  if (market.strength >= 85) {
    return 'Prioridade alta';
  }

  return 'Monitorar com critério';
}

function MarketDecisionPanel({ market }) {
  const decisionLabel = getDecisionLabel(market);

  return (
    <section className="market-decision-panel" aria-label="Decisão rápida do mercado">
      <div>
        <span>Decisão Duque</span>
        <strong>{decisionLabel}</strong>
        <p>
          Força {market.strength}% com risco {market.risk.toLowerCase()} e odd média {market.averageOdd}.
        </p>
      </div>

      <div className="market-decision-actions">
        <a href="#oportunidades-relacionadas">Ver oportunidades</a>
        <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
          Bilhete pronto
        </a>
      </div>
    </section>
  );
}

export default MarketDecisionPanel;
