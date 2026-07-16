import { Link } from 'react-router-dom';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import '../../styles/market-strength-card.css';

function getRiskTone(risk) {
  if (risk === 'Baixo' || risk === 'Controlado') {
    return 'safe';
  }

  if (risk === 'Alto') {
    return 'hot';
  }

  return 'watch';
}

function MarketStrengthCard({ market, rank }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('market', market.id);
  const recommendation = market.risk === 'Alto' ? 'Aguardar confirmação' : 'Prioridade de análise';
  const riskTone = getRiskTone(market.risk);

  return (
    <article className={`market-strength-card market-risk-${riskTone}`} aria-label={market.name}>
      <header className="market-strength-top">
        <div>
          <span>#{rank} no radar</span>
          <h3>{market.name}</h3>
        </div>
        <button
          aria-label={favorite ? 'Remover mercado dos favoritos' : 'Adicionar mercado aos favoritos'}
          aria-pressed={favorite}
          className={`favorite-button ${favorite ? 'favorite-button-active' : ''}`}
          onClick={() => toggleFavorite('market', market.id)}
          type="button"
        >
          <span aria-hidden="true">{favorite ? '★' : '☆'}</span>
        </button>
      </header>

      <div className="market-strength-score">
        <div>
          <span>Força IA</span>
          <strong>{market.strength}%</strong>
        </div>
        <small>{market.trend} tendência</small>
      </div>

      <div className="market-strength-bar" aria-label={`Força ${market.strength}%`}>
        <span style={{ width: `${market.strength}%` }} />
      </div>

      <div className="market-strength-details">
        <div>
          <span>Risco</span>
          <strong>{market.risk}</strong>
        </div>
        <div>
          <span>Odd média</span>
          <strong>{market.averageOdd}</strong>
        </div>
        <div>
          <span>Auditoria</span>
          <strong>{market.audit}</strong>
        </div>
      </div>

      <p className="market-strength-insight">{market.insight}</p>

      <footer className="market-strength-footer">
        <div>
          <span>Leitura Duque</span>
          <strong>{recommendation}</strong>
        </div>
        <div className="market-strength-actions">
          <Link to={`/mercados/${market.id}`}>Ver análise</Link>
          <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
            Bilhete pronto
          </a>
        </div>
      </footer>
    </article>
  );
}

export default MarketStrengthCard;
