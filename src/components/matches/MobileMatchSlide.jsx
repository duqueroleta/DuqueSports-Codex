import { Link } from 'react-router-dom';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { getMatchConfidenceLabel, normalizeMatchConfidence } from '../../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../../utils/matchMetrics.js';
import { formatMatchOdds } from '../../utils/matchOdds.js';
import { getMatchVisualStyle } from '../../utils/matchVisuals.js';
import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/mobile-match-slide.css';

function formatMobileMetric(metric) {
  const match = metric.match(/^(.+?)\s+([+\-]?\d+(?:[.,]\d+)?%?)$/);

  if (!match) {
    return {
      label: metric,
      value: 'IA',
    };
  }

  return {
    label: match[1],
    value: match[2],
  };
}

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

        <div className="mobile-match-card-badge">
          <span>Resumo IA</span>
          <strong>{getMatchConfidenceLabel(match.confidence)}</strong>
        </div>

        <div className="mobile-matchup">
          <div>
            <TeamCrest size="large" teamName={match.home} />
            <strong>{match.home}</strong>
            <small>Mandante</small>
          </div>

          <div className="mobile-matchup-center">
            <span>{match.status === 'Ao vivo' ? match.status : 'Partida'}</span>
            <strong>{match.status === 'Ao vivo' ? match.score : 'X'}</strong>
            <small>{match.time}</small>
          </div>

          <div>
            <TeamCrest size="large" teamName={match.away} />
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
            <small>Odd média <b>{formatMatchOdds(match.odds)}</b></small>
          </div>
        </div>

        <div className="mobile-key-metrics" aria-label="Indicadores principais">
          {metrics.map((metric) => {
            const chip = formatMobileMetric(metric);

            return (
              <span key={metric}>
                <strong>{chip.value}</strong>
                <small>{chip.label}</small>
              </span>
            );
          })}
        </div>

        <div className="mobile-match-actions-v2" aria-label="Ações principais do jogo">
          <div className="mobile-match-actions-label">
            <span>Escolha seu fluxo</span>
            <small>Estudar ou abrir bilhete</small>
          </div>
          <div className="mobile-match-actions-buttons">
            <Link to={`/jogos/${match.id}`}>
              <span aria-hidden="true">AI</span>
              <span>
                <small>Estudar jogo</small>
                <strong>Análise completa</strong>
              </span>
            </Link>
            <a
              aria-label={`Abrir bilhete pronto para ${match.home} contra ${match.away}`}
              href={AFFILIATE_LINKS.readyBetslip}
              rel="noreferrer"
              target="_blank"
            >
              <span aria-hidden="true">R$</span>
              <span>
                <small>Apostar agora</small>
                <strong>Bilhete pronto</strong>
              </span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default MobileMatchSlide;
