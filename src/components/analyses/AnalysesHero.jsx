import '../../styles/analyses-hero.css';

function AnalysesHero({ analysis }) {
  const opportunities = analysis?.opportunities ?? [];
  const eliteCount = opportunities.filter((item) => item.tier === 'Elite').length;
  const highConfidenceCount = opportunities.filter((item) => item.confidence >= 85).length;

  return (
    <header className="analyses-page-hero" aria-labelledby="analyses-page-title">
      <div>
        <span>Biblioteca da IA</span>
        <h1 id="analyses-page-title">Análises prontas para decidir</h1>
      </div>
      <div className="analyses-page-summary">
        <span>Score médio top 5</span>
        <strong>{analysis?.averageOpportunityScore ?? '--'}</strong>
        <small>{analysis?.analyzedMatches ?? 0} jogos</small>
      </div>
      <div className="analyses-quick-metrics">
        <p><strong>{eliteCount}</strong><span>Elite</span></p>
        <p><strong>{highConfidenceCount}</strong><span>Alta confiança</span></p>
      </div>
    </header>
  );
}

export default AnalysesHero;
