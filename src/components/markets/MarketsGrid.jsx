import ErrorState from '../error/ErrorState.jsx';
import SkeletonGrid from '../loading/SkeletonGrid.jsx';
import MarketStrengthCard from './MarketStrengthCard.jsx';
import '../../styles/markets-grid.css';

function MarketsGrid({ error, isLoading, markets, onRetry }) {
  return (
    <>
      <div className="markets-results-heading">
        <div>
          <span>Comparador</span>
          <strong>Mercados monitorados</strong>
        </div>
        <small>{markets.length} exibidos</small>
      </div>
      <section className="markets-page-grid" aria-label="Lista de mercados">
        {isLoading ? <SkeletonGrid count={8} /> : null}
        {error ? <ErrorState onRetry={onRetry} /> : null}
        {!isLoading && !error
          ? markets.map((market, index) => (
            <MarketStrengthCard key={market.id} market={market} rank={index + 1} />
          ))
          : null}
        {!isLoading && !error && !markets.length ? (
          <p className="search-empty">Nenhum mercado encontrado.</p>
        ) : null}
      </section>
    </>
  );
}

export default MarketsGrid;
