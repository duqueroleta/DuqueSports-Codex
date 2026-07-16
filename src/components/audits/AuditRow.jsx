import '../../styles/audit-row.css';

function AuditRow({ audit }) {
  const resultClass = audit.result.toLowerCase();
  const accuracyValue = Number(audit.accuracy.replace('%', ''));

  return (
    <article className="audit-row">
      <div className="audit-match">
        <span className="audit-mobile-label">Partida</span>
        <strong>{audit.match}</strong>
        <small>Validador estatístico ativo</small>
      </div>
      <div>
        <span className="audit-mobile-label">Mercado</span>
        <span>{audit.market}</span>
      </div>
      <div>
        <span className="audit-mobile-label">Odd</span>
        <span>{audit.odd}</span>
      </div>
      <div>
        <span className="audit-mobile-label">Resultado</span>
        <span className={`audit-result audit-result-${resultClass}`}>{audit.result}</span>
      </div>
      <div className="audit-accuracy">
        <span className="audit-mobile-label">Precisão</span>
        <strong>{audit.accuracy}</strong>
        <div className="audit-accuracy-track" aria-label={`Precisão ${audit.accuracy}`}>
          <span style={{ width: `${accuracyValue}%` }} />
        </div>
      </div>
      <div>
        <span className="audit-mobile-label">Selo</span>
        <span className="audit-trust">{audit.trust}</span>
      </div>
    </article>
  );
}

export default AuditRow;
