import { Link } from 'react-router-dom';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { getMatchConfidenceLabel, normalizeMatchConfidence } from '../../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../../utils/matchMetrics.js';
import { formatMatchOdds } from '../../utils/matchOdds.js';
import { getMatchVisualStyle } from '../../utils/matchVisuals.js';
import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/mobile-match-slide.css';

function MobileMatchSlide({ match }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite('match', match.id);
  const confidence = normalizeMatchConfidence(match.confidence);
  const metrics = normalizeMatchMetrics(match.metrics).slice(0, 3);

  return (
    <article className="mobile-match-slide" aria-label={`${match.home} contra ${match.away}`}>
      <div
        className="mobile-match-card-v2"
        style={{
          ...getMatchVisualStyle(match),
          '--score-progress': `${(confidence ?? 0) * 3.6}deg`,
        }}
      >
        <header className="mobile-match-card-header">
          <div>
            <span>{match.league}</span>
            <strong>Hoje, {match.time}</strong>
          </div>
          <div>
            <span className={match.status === 'Ao vivo' ? 'mobile-live-status' : ''}>{match.status}</span>
            <button
              aria-label={favorite ? 'Remover jogo dos favoritos' : 'Adicionar jogo aos favoritos'}
              aria-pressed={favorite}
              className={favorite ? 'mobile-favorite mobile-favorite-active' : 'mobile-favorite'}
              onClick={() => toggleFavorite('match', match.id)}
              type="button"
            >
              <span aria-hidden="true">{favorite ? '★' : '☆'}</span>
            </button>
          </div>
        </header>

        <div className="mobile-matchup">
          <div>
            <TeamCrest teamName={match.home} />
            <strong>{match.home}</strong>
            <small>Mandante</small>
          </div>

          <div className="mobile-matchup-center">
            <span>{match.status === 'Ao vivo' ? match.status : 'Partida'}</span>
            <strong>{match.status === 'Ao vivo' ? match.score : 'X'}</strong>
            <small>{match.time}</small>
          </div>

          <div>
            <TeamCrest teamName={match.away} />
            <strong>{match.away}</strong>
            <small>Visitante</small>
          </div>
        </div>

        <div className="mobile-ai-summary">
          <div className="mobile-score-gauge">
            <div>
              <span>Duque Score</span>
              <strong>{confidence ?? '--'}</strong>
              <small>{getMatchConfidenceLabel(match.confidence)}</small>
            </div>
          </div>

          <div className="mobile-primary-pick">
            <span>Leitura principal</span>
            <strong>{match.signal}</strong>
            <p>{match.insight}</p>
            <small>Odd media <b>{formatMatchOdds(match.odds)}</b></small>
          </div>
        </div>

        <div className="mobile-key-metrics" aria-label="Indicadores principais">
          {metrics.map((metric) => <span key={metric}>{metric}</span>)}
        </div>

        <div className="mobile-match-actions-v2">
          <Link to={`/jogos/${match.id}`}>Analise completa</Link>
          <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">Bilhete pronto</a>
        </div>
      </div>
    </article>
  );
}

export default MobileMatchSlide;
