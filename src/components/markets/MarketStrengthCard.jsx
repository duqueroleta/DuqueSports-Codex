import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import '../../styles/market-strength-card.css';

function MarketStrengthCard({ market }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('market', market.id);

  function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite('market', market.id);
  }

  return (
    <Link className="market-strength-card" to={`/mercados/${market.id}`}>
      <div className="market-strength-top">
        <div>
          <span>Mercado</span>
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

      <div className="market-strength-bar" aria-label={`Força ${market.strength}%`}>
        <span style={{ width: `${market.strength}%` }} />
      </div>

      <div className="market-strength-score">
        <span>Força IA</span>
        <strong>{market.strength}%</strong>
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
    </Link>
  );
}

export default MarketStrengthCard;
