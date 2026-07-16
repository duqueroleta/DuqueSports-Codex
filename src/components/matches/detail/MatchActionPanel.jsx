import { AFFILIATE_LINKS } from '../../../config/affiliateLinks.js';
import '../../../styles/match-action-panel.css';

function MatchActionPanel({ signal, betslipUrl = AFFILIATE_LINKS.readyBetslip }) {
  return (
    <section className="detail-action-panel" id="bilhete" aria-label="Ações da análise">
      <div>
        <span>Decisão rápida</span>
        <strong>{signal}</strong>
        <p>Abra o bilhete somente se a leitura fizer sentido para sua estratégia.</p>
      </div>
      <small>Entrada sugerida pelo modelo</small>
      <a href={betslipUrl} rel="noreferrer" target="_blank">
        <span aria-hidden="true">R$</span>
        <span>
          <small>Apostar agora</small>
          <strong>Abrir bilhete pronto</strong>
        </span>
      </a>
    </section>
  );
}

export default MatchActionPanel;
