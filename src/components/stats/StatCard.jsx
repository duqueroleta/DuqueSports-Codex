import '../../styles/stat-card.css';

function StatCard({ stat }) {
  return (
    <article className={`stat-card stat-card-${stat.tone}`}>
      <span>{stat.label}</span>
      <strong>{stat.value}</strong>
      <p>{stat.detail}</p>
    </article>
  );
}

export default StatCard;
