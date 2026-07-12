import { Link } from 'react-router-dom';
import TeamCrest from '../teams/TeamCrest.jsx';
import { formatMatchConfidence } from '../../utils/matchConfidence.js';
import '../../styles/mobile-opportunity-bar.css';

function MobileOpportunityBar({ match }) {
  if (!match) {
    return null;
  }

  return (
    <Link className="mobile-opportunity-bar" to={`/jogos/${match.id}`}>
      <span>Melhor oportunidade</span>
      <div>
        <TeamCrest size="small" teamName={match.home} />
        <strong>
          {match.home} x {match.away}
        </strong>
        <TeamCrest size="small" teamName={match.away} />
      </div>
      <small>{formatMatchConfidence(match.confidence)} • {match.signal}</small>
    </Link>
  );
}

export default MobileOpportunityBar;
