import { Link } from 'react-router-dom';
import { AFFILIATE_LINKS } from '../../../config/affiliateLinks.js';
import TeamCrest from '../../teams/TeamCrest.jsx';
import { getMatchConfidenceLabel, normalizeMatchConfidence } from '../../../utils/matchConfidence.js';
import { formatMatchOdds } from '../../../utils/matchOdds.js';
import { getMatchVisualStyle } from '../../../utils/matchVisuals.js';
import '../../../styles/match-detail-hero.css';

function MatchDetailHero({ match }) {
  if (!match) {
    return null;
  }

  const confidence = normalizeMatchConfidence(match.confidence);
  const confidenceLabel = getMatchConfidenceLabel(confidence);

  return (
    <section
      aria-labelledby="match-detail-title"
      className="match-detail-hero-v2"
      style={getMatchVisualStyle(match)}
    >
      <h1 id="match-detail-title">{match.home} x {match.away}</h1>

      <header className="match-detail-toolbar">
        <Link to="/jogos" aria-label="Voltar aos jogos">
          <span aria-hidden="true">&lsaquo;</span>
          Jogos
        </Link>
        <div>
          <span>{match.league}</span>
          <strong>Hoje, {match.time}</strong>
        </div>
        <small>{match.status}</small>
      </header>

      <div className="match-detail-stage">
        <div className="match-detail-team">
          <TeamCrest size="large" teamName={match.home} />
          <strong>{match.home}</strong>
          <span>Mandante</span>
        </div>

        <div
          aria-label={`Duque Score ${confidence ?? 'indisponível'}`}
          className="match-detail-score"
          style={{ '--detail-score-progress': `${confidence ?? 0}%` }}
        >
          <div>
            <span>Duque Score</span>
            <strong>{confidence ?? '--'}</strong>
            <small>{confidenceLabel}</small>
          </div>
        </div>

        <div className="match-detail-team">
          <TeamCrest size="large" teamName={match.away} />
          <strong>{match.away}</strong>
          <span>Visitante</span>
        </div>
      </div>

      <div className="match-detail-verdict">
        <div>
          <span>Leitura principal da IA</span>
          <strong>{match.signal}</strong>
          <p>{match.insight}</p>
        </div>
        <small>
          Odd média
          <strong>{formatMatchOdds(match.odds)}</strong>
        </small>
      </div>

      <div className="match-detail-quick-actions" aria-label="Ações rápidas da análise">
        <a href="#fundamentos">
          <span aria-hidden="true">AI</span>
          <span>
            <small>Estudar jogo</small>
            <strong>Ver fundamentos</strong>
          </span>
        </a>
        <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
          <span aria-hidden="true">R$</span>
          <span>
            <small>Apostar agora</small>
            <strong>Bilhete pronto</strong>
          </span>
        </a>
      </div>

      <div className="match-detail-kpis" aria-label="Resumo rápido da análise">
        <span>
          <small>Confiança</small>
          <strong>{confidence ?? '--'}</strong>
        </span>
        <span>
          <small>Mercado</small>
          <strong>{match.signal}</strong>
        </span>
        <span>
          <small>Odd</small>
          <strong>{formatMatchOdds(match.odds)}</strong>
        </span>
      </div>
    </section>
  );
}

export default MatchDetailHero;
