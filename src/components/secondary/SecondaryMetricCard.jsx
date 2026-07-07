import '../../styles/secondary-metric-card.css';

function SecondaryMetricCard({ metric }) {
  return (
    <article className="secondary-metric-card">
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <p>{metric.description}</p>
    </article>
  );
}

export default SecondaryMetricCard;
