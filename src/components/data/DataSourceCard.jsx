import '../../styles/data-source-card.css';

function DataSourceCard({ source }) {
  return (
    <article className="data-source-card">
      <div className="data-source-top">
        <span>Dataset</span>
        <strong>{source.status}</strong>
      </div>

      <h2>{source.name}</h2>

      <div className="data-source-metrics">
        <div>
          <span>Cobertura</span>
          <strong>{source.coverage}</strong>
        </div>
        <div>
          <span>Atualizacao</span>
          <strong>{source.freshness}</strong>
        </div>
        <div>
          <span>Qualidade</span>
          <strong>{source.quality}</strong>
        </div>
      </div>
    </article>
  );
}

export default DataSourceCard;
