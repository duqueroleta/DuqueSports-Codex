import AuditRow from '../components/audits/AuditRow.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { markets } from '../data/markets.js';
import { runMarketAuditDashboardService } from '../engine/batch/MarketAuditDashboardService.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import { getAudits } from '../services/auditsService.js';
import '../styles/page-audits.css';
import { itemMatchesSearch } from '../utils/search.js';

const filters = ['Todos', 'Green', 'Red', 'Pendente', 'Alta precisão', 'Revisar'];

function getAccuracyValue(accuracy) {
  return Number(accuracy.replace('%', ''));
}

function filterAudits(audit, filter) {
  if (filter === 'Todos') {
    return true;
  }

  if (filter === 'Green' || filter === 'Red' || filter === 'Pendente') {
    return audit.result === filter;
  }

  if (filter === 'Alta precisão') {
    return getAccuracyValue(audit.accuracy) >= 85;
  }

  if (filter === 'Revisar') {
    return audit.trust === 'Revisar' || getAccuracyValue(audit.accuracy) < 70;
  }

  return true;
}

function AuditsPage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.audits', 'Todos');
  const { searchTerm } = useSearch();
  const { data: audits, error, isLoading, retry } = useAsyncData(getAudits, []);
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const marketAuditDashboard = batchAnalysis
    ? runMarketAuditDashboardService({ markets, opportunities: batchAnalysis.opportunities })
    : null;
  const filteredAudits = audits.filter(
    (audit) => filterAudits(audit, activeFilter) && itemMatchesSearch(audit, searchTerm),
  );

  return (
    <main className="audits-page">
      <section className="audits-page-hero" aria-labelledby="audits-page-title">
        <div>
          <span>Histórico auditável</span>
          <h1 id="audits-page-title">Auditorias de sinais e performance</h1>
          <p>
            Controle de qualidade dos sinais com resultado, precisão estimada e selo de
            confiabilidade.
          </p>
        </div>

        <aside className="audits-page-summary">
          <span>Precisão média</span>
          <strong>80%</strong>
          <p>6 sinais auditados na amostra atual</p>
        </aside>
      </section>

      {marketAuditDashboard ? (
        <section className="market-audit-dashboard" aria-label="Auditorias consolidadas por mercado">
          <div className="market-audit-dashboard-header">
            <div>
              <span>Auditoria por mercado</span>
              <strong>{marketAuditDashboard.averageHitRate}% acerto simulado</strong>
              <p>
                Estabilidade media {marketAuditDashboard.averageStability} com {marketAuditDashboard.consistentMarkets} mercados consistentes.
              </p>
            </div>
            <aside>
              <span>Engine v1 - Fase 12</span>
              <strong>{marketAuditDashboard.marketAudits.length}</strong>
              <p>mercados auditados no batch atual</p>
            </aside>
          </div>

          <div className="market-audit-dashboard-grid">
            {marketAuditDashboard.marketAudits.slice(0, 4).map((audit) => (
              <article key={audit.marketId}>
                <span>{audit.priority}</span>
                <strong>{audit.marketName}</strong>
                <small>{audit.relatedGames} jogos relacionados</small>
                <div>
                  <p>
                    <b>{audit.hitRate}%</b>
                    <em>acerto</em>
                  </p>
                  <p>
                    <b>{audit.volatility}</b>
                    <em>volatilidade</em>
                  </p>
                  <p>
                    <b>{audit.stabilityScore}</b>
                    <em>estabilidade</em>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="audits-toolbar" aria-label="Filtros de auditoria">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? 'audits-filter-active' : ''}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="audits-page-panel" aria-label="Lista de auditorias">
        <div className="audits-header" aria-hidden="true">
          <span>Partida</span>
          <span>Mercado</span>
          <span>Odd</span>
          <span>Resultado</span>
          <span>Precisão</span>
          <span>Selo</span>
        </div>

        {isLoading ? <SkeletonGrid count={4} variant="table" /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading && !error ? filteredAudits.map((audit) => <AuditRow audit={audit} key={audit.id} />) : null}
        {!isLoading && !error && !filteredAudits.length ? (
          <p className="search-empty search-empty-panel">Nenhuma auditoria encontrada.</p>
        ) : null}
      </section>
    </main>
  );
}

export default AuditsPage;
