import { Link } from 'react-router-dom';
import TeamCrest from '../teams/TeamCrest.jsx';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { formatMatchConfidence, normalizeMatchConfidence } from '../../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../../utils/matchMetrics.js';
import { formatMatchOdds } from '../../utils/matchOdds.js';
import { getMatchVisualStyle } from '../../utils/matchVisuals.js';
import '../../styles/match-card.css';

function MatchCard({ match }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('match', match.id);
  const confidence = normalizeMatchConfidence(match.confidence);
  const confidenceDisplay = formatMatchConfidence(match.confidence);
  const metrics = normalizeMatchMetrics(match.metrics).slice(0, 3);

  return (
    <article
      aria-label={`${match.home} contra ${match.away}`}
      className="match-card"
      style={getMatchVisualStyle(match)}
    >
      <header className="match-card-top">
        <div>
          <span className="match-league">{match.league}</span>
          <strong>Hoje, {match.time}</strong>
        </div>
        <div className="match-card-actions">
          <span className={`match-status ${match.status === 'Ao vivo' ? 'match-status-live' : ''}`}>
            {match.status}
          </span>
          <button
            aria-label={favorite ? 'Remover jogo dos favoritos' : 'Adicionar jogo aos favoritos'}
            aria-pressed={favorite}
            className={`favorite-button ${favorite ? 'favorite-button-active' : ''}`}
            onClick={() => toggleFavorite('match', match.id)}
            type="button"
          >
            <span aria-hidden="true">{favorite ? '★' : '☆'}</span>
          </button>
        </div>
      </header>

      <div className="match-teams">
        <span>
          <TeamCrest size="small" teamName={match.home} />
          <strong>{match.home}</strong>
        </span>
        <div>
          <strong>{match.status === 'Ao vivo' ? match.score : 'X'}</strong>
          <small>{match.time}</small>
        </div>
        <span>
          <TeamCrest size="small" teamName={match.away} />
          <strong>{match.away}</strong>
        </span>
      </div>

      <div className="match-signal">
        <div>
          <span>Leitura da IA</span>
          <strong>{match.signal}</strong>
          <small>Odd {formatMatchOdds(match.odds)}</small>
        </div>
        <div className="match-confidence">
          <strong>{confidenceDisplay}</strong>
          <span>Score</span>
        </div>
      </div>

      <div className="match-confidence-track" aria-label={`Confianca da IA: ${confidenceDisplay}`}>
        <span style={{ width: `${confidence ?? 0}%` }} />
      </div>

      <p className="match-insight">{match.insight}</p>

      <div className="match-meta" aria-label="Indicadores principais">
        {metrics.map((metric) => <span key={metric}>{metric}</span>)}
      </div>

      <footer className="match-card-footer">
        <Link to={`/jogos/${match.id}`}>Ver analise</Link>
        <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">Bilhete pronto</a>
      </footer>
    </article>
  );
}

export default MatchCard;
