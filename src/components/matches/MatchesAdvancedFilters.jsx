function MatchesAdvancedFilters({
  activeMarket,
  activeTier,
  markets,
  onMarketChange,
  onReset,
  onTierChange,
  tiers,
}) {
  return (
    <section className="matches-advanced-filters" aria-label="Filtros do Ranking Engine">
      <label>
        <span>Tier da IA</span>
        <select onChange={(event) => onTierChange(event.target.value)} value={activeTier}>
          {tiers.map((tier) => <option key={tier}>{tier}</option>)}
        </select>
      </label>
      <label>
        <span>Mercado</span>
        <select onChange={(event) => onMarketChange(event.target.value)} value={activeMarket}>
          {markets.slice(0, 7).map((market) => <option key={market}>{market}</option>)}
        </select>
      </label>
      <button onClick={onReset} type="button">Limpar</button>
    </section>
  );
}

export default MatchesAdvancedFilters;
