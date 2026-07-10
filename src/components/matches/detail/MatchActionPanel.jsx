import { AFFILIATE_LINKS } from '../../../config/affiliateLinks.js';
import '../../../styles/match-action-panel.css';

function MatchActionPanel({ signal, betslipUrl = AFFILIATE_LINKS.readyBetslip }) {
  return (
    <section className="detail-action-panel" aria-label="Acoes da analise">
      <div>
        <span>Decisao rapida</span>
        <strong>{signal}</strong>
        <p>Abra o bilhete somente se a leitura fizer sentido para sua estrategia.</p>
      </div>
      <a href={betslipUrl} rel="noreferrer" target="_blank">
        Abrir bilhete pronto
      </a>
    </section>
  );
}

export default MatchActionPanel;
