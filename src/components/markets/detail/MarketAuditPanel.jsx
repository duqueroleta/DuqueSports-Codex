import '../../../styles/market-audit-panel.css';

function MarketAuditPanel({ audit }) {
  if (!audit) {
    return null;
  }

  return (
    <section className="market-audit-panel" aria-label="Auditoria histórica simulada">
      <div>
        <span>Auditoria histórica</span>
        <strong>{audit.auditLabel}</strong>
        <p>{audit.notes[0]}</p>
      </div>

      <div className="market-audit-grid">
        <article>
          <span>Amostra</span>
          <strong>{audit.sampleSize}</strong>
        </article>
        <article>
          <span>Volatilidade</span>
          <strong>{audit.volatility}</strong>
        </article>
        <article>
          <span>Estabilidade</span>
          <strong>{audit.stabilityScore}</strong>
        </article>
        <article>
          <span>Tier</span>
          <strong>{audit.stabilityTier}</strong>
        </article>
      </div>
    </section>
  );
}

export default MarketAuditPanel;
