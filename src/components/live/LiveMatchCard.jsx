import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/live-match-card.css';

function getMatchStage(minute) {
  if (minute >= 75) {
    return 'Reta final';
  }

  if (minute >= 46) {
    return 'Segundo tempo';
  }

  return 'Primeiro tempo';
}

function LiveMatchCard({ match }) {
  const stage = getMatchStage(match.minute);
  const pressureTone = match.pressure >= 80 ? 'Zona quente' : 'Monitorar';

  return (
    <article className="live-match-card">
      <div className="live-match-top">
        <div>
          <span>{match.league}</span>
          <strong>{match.minute}'</strong>
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
          <strong>{match.pressure}%</strong>
        </div>
        <div className="live-pressure-bar" aria-label={`Pressao ofensiva ${match.pressure}%`}>
          <span style={{ width: `${match.pressure}%` }} />
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
