import '../../styles/market-audit-overview.css';

function MarketAuditOverview({ dashboard }) {
  if (!dashboard) {
    return null;
  }

  return (
    <section className="market-audit-dashboard" aria-label="Auditorias consolidadas por mercado">
      <header className="market-audit-dashboard-header">
        <div>
          <span>Auditoria por mercado</span>
          <strong>{dashboard.averageHitRate}% acerto simulado</strong>
        </div>
        <div>
          <p><b>{dashboard.averageStability}</b><small>Estabilidade</small></p>
          <p><b>{dashboard.consistentMarkets}</b><small>Consistentes</small></p>
          <p><b>{dashboard.marketAudits.length}</b><small>Auditados</small></p>
        </div>
      </header>

      <div className="market-audit-dashboard-grid">
        {dashboard.marketAudits.slice(0, 4).map((audit) => (
          <article key={audit.marketId}>
            <span>{audit.priority}</span>
            <strong>{audit.marketName}</strong>
            <small>{audit.relatedGames} jogos relacionados</small>
            <div>
              <p><b>{audit.hitRate}%</b><em>Acerto</em></p>
              <p><b>{audit.volatility}</b><em>Volatilidade</em></p>
              <p><b>{audit.stabilityScore}</b><em>Estabilidade</em></p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MarketAuditOverview;
