import { Link } from 'react-router-dom';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import { formatMatchConfidence, getMatchConfidenceLabel, normalizeMatchConfidence } from '../../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../../utils/matchMetrics.js';
import { formatMatchOdds } from '../../utils/matchOdds.js';
import { getMatchVisualStyle } from '../../utils/matchVisuals.js';
import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/home-match-decision-card.css';

function formatDecisionMetric(metric) {
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

function buildProjectedCardMetrics(match) {
  const confidence = Number.isFinite(match.confidence) ? match.confidence : 72;
  const homeXg = 1.05 + (confidence / 100);
  const awayXg = 0.82 + ((100 - confidence) / 130);
  const totalXg = homeXg + awayXg;
  const shots = Math.round(14 + (totalXg * 2.2));
  const shotsOnTarget = Math.round(4 + (totalXg * 1.1));
  const corners = Math.round(5 + (totalXg * 1.25));

  return [
    `xG ${totalXg.toFixed(2)}`,
    `Finaliz. ${shots}`,
    `Alvo ${shotsOnTarget}`,
    `Escant. ${corners}`,
  ];
}

function getProjectionType(signal = '') {
  const normalizedSignal = signal.toLocaleLowerCase('pt-BR');

  if (normalizedSignal.includes('escanteio')) {
    return 'Escanteios';
  }

  if (normalizedSignal.includes('cart')) {
    return 'Cartoes';
  }

  if (normalizedSignal.includes('over') || normalizedSignal.includes('under') || normalizedSignal.includes('gol')) {
    return 'Gols';
  }

  if (normalizedSignal.includes('ambas')) {
    return 'Ambas marcam';
  }

  return 'Resultado';
}

function HomeMatchDecisionCard({ isLead = false, match }) {
  const confidence = normalizeMatchConfidence(match.confidence);
  const confidenceDisplay = formatMatchConfidence(match.confidence);
  const confidenceLabel = getMatchConfidenceLabel(confidence);
  const metrics = normalizeMatchMetrics(buildProjectedCardMetrics(match)).slice(0, 4);
  const projectionType = getProjectionType(match.signal);

  return (
    <article
      aria-label={`${match.home} contra ${match.away}`}
      className={isLead ? 'home-match-decision-card home-match-decision-card-lead' : 'home-match-decision-card'}
      style={{
        ...getMatchVisualStyle(match),
        '--home-card-score': `${confidence ?? 0}%`,
      }}
    >
      <header className="home-match-card-header">
        <div>
          <span>{match.league}</span>
          <strong>Hoje, {match.time}</strong>
        </div>
        <small>{match.status}</small>
      </header>

      <div className="home-match-card-teams">
        <div>
          <TeamCrest teamName={match.home} />
          <strong>{match.home}</strong>
        </div>

        <div className="home-match-card-score">
          <span>Duque Score</span>
          <strong>{confidenceDisplay}</strong>
          <small>{confidenceLabel}</small>
        </div>

        <div>
          <TeamCrest teamName={match.away} />
          <strong>{match.away}</strong>
        </div>
      </div>

      <div className="home-match-card-decision">
        <span>
          Projecao futura
          <em>{projectionType}</em>
        </span>
        <strong>{match.signal}</strong>
        <small>Cenario mais forte | odd media {formatMatchOdds(match.odds)}</small>
      </div>

      <div className="home-match-card-metrics" aria-label="Indicadores resumidos">
        <p>Estatisticas provaveis</p>
        {metrics.map((metric) => {
          const chip = formatDecisionMetric(metric);

          return (
            <span key={metric}>
              <strong>{chip.value}</strong>
              <small>{chip.label}</small>
            </span>
          );
        })}
      </div>

      <footer className="home-match-card-actions">
        <Link to={`/jogos/${match.id}`}>Ver projecao</Link>
        <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
          Bilhete pronto
        </a>
      </footer>
    </article>
  );
}

export default HomeMatchDecisionCard;
