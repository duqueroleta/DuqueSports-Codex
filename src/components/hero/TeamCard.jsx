import '../../styles/hero-teams.css';

function TeamCard({ team, align }) {
  return (
    <article className={`team-card team-card-${align}`}>
      <div className="team-badge" aria-hidden="true">
        {team.badge}
      </div>
      <div className="team-content">
        <span className="team-label">{align === 'left' ? 'Mandante' : 'Visitante'}</span>
        <h2>{team.name}</h2>
        <div className="team-metrics">
          <div>
            <span>Forma</span>
            <strong>{team.form}</strong>
          </div>
          <div>
            <span>xG médio</span>
            <strong>{team.xg}</strong>
          </div>
          <div>
            <span>Pressão</span>
            <strong>{team.pressure}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}

export default TeamCard;
