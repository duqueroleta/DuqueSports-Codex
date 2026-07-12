import TeamCrest from '../teams/TeamCrest.jsx';
import {
  formatLiveMinute,
  formatLivePressure,
  getLiveMatchStage,
  getLivePressureTone,
} from '../../utils/liveMatchPresentation.js';
import '../../styles/live-match-card.css';

function LiveMatchCard({ match }) {
  const stage = getLiveMatchStage(match.minute);
  const pressureTone = getLivePressureTone(match.pressure);
  const pressureDisplay = formatLivePressure(match.pressure);

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

      <div className="live-context">
        <span>{stage}</span>
        <span>{pressureTone}</span>
      </div>

      <div className="live-pressure">
        <div>
          <span>Pressao ofensiva</span>
          <strong>{pressureDisplay}</strong>
        </div>
        <div className="live-pressure-bar" aria-label={`Pressao ofensiva: ${pressureDisplay}`}>
          <span style={{ width: `${match.pressure ?? 0}%` }} />
        </div>
      </div>

      <div className="live-alert">
        <span>{match.alert}</span>
        <strong>{match.signal}</strong>
      </div>
    </article>
  );
}

export default LiveMatchCard;
