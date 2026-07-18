import ErrorState from '../error/ErrorState.jsx';
import SkeletonGrid from '../loading/SkeletonGrid.jsx';
import MarketStrengthCard from './MarketStrengthCard.jsx';
import '../../styles/markets-grid.css';

function MarketsGrid({ error, isLoading, markets, onReset, onRetry }) {
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
          <div className="markets-empty-state">
            <span>Sem mercado compatível</span>
            <strong>Nenhum mercado encontrado</strong>
            <p>Os filtros atuais ocultaram os mercados monitorados. Volte para a seleção principal para comparar as melhores leituras.</p>
            <div className="markets-empty-tags" aria-label="Filtros que podem impactar a busca">
              <small>Busca</small>
              <small>Tipo</small>
              <small>Confiança</small>
            </div>
            <button onClick={onReset} type="button">
              Ver mercados principais
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}

export default MarketsGrid;
