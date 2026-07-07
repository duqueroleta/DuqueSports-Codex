import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import '../../styles/market-strength-card.css';

function MarketStrengthCard({ market, rank }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('market', market.id);
  const recommendation = market.risk === 'Alto' ? 'Aguardar confirmacao' : 'Prioridade de analise';

  function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite('market', market.id);
  }

  return (
    <Link className="market-strength-card" to={`/mercados/${market.id}`}>
      <div className="market-strength-top">
        <div>
          <span>#{rank} Mercado</span>
          <h3>{market.name}</h3>
        </div>
        <div className="market-strength-actions">
          <button
            aria-label={favorite ? 'Remover mercado dos favoritos' : 'Adicionar mercado aos favoritos'}
            aria-pressed={favorite}
            className={`favorite-button ${favorite ? 'favorite-button-active' : ''}`}
            onClick={handleFavoriteClick}
            type="button"
          >
            F
          </button>
          <strong>{market.trend}</strong>
        </div>
      </div>

      <div className="market-strength-bar" aria-label={`Forca ${market.strength}%`}>
        <span style={{ width: `${market.strength}%` }} />
      </div>

      <div className="market-strength-score">
        <span>Forca IA</span>
        <strong>{market.strength}%</strong>
      </div>

      <p className="market-strength-insight">{market.insight}</p>

      <div className="market-strength-details">
        <div>
          <span>Risco</span>
          <strong>{market.risk}</strong>
        </div>
        <div>
          <span>Odd media</span>
          <strong>{market.averageOdd}</strong>
        </div>
        <div>
          <span>Auditoria</span>
          <strong>{market.audit}</strong>
        </div>
      </div>

      <div className="market-strength-recommendation">
        <span>Leitura Duque</span>
        <strong>{recommendation}</strong>
      </div>
    </Link>
  );
}

export default MarketStrengthCard;
