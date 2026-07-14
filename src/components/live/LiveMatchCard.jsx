import { Link } from 'react-router-dom';
import TeamCrest from '../teams/TeamCrest.jsx';
import {
  formatLiveMinute,
  formatLivePressure,
  getLiveMatchStage,
  getLivePressureTone,
} from '../../utils/liveMatchPresentation.js';
import '../../styles/live-match-card.css';

const BETSLIP_URL = 'https://wlsuperbet.adsrv.eacdn.com/C.ashx?btag=a_46656b_431c_&affid=873&siteid=46656&adid=431&c=';

function splitScore(score) {
  const [homeScore = '-', awayScore = '-'] = String(score ?? '-')
    .split('-')
    .map((value) => value.trim());

  return { awayScore, homeScore };
}

function LiveMatchCard({ match }) {
  const stage = getLiveMatchStage(match.minute);
  const pressureTone = getLivePressureTone(match.pressure);
  const pressureDisplay = formatLivePressure(match.pressure);
  const { awayScore, homeScore } = splitScore(match.score);
  const analysisPath = `/jogos/${match.matchId ?? match.id}`;
  const quickStats = [
    { label: 'Finalizações', value: match.shots ?? '--' },
    { label: 'xG live', value: match.xg ?? '--' },
    { label: 'Escanteios', value: match.corners ?? '--' },
  ];

  return (
    <article className="live-match-card">
      <div className="live-match-top">
        <div>
          <span>{match.league}</span>
          <strong>{formatLiveMinute(match.minute)}</strong>
        </div>
        <span className="live-pulse">Ao vivo</span>
      </div>

      <div className="live-score">
        <div className="live-team">
          <TeamCrest size="small" teamName={match.home} />
          <span>{match.home}</span>
        </div>
        <strong>
          <span>{homeScore}</span>
          <i>:</i>
          <span>{awayScore}</span>
        </strong>
        <div className="live-team live-team-away">
          <TeamCrest size="small" teamName={match.away} />
          <span>{match.away}</span>
        </div>
      </div>

      <div className="live-context">
        <span>{stage}</span>
        <span>{pressureTone}</span>
        <span>{match.trend ?? 'Tendência ativa'}</span>
      </div>

      <div className="live-pressure">
        <div>
          <span>Pressão ofensiva</span>
          <strong>{pressureDisplay}</strong>
        </div>
        <div className="live-pressure-bar" aria-label={`Pressão ofensiva: ${pressureDisplay}`}>
          <span style={{ width: `${match.pressure ?? 0}%` }} />
        </div>
      </div>

      <div className="live-stats" aria-label="Estatísticas live resumidas">
        {quickStats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="live-alert">
        <span>{match.alert}</span>
        <strong>{match.signal}</strong>
        <small>{match.market ?? 'Mercado em monitoramento'}</small>
      </div>

      <div className="live-actions">
        <Link to={analysisPath}>Abrir análise</Link>
        <a href={BETSLIP_URL} rel="noreferrer" target="_blank">
          Bilhete pronto
        </a>
      </div>
    </article>
  );
}

export default LiveMatchCard;
