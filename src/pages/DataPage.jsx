import DataSourceCard from '../components/data/DataSourceCard.jsx';
import TechnicalPanel from '../components/data/TechnicalPanel.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { runEngineExecutionPipeline } from '../engine/pipeline/EngineExecutionPipeline.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getEngineDataSource } from '../services/engineDataService.js';
import '../styles/page-data.css';
import { itemMatchesSearch } from '../utils/search.js';
import {
  getApiResponseItems,
  getAuditLogItems,
  getDataSourceItems,
  getEngineSnapshotItems,
  getExecutionStatusItems,
  getExecutiveDashboardItems,
  getExecutiveReportItems,
  getPersistedSnapshotItems,
  getPreflightItems,
  getSnapshotJsonItems,
} from './dataPagePanelItems.js';

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
  const { data: engineDataSource } = useAsyncData(getEngineDataSource, [], null);
  const engineExecution = engineDataSource
    ? runEngineExecutionPipeline({
      matches: engineDataSource.matches,
      markets: engineDataSource.markets,
      batchAnalysis: engineDataSource.batchAnalysis,
      dataSource: {
        model: engineDataSource.model,
        source: engineDataSource.source,
        freshness: engineDataSource.freshness,
        provider: engineDataSource.provider,
        validation: engineDataSource.validation,
        quarantine: engineDataSource.quarantine,
        totals: engineDataSource.totals,
      },
    })
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
  const executiveReport = engineExecution?.executiveReport ?? null;
  const preflight = engineExecution?.preflight ?? null;
  const apiResponse = engineExecution?.apiResponse ?? null;
  const dataSource = engineExecution?.dataSource ?? null;
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

      {executiveReport ? (
        <TechnicalPanel
          ariaLabel="Relatorio executivo do pipeline"
          variant="gold"
          eyebrow="Executive Report"
          title={executiveReport.status}
          description={executiveReport.headline}
          asideEyebrow="Saude"
          asideTitle={executiveReport.health}
          asideDescription={executiveReport.generatedAt}
          items={getExecutiveReportItems(executiveReport)}
        />
      ) : null}

      {dataSource ? (
        <TechnicalPanel
          ariaLabel="Adapter de dados do engine"
          variant="neon"
          eyebrow="Data Adapter"
          title={dataSource.source}
          description={dataSource.model}
          asideEyebrow="Provider"
          asideTitle={dataSource.provider}
          asideDescription={dataSource.validation.valid ? 'entrada validada' : 'revisar entrada'}
          items={getDataSourceItems(dataSource)}
        />
      ) : null}

      {preflight ? (
        <TechnicalPanel
          ariaLabel="Resumo de preflight do engine"
          variant="gold"
          eyebrow="Preflight"
          title={preflight.status}
          description={preflight.model}
          asideEyebrow="Politica"
          asideTitle={preflight.severityPolicy.model}
          asideDescription={preflight.severityPolicy.toleratesWarnings ? 'avisos tolerados' : 'avisos bloqueantes'}
          items={getPreflightItems(preflight)}
        />
      ) : null}

      {apiResponse ? (
        <TechnicalPanel
          ariaLabel="Contrato mock de API do pipeline"
          variant="neon"
          eyebrow="API Contract"
          title={apiResponse.endpoint}
          description={apiResponse.model}
          asideEyebrow="Status HTTP"
          asideTitle={apiResponse.statusCode}
          asideDescription={apiResponse.meta.transport}
          items={getApiResponseItems(apiResponse)}
        />
      ) : null}

      {executionStatus ? (
        <TechnicalPanel
          ariaLabel="Status padronizado da execucao do engine"
          variant="neon"
          eyebrow="Execution Status"
          title={executionStatus.status}
          description={executionStatus.model}
          asideEyebrow="Mensagens"
          asideTitle={executionStatus.messages.length}
          asideDescription={executionStatus.isTerminal ? 'execucao finalizada' : 'execucao em andamento'}
          items={getExecutionStatusItems(executionStatus)}
        />
      ) : null}

      {executiveDashboard ? (
        <TechnicalPanel
          ariaLabel="Painel executivo de dados globais"
          variant="neon"
          eyebrow="Executive Data Layer"
          title={`${executiveDashboard.totals.matches} jogos no radar`}
          description={`${executiveDashboard.totals.eliteOpportunities} oportunidades elite, ${executiveDashboard.totals.rankedMarkets} mercados ranqueados e ${executiveDashboard.totals.auditedMarkets} auditorias consolidadas.`}
          asideEyebrow="Engine v1"
          asideTitle={executiveDashboard.quality.averageOpportunityScore}
          asideDescription="score medio das melhores oportunidades"
          items={getExecutiveDashboardItems(executiveDashboard)}
        />
      ) : null}

      {engineSnapshot ? (
        <TechnicalPanel
          ariaLabel="Snapshot do estado do engine"
          variant="gold"
          eyebrow="Engine Snapshot"
          title={engineSnapshot.engineVersion}
          description={engineSnapshot.snapshotId}
          asideEyebrow="Escopo"
          asideTitle={engineSnapshot.scope}
          asideDescription={engineSnapshot.createdAt}
          items={getEngineSnapshotItems(engineSnapshot)}
        />
      ) : null}

      {persistedSnapshot ? (
        <TechnicalPanel
          ariaLabel="Persistencia local de snapshots"
          variant="neon"
          eyebrow="Persistencia local"
          title={`${snapshotHistory.length} snapshot salvo`}
          description="Historico em memoria pronto para futura troca por banco de dados."
          asideEyebrow="Recuperacao por ID"
          asideTitle={recoveredSnapshot ? 'Ativa' : 'Indisponivel'}
          asideDescription={persistedSnapshot.snapshotId}
          items={getPersistedSnapshotItems(persistedSnapshot, snapshotHistory, recoveredSnapshot)}
        />
      ) : null}

      {importedSnapshotEnvelope ? (
        <TechnicalPanel
          ariaLabel="Exportacao e importacao JSON de snapshots"
          variant="gold"
          eyebrow="Snapshot JSON"
          title="Exportacao/importacao ativa"
          description={importedSnapshotEnvelope.format}
          asideEyebrow="Payload"
          asideTitle={exportedSnapshotJson.length}
          asideDescription="caracteres serializados"
          items={getSnapshotJsonItems(importedSnapshotEnvelope)}
        />
      ) : null}

      {auditLog ? (
        <TechnicalPanel
          ariaLabel="Auditoria de eventos do engine"
          variant="neon"
          eyebrow="Audit Trail"
          title={auditLog.health}
          description={auditLog.model}
          asideEyebrow="Eventos"
          asideTitle={auditLog.totalEvents}
          asideDescription={auditLog.generatedAt}
          items={getAuditLogItems(auditLog)}
        />
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
