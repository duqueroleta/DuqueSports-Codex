import DataSourceCard from '../components/data/DataSourceCard.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { markets } from '../data/markets.js';
import { matches } from '../data/matches.js';
import { runEngineExecutionPipeline } from '../engine/pipeline/EngineExecutionPipeline.js';
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
  const engineExecution = batchAnalysis
    ? runEngineExecutionPipeline({ matches, markets, batchAnalysis })
    : null;
  const executiveDashboard = engineExecution?.executiveDashboard ?? null;
  const engineSnapshot = engineExecution?.engineSnapshot ?? null;
  const persistedSnapshot = engineExecution?.persistedSnapshot ?? null;
  const snapshotHistory = engineExecution?.snapshotHistory ?? [];
  const recoveredSnapshot = engineExecution?.recoveredSnapshot ?? null;
  const exportedSnapshotJson = engineExecution?.exportedSnapshotJson ?? '';
  const importedSnapshotEnvelope = engineExecution?.importedSnapshotEnvelope ?? null;
  const auditLog = engineExecution?.auditLog ?? null;
  const executionStatus = engineExecution?.executionStatus ?? null;
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

      {executionStatus ? (
        <section className="engine-status-panel" aria-label="Status padronizado da execucao do engine">
          <div className="engine-status-header">
            <div>
              <span>Execution Status</span>
              <strong>{executionStatus.status}</strong>
              <p>{executionStatus.model}</p>
            </div>
            <aside>
              <span>Mensagens</span>
              <strong>{executionStatus.messages.length}</strong>
              <p>{executionStatus.isTerminal ? 'execucao finalizada' : 'execucao em andamento'}</p>
            </aside>
          </div>

          <div className="engine-status-grid">
            {executionStatus.messages.map((message) => (
              <article key={message.code}>
                <span>{message.code}</span>
                <strong>{message.severity}</strong>
                <p>{message.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

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

      {persistedSnapshot ? (
        <section className="snapshot-persistence-panel" aria-label="Persistencia local de snapshots">
          <div className="snapshot-persistence-header">
            <div>
              <span>Persistencia local</span>
              <strong>{snapshotHistory.length} snapshot salvo</strong>
              <p>Historico em memoria pronto para futura troca por banco de dados.</p>
            </div>
            <aside>
              <span>Recuperacao por ID</span>
              <strong>{recoveredSnapshot ? 'Ativa' : 'Indisponivel'}</strong>
              <p>{persistedSnapshot.snapshotId}</p>
            </aside>
          </div>

          <div className="snapshot-persistence-grid">
            <article>
              <span>Ultima versao</span>
              <strong>{persistedSnapshot.engineVersion}</strong>
              <p>{persistedSnapshot.scope}</p>
            </article>
            <article>
              <span>Historico</span>
              <strong>{snapshotHistory.length}</strong>
              <p>registros em memoria</p>
            </article>
            <article>
              <span>Consulta</span>
              <strong>{recoveredSnapshot?.topOpportunities.length ?? 0}</strong>
              <p>oportunidades recuperadas</p>
            </article>
          </div>
        </section>
      ) : null}

      {importedSnapshotEnvelope ? (
        <section className="snapshot-json-panel" aria-label="Exportacao e importacao JSON de snapshots">
          <div className="snapshot-json-header">
            <div>
              <span>Snapshot JSON</span>
              <strong>Exportacao/importacao ativa</strong>
              <p>{importedSnapshotEnvelope.format}</p>
            </div>
            <aside>
              <span>Payload</span>
              <strong>{exportedSnapshotJson.length}</strong>
              <p>caracteres serializados</p>
            </aside>
          </div>

          <div className="snapshot-json-grid">
            <article>
              <span>Export ID</span>
              <strong>{importedSnapshotEnvelope.snapshot.snapshotId}</strong>
              <p>snapshot pronto para transporte</p>
            </article>
            <article>
              <span>Schema</span>
              <strong>{importedSnapshotEnvelope.schemaValidation.valid ? 'Valido' : 'Invalido'}</strong>
              <p>{importedSnapshotEnvelope.schemaValidation.schemaVersion}</p>
            </article>
            <article>
              <span>Compatibilidade</span>
              <strong>{importedSnapshotEnvelope.compatibility.status}</strong>
              <p>{importedSnapshotEnvelope.compatibility.migrationRequired ? 'migracao necessaria' : 'sem migracao'}</p>
            </article>
            <article>
              <span>Migracao</span>
              <strong>{importedSnapshotEnvelope.migration.migrated ? 'Aplicada' : 'Nao requerida'}</strong>
              <p>{importedSnapshotEnvelope.migration.registryVersion}</p>
            </article>
          </div>
        </section>
      ) : null}

      {auditLog ? (
        <section className="engine-audit-panel" aria-label="Auditoria de eventos do engine">
          <div className="engine-audit-header">
            <div>
              <span>Audit Trail</span>
              <strong>{auditLog.health}</strong>
              <p>{auditLog.model}</p>
            </div>
            <aside>
              <span>Eventos</span>
              <strong>{auditLog.totalEvents}</strong>
              <p>{auditLog.generatedAt}</p>
            </aside>
          </div>

          <div className="engine-audit-grid">
            {auditLog.events.map((event) => (
              <article key={event.type}>
                <span>{event.type}</span>
                <strong>{event.severity}</strong>
                <p>{event.message}</p>
              </article>
            ))}
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
