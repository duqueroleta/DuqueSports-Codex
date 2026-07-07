import '../../styles/stat-card.css';

function StatCard({ stat }) {
  return (
    <article className={`stat-card stat-card-${stat.tone}`}>
      <div className="stat-card-top">
        <span>{stat.label}</span>
        <small>{stat.trend}</small>
      </div>
      <strong>{stat.value}</strong>
      <p>{stat.detail}</p>
      <div className="stat-card-progress" aria-label={`${stat.label}: ${stat.progress}%`}>
        <span style={{ width: `${stat.progress}%` }} />
      </div>
    </article>
  );
}

export default StatCard;
