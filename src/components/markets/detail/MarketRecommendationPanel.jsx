import '../../../styles/market-recommendation-panel.css';

function getRecommendationItems(market) {
  return [
    {
      description: 'Referência de preço para avaliar valor antes da entrada.',
      isHighlight: true,
      label: 'Odd média',
      value: market.averageOdd,
    },
    {
      description: 'Classificação operacional de exposição e variância esperada.',
      label: 'Risco',
      value: market.risk,
    },
    {
      description: 'Selo baseado em consistência histórica e estabilidade do sinal.',
      label: 'Auditoria',
      value: market.audit,
    },
    {
      description: 'Movimento recente do mercado dentro do radar Duque Score.',
      label: 'Tendência',
      value: market.trend,
    },
  ];
}

function MarketRecommendationPanel({ market }) {
  const items = getRecommendationItems(market);

  return (
    <section
      className="detail-grid market-recommendation-panel"
      aria-label="Análise do mercado"
    >
      {items.map((item) => (
        <article
          className={`detail-card ${item.isHighlight ? 'detail-card-highlight' : ''}`}
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </section>
  );
}

export default MarketRecommendationPanel;
