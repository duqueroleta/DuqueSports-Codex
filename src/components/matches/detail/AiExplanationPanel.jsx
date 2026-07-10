import '../../../styles/ai-explanation-panel.css';

function AiExplanationPanel({ explanation }) {
  if (!explanation) {
    return null;
  }

  const keyDrivers = explanation.keyDrivers?.slice(0, 3) ?? [];
  const primaryRisk = explanation.riskFlags?.[0]
    ?? 'Nenhum risco estrutural relevante foi identificado.';

  return (
    <section className="ai-explanation-panel" aria-label="Explicacao da IA">
      <div className="ai-explanation-main">
        <span>Explicabilidade IA</span>
        <strong>{explanation.headline}</strong>
        <p>{explanation.verdict}</p>
      </div>

      <div className="ai-explanation-grid">
        {keyDrivers.map((driver, index) => (
          <article key={`${driver}-${index}`}>
            <span>Fator</span>
            <p>{driver}</p>
          </article>
        ))}
        <article className="ai-explanation-risk">
          <span>Risco</span>
          <p>{primaryRisk}</p>
        </article>
      </div>
    </section>
  );
}

export default AiExplanationPanel;
