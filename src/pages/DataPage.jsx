import DataSourceCard from '../components/data/DataSourceCard.jsx';
import SportsDataDiagnostics from '../components/data/SportsDataDiagnostics.jsx';
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

const pipelineSteps = [
  {
    label: 'Entrada',
    value: 'Mocks v1',
    description: 'Partidas, mercados, live e auditorias seguem contratos internos.',
  },
  {
    label: 'Validação',
    value: 'Preflight',
    description: 'O engine bloqueia entradas críticas antes da modelagem.',
  },
  {
    label: 'Modelagem',
    value: 'Score',
    description: 'Probabilidades, oportunidades e snapshots são calculados em lote.',
  },
  {
    label: 'Entrega',
    value: 'UI/API',
    description: 'Dados são exibidos na interface e preparados para contratos HTTP.',
  },
];

function getDataHealthCards({ dataSource, executiveDashboard, executionStatus }) {
  return [
    {
      label: 'Cobertura atual',
      value: dataSource ? `${dataSource.totals.matches} jogos` : '--',
      description: dataSource ? `${dataSource.totals.markets} mercados monitorados` : 'carregando engine',
    },
    {
      label: 'Qualidade média',
      value: executiveDashboard ? `${executiveDashboard.quality.averageAuditHitRate}%` : '96%',
      description: 'hit rate médio das auditorias e leituras internas',
    },
    {
      label: 'Status do motor',
      value: executionStatus?.status ?? 'Sincronizando',
      description: executionStatus?.isTerminal ? 'execução finalizada' : 'pipeline em avaliação',
    },
    {
      label: 'Modo de dados',
      value: dataSource?.provider ?? 'Mock',
      description: 'sem API externa conectada nesta fase',
    },
  ];
}

function getDataReadinessCards({ apiResponse, dataSource, preflight }) {
  return [
    {
      label: 'Base atual',
      value: dataSource?.provider ?? 'Mock',
      description: 'Dados oficiais do projeto até a conexão com APIs externas.',
    },
    {
      label: 'Validação',
      value: preflight?.status ?? 'Em checagem',
      description: dataSource?.validation?.valid ? 'Contratos internos aprovados.' : 'Aguardando validação do engine.',
    },
    {
      label: 'Entrega API',
      value: apiResponse ? `${apiResponse.statusCode}` : '--',
      description: apiResponse ? apiResponse.endpoint : 'Contrato HTTP preparado para próxima fase.',
    },
  ];
}

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
  const healthCards = getDataHealthCards({ dataSource, executiveDashboard, executionStatus });
  const readinessCards = getDataReadinessCards({ apiResponse, dataSource, preflight });
  const filteredSources = sources.filter((source) => itemMatchesSearch(source, searchTerm));

  return (
    <main className="data-page">
      <section className="data-page-hero" aria-labelledby="data-page-title">
        <div className="data-page-hero-copy">
          <span>Data command center</span>
          <h1 id="data-page-title">Qualidade, cobertura e rastreabilidade do Duque Score</h1>
          <p>
            Uma visão executiva das bases que alimentam o motor estatístico, separando o que já
            está validado, o que é mockado e o que está pronto para evoluir para produção.
          </p>
        </div>

        <aside className="data-page-summary" aria-label="Resumo de integridade dos dados">
          <span>Integridade média</span>
          <strong>96%</strong>
          <p>bases principais em estado saudável</p>
          <small>Mocks oficiais até a integração de APIs</small>
        </aside>
      </section>

      <section className="data-health-grid" aria-label="Indicadores principais da camada de dados">
        {healthCards.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="data-readiness-panel" aria-label="Prontidão executiva da camada de dados">
        <div>
          <span>Prontidão de dados</span>
          <strong>Mock controlado, contratos ativos e engine rastreável</strong>
          <p>
            Esta camada mostra o que já pode sustentar a experiência gratuita hoje e o que será
            trocado por integrações reais nas próximas fases.
          </p>
        </div>

        <div className="data-readiness-grid">
          {readinessCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="data-pipeline" aria-label="Pipeline de processamento dos dados">
        <div className="data-pipeline-header">
          <span>Pipeline operacional</span>
          <strong>Do dado bruto ao sinal estatístico</strong>
        </div>

        <div className="data-pipeline-steps">
          {pipelineSteps.map((step, index) => (
            <article key={step.label}>
              <i>{index + 1}</i>
              <span>{step.label}</span>
              <strong>{step.value}</strong>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {import.meta.env.DEV ? <SportsDataDiagnostics /> : null}

      {executiveReport ? (
        <TechnicalPanel
          ariaLabel="Relatório executivo do pipeline"
          variant="gold"
          eyebrow="Executive Report"
          title={executiveReport.status}
          description={executiveReport.headline}
          asideEyebrow="Saúde"
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
          asideEyebrow="Política"
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
          ariaLabel="Status padronizado da execução do engine"
          variant="neon"
          eyebrow="Execution Status"
          title={executionStatus.status}
          description={executionStatus.model}
          asideEyebrow="Mensagens"
          asideTitle={executionStatus.messages.length}
          asideDescription={executionStatus.isTerminal ? 'execução finalizada' : 'execução em andamento'}
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
          asideDescription="score médio das melhores oportunidades"
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
          ariaLabel="Persistência local de snapshots"
          variant="neon"
          eyebrow="Persistência local"
          title={`${snapshotHistory.length} snapshot salvo`}
          description="Histórico em memória pronto para futura troca por banco de dados."
          asideEyebrow="Recuperação por ID"
          asideTitle={recoveredSnapshot ? 'Ativa' : 'Indisponível'}
          asideDescription={persistedSnapshot.snapshotId}
          items={getPersistedSnapshotItems(persistedSnapshot, snapshotHistory, recoveredSnapshot)}
        />
      ) : null}

      {importedSnapshotEnvelope ? (
        <TechnicalPanel
          ariaLabel="Exportação e importação JSON de snapshots"
          variant="gold"
          eyebrow="Snapshot JSON"
          title="Exportação/importação ativa"
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
