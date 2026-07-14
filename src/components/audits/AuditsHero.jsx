import '../../styles/audits-hero.css';

function AuditsHero({ audits = [] }) {
  const accuracyValues = audits.map((audit) => Number(audit.accuracy.replace('%', '')));
  const averageAccuracy = accuracyValues.length
    ? Math.round(accuracyValues.reduce((total, value) => total + value, 0) / accuracyValues.length)
    : 0;
  const resultCounts = audits.reduce((counts, audit) => ({
    ...counts,
    [audit.result]: (counts[audit.result] ?? 0) + 1,
  }), {});

  return (
    <header className="audits-page-hero" aria-labelledby="audits-page-title">
      <div>
        <span>Transparencia estatistica</span>
        <h1 id="audits-page-title">Historico de sinais</h1>
      </div>
      <div className="audits-page-summary">
        <span>Precisao media</span>
        <strong>{averageAccuracy}%</strong>
        <small>{audits.length} sinais</small>
      </div>
      <div className="audits-result-summary" aria-label="Resumo dos resultados">
        <p><strong>{resultCounts.Green ?? 0}</strong><span>Green</span></p>
        <p><strong>{resultCounts.Pendente ?? 0}</strong><span>Pendentes</span></p>
        <p><strong>{resultCounts.Red ?? 0}</strong><span>Red</span></p>
      </div>
    </header>
  );
}

export default AuditsHero;
