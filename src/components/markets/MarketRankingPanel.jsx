function MarketRankingPanel({
  activeCompetition,
  filterOptions,
  rankings,
  onCompetitionChange,
}) {
  return (
    <section className="market-ranking-panel" aria-label="Ranking por mercado da IA">
      <div className="market-ranking-header">
        <div>
          <span>Batch Ranking</span>
          <strong>Mercados por oportunidade real</strong>
          <p>Leitura agregada dos jogos analisados pelo DUQUE Score Engine.</p>
        </div>
        <div className="market-ranking-filters" aria-label="Filtro por campeonato">
          {filterOptions.competitions.map((competition) => (
            <button
              aria-pressed={activeCompetition === competition}
              className={activeCompetition === competition ? 'markets-filter-active' : ''}
              key={competition}
              onClick={() => onCompetitionChange(competition)}
              type="button"
            >
              {competition}
            </button>
          ))}
        </div>
      </div>

      <div className="market-ranking-grid">
        {rankings.slice(0, 4).map((ranking) => (
          <article className="market-ranking-card" key={ranking.marketName}>
            <span>{ranking.tier}</span>
            <strong>{ranking.marketName}</strong>
            <small>
              Top jogo: {ranking.topOpportunity.home} x {ranking.topOpportunity.away}
            </small>
            <div>
              <p>
                <b>{ranking.averageScore}</b>
                <em>score medio</em>
              </p>
              <p>
                <b>{ranking.averageProbability}%</b>
                <em>probabilidade</em>
              </p>
              <p>
                <b>{ranking.opportunitiesCount}</b>
                <em>jogos</em>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MarketRankingPanel;
