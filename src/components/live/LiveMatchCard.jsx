import '../../styles/live-match-card.css';

function LiveMatchCard({ match }) {
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
        <span>{match.home}</span>
        <strong>{match.score}</strong>
        <span>{match.away}</span>
      </div>

      <div className="live-pressure">
        <div>
          <span>Pressão ofensiva</span>
          <strong>{match.pressure}%</strong>
        </div>
        <div className="live-pressure-bar" aria-label={`Pressão ofensiva ${match.pressure}%`}>
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
