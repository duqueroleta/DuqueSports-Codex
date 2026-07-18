import AuditRow from '../components/audits/AuditRow.jsx';
import AuditsHero from '../components/audits/AuditsHero.jsx';
import MarketAuditOverview from '../components/audits/MarketAuditOverview.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { markets } from '../data/markets.js';
import { runMarketAuditDashboardService } from '../engine/batch/MarketAuditDashboardService.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getAudits } from '../services/auditsService.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import { itemMatchesSearch } from '../utils/search.js';
import '../styles/page-audits.css';

const filters = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Green', value: 'Green' },
  { label: 'Red', value: 'Red' },
  { label: 'Pendente', value: 'Pendente' },
  { label: 'Alta precisão', value: 'Alta precisao' },
  { label: 'Revisar', value: 'Revisar' },
];

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

  if (filter === 'Alta precisao') {
    return getAccuracyValue(audit.accuracy) >= 85;
  }

  if (filter === 'Revisar') {
    return audit.trust === 'Revisar' || getAccuracyValue(audit.accuracy) < 70;
  }

  return true;
}

function AuditsPage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.audits', 'Todos');
  const { searchTerm, setSearchTerm } = useSearch();
  const { data: audits, error, isLoading, retry } = useAsyncData(getAudits, []);
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const marketAuditDashboard = batchAnalysis
    ? runMarketAuditDashboardService({ markets, opportunities: batchAnalysis.opportunities })
    : null;
  const filteredAudits = audits.filter(
    (audit) => filterAudits(audit, activeFilter) && itemMatchesSearch(audit, searchTerm),
  );

  function resetAuditsView() {
    setActiveFilter('Todos');
    setSearchTerm('');
  }

  return (
    <main className="audits-page">
      <AuditsHero audits={audits} />

      <section className="audits-toolbar" aria-label="Filtros de auditoria">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.value}
            className={activeFilter === filter.value ? 'audits-filter-active' : ''}
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </section>

      <div className="audits-results-heading">
        <div>
          <span>Registro auditável</span>
          <strong>Sinais recentes</strong>
        </div>
        <small>{filteredAudits.length} resultados</small>
      </div>

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
        {!isLoading && !error
          ? filteredAudits.map((audit) => <AuditRow audit={audit} key={audit.id} />)
          : null}
        {!isLoading && !error && !filteredAudits.length ? (
          <div className="audits-empty-state">
            <span>Registro filtrado</span>
            <strong>Nenhuma auditoria encontrada</strong>
            <p>Os critérios atuais ocultaram os sinais auditados. Volte para o registro completo para acompanhar greens, reds e pendências.</p>
            <div className="audits-empty-tags" aria-label="Critérios que podem impactar a busca">
              <small>Busca</small>
              <small>Resultado</small>
              <small>Precisão</small>
            </div>
            <button onClick={resetAuditsView} type="button">
              Ver registro completo
            </button>
          </div>
        ) : null}
      </section>

      <MarketAuditOverview dashboard={marketAuditDashboard} />
    </main>
  );
}

export default AuditsPage;
