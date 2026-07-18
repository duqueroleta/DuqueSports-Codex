import '../../../styles/ai-explanation-panel.css';

function AiExplanationPanel({ explanation }) {
  if (!explanation) {
    return null;
  }

  const keyDrivers = explanation.keyDrivers?.slice(0, 3) ?? [];
  const primaryRisk = explanation.riskFlags?.[0]
    ?? 'Nenhum risco estrutural relevante foi identificado.';

  return (
    <section className="ai-explanation-panel" aria-label="Explicação da IA">
      <div className="ai-explanation-main">
        <span>Explicabilidade IA</span>
        <strong>{explanation.headline}</strong>
        <p>{explanation.verdict}</p>
      </div>

      <div className="ai-explanation-grid">
        {keyDrivers.map((driver, index) => (
          <article key={`${driver}-${index}`}>
            <small>{String(index + 1).padStart(2, '0')}</small>
            <span>Fator decisivo</span>
            <p>{driver}</p>
          </article>
        ))}
        <article className="ai-explanation-risk">
          <small>!</small>
          <span>Risco</span>
          <p>{primaryRisk}</p>
        </article>
      </div>
    </section>
  );
}

export default AiExplanationPanel;
