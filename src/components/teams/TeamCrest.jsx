import { getTeamCrest } from '../../data/teamCrests.js';
import '../../styles/team-crest.css';

function TeamCrest({ teamName, size = 'medium' }) {
  const crest = getTeamCrest(teamName);
  const [primary, secondary, accent] = crest.colors;

  return (
    <span
      aria-label={`Escudo ${teamName}`}
      className={`team-crest team-crest-${size}`}
      style={{
        '--crest-primary': primary,
        '--crest-secondary': secondary,
        '--crest-accent': accent,
      }}
      title={teamName}
    >
      <i aria-hidden="true" />
      <strong>{crest.initials}</strong>
    </span>
  );
}

export default TeamCrest;
