import TeamCrest from '../../teams/TeamCrest.jsx';
import '../../../styles/match-teams-strip.css';

function MatchTeamsStrip({ awayTeam, homeTeam }) {
  if (!homeTeam || !awayTeam) {
    return null;
  }

  return (
    <div className="detail-teams-strip" aria-label="Times da partida">
      <span>
        <TeamCrest size="large" teamName={homeTeam} />
        <strong>{homeTeam}</strong>
      </span>
      <i aria-hidden="true">x</i>
      <span>
        <TeamCrest size="large" teamName={awayTeam} />
        <strong>{awayTeam}</strong>
      </span>
    </div>
  );
}

export default MatchTeamsStrip;
