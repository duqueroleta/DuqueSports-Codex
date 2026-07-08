import DataSourceCard from '../components/data/DataSourceCard.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { markets } from '../data/markets.js';
import { matches } from '../data/matches.js';
import { runExecutiveDashboardService } from '../engine/batch/ExecutiveDashboardService.js';
import { runEngineSnapshotService } from '../engine/snapshot/EngineSnapshotService.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import '../styles/page-data.css';
import { itemMatchesSearch } from '../utils/search.js';

const sources = [
  {
    id: 1,
    name: 'Partidas e calendário',
    coverage: '128 ligas',
    freshness: '5 min',
    quality: '98%',
    status: 'Operacional',
  },
  {
    id: 2,
    name: 'Eventos ao vivo',
    coverage: '42 ligas live',
    freshness: '30 seg',
    quality: '95%',
    status: 'Monitorado',
  },
  {
    id: 3,
    name: 'Odds e mercados',
    coverage: '18 casas',
    freshness: '2 min',
    quality: '94%',
    status: 'Estável',
  },
  {
    id: 4,
    name: 'Auditoria histórica',
    coverage: '12.840 sinais',
    freshness: 'Diário',
    quality: '97%',
    status: 'Validado',
  },
];

function DataPage() {
  const { searchTerm } = useSearch();
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const executiveDashboard = batchAnalysis
    ? runExecutiveDashboardService({ matches, markets, batchAnalysis })
    : null;
  const engineSnapshot = batchAnalysis && executiveDashboard
    ? runEngineSnapshotService({ matches, markets, batchAnalysis, executiveDashboard })
    : null;
  const filteredSources = sources.filter((source) => itemMatchesSearch(source, searchTerm));

  return (
    <main className="data-page">
      <section className="data-page-hero" aria-labelledby="data-page-title">
        <div>
          <span>Camada técnica</span>
          <h1 id="data-page-title">Dados, cobertura e integridade estatística</h1>
          <p>
            Visão das bases que alimentam o Duque Score, com qualidade, atualização e
            rastreabilidade operacional.
          </p>
        </div>

        <aside className="data-page-summary">
          <span>Integridade média</span>
          <strong>96%</strong>
          <p>bases principais em estado saudável</p>
        </aside>
      </section>

      {executiveDashboard ? (
        <section className="executive-dashboard" aria-label="Painel executivo de dados globais">
          <div className="executive-dashboard-header">
            <div>
              <span>Executive Data Layer</span>
              <strong>{executiveDashboard.totals.matches} jogos no radar</strong>
              <p>
                {executiveDashboard.totals.eliteOpportunities} oportunidades elite,
                {' '}
                {executiveDashboard.totals.rankedMarkets} mercados ranqueados e
                {' '}
                {executiveDashboard.totals.auditedMarkets} auditorias consolidadas.
              </p>
            </div>
            <aside>
              <span>Engine v1 - Fase 13</span>
              <strong>{executiveDashboard.quality.averageOpportunityScore}</strong>
              <p>score medio das melhores oportunidades</p>
            </aside>
          </div>

          <div className="executive-dashboard-grid">
            <article>
              <span>Ao vivo</span>
              <strong>{executiveDashboard.totals.liveMatches}</strong>
              <p>partidas em monitoramento live</p>
            </article>
            <article>
              <span>Top oportunidade</span>
              <strong>
                {executiveDashboard.highlights.topOpportunity
                  ? `${executiveDashboard.highlights.topOpportunity.home} x ${executiveDashboard.highlights.topOpportunity.away}`
                  : 'Calculando'}
              </strong>
              <p>{executiveDashboard.highlights.topOpportunity?.tier ?? 'Sem tier'}</p>
            </article>
            <article>
              <span>Top mercado</span>
              <strong>{executiveDashboard.highlights.topMarket?.marketName ?? 'Calculando'}</strong>
              <p>{executiveDashboard.highlights.topMarket?.averageScore ?? 0} score medio</p>
            </article>
            <article>
              <span>Auditoria</span>
              <strong>{executiveDashboard.quality.averageAuditHitRate}%</strong>
              <p>{executiveDashboard.quality.averageStability} estabilidade media</p>
            </article>
          </div>
        </section>
      ) : null}

      {engineSnapshot ? (
        <section className="engine-snapshot-panel" aria-label="Snapshot do estado do engine">
          <div className="engine-snapshot-header">
            <div>
              <span>Engine Snapshot</span>
              <strong>{engineSnapshot.engineVersion}</strong>
              <p>{engineSnapshot.snapshotId}</p>
            </div>
            <aside>
              <span>Escopo</span>
              <strong>{engineSnapshot.scope}</strong>
              <p>{engineSnapshot.createdAt}</p>
            </aside>
          </div>

          <div className="engine-snapshot-grid">
            <article>
              <span>Top oportunidade</span>
              <strong>{engineSnapshot.topOpportunities[0]?.label ?? 'Sem snapshot'}</strong>
              <p>{engineSnapshot.topOpportunities[0]?.opportunityScore ?? 0} score</p>
            </article>
            <article>
              <span>Top mercado</span>
              <strong>{engineSnapshot.topMarkets[0]?.marketName ?? 'Sem snapshot'}</strong>
              <p>{engineSnapshot.topMarkets[0]?.averageScore ?? 0} score medio</p>
            </article>
            <article>
              <span>Top auditoria</span>
              <strong>{engineSnapshot.auditSummary[0]?.marketName ?? 'Sem snapshot'}</strong>
              <p>{engineSnapshot.auditSummary[0]?.stabilityScore ?? 0} estabilidade</p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="data-source-grid" aria-label="Fontes de dados">
        {filteredSources.map((source) => (
          <DataSourceCard key={source.id} source={source} />
        ))}
        {!filteredSources.length ? <p className="search-empty">Nenhum dataset encontrado.</p> : null}
      </section>
    </main>
  );
}

export default DataPage;
