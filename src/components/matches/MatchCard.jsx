import { Link } from 'react-router-dom';
import TeamCrest from '../teams/TeamCrest.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import '../../styles/match-card.css';

function MatchCard({ match }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('match', match.id);

  function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite('match', match.id);
  }

  return (
    <Link className="match-card" to={`/jogos/${match.id}`}>
      <div className="match-card-top">
        <div>
          <span className="match-league">{match.league}</span>
          <strong>{match.time}</strong>
        </div>
        <div className="match-card-actions">
          <button
            aria-label={favorite ? 'Remover jogo dos favoritos' : 'Adicionar jogo aos favoritos'}
            aria-pressed={favorite}
            className={`favorite-button ${favorite ? 'favorite-button-active' : ''}`}
            onClick={handleFavoriteClick}
            type="button"
          >
            F
          </button>
          <span className={`match-status ${match.status === 'Ao vivo' ? 'match-status-live' : ''}`}>
            {match.status}
          </span>
        </div>
      </div>

      <div className="match-teams">
        <span>
          <TeamCrest size="small" teamName={match.home} />
          {match.home}
        </span>
        <strong>{match.score}</strong>
        <span>
          {match.away}
          <TeamCrest size="small" teamName={match.away} />
        </span>
      </div>

      <div className="match-signal">
        <div>
          <span>Sinal IA</span>
          <strong>{match.signal}</strong>
        </div>
        <div className="match-confidence">
          <span>{match.confidence}%</span>
        </div>
      </div>

      <div className="match-confidence-track" aria-label={`Confianca da IA em ${match.confidence}%`}>
        <span style={{ width: `${match.confidence}%` }} />
      </div>

      <p className="match-insight">{match.insight}</p>

      <div className="match-meta">
        <strong>Odd {match.odds}</strong>
        {match.metrics.map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </div>
    </Link>
  );
}

export default MatchCard;
