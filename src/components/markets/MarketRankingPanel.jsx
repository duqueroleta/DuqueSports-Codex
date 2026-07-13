import '../../styles/market-ranking-panel.css';

const MAX_VISIBLE_RANKINGS = 4;

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
        <label className="market-ranking-filter">
          <span>Campeonato</span>
          <select onChange={(event) => onCompetitionChange(event.target.value)} value={activeCompetition}>
            {filterOptions.competitions.map((competition) => (
              <option key={competition}>{competition}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="market-ranking-grid">
        {rankings.slice(0, MAX_VISIBLE_RANKINGS).map((ranking, index) => (
          <article className="market-ranking-card" key={ranking.marketName}>
            <span>#{index + 1} {ranking.tier}</span>
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
