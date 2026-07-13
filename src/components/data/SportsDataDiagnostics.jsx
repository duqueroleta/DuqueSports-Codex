import { useSyncExternalStore } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getBackendHealth, healthCheckEnabled } from '../../services/sportsHealthService.js';
import { sportsDataSourceStore } from '../../services/sportsDataService.js';
import TechnicalPanel from './TechnicalPanel.jsx';

const SCOPE_LABELS = Object.freeze({
  competitions: 'Competicoes',
  matches: 'Lista de jogos',
  'match-detail': 'Detalhe do jogo',
});

const SOURCE_LABELS = Object.freeze({
  api: 'API',
  fallback: 'Fallback',
  idle: 'Aguardando',
  mock: 'Mocks',
});

function createDiagnosticItems(operations) {
  return Object.entries(operations).map(([scope, operation]) => ({
    label: SCOPE_LABELS[scope],
    value: SOURCE_LABELS[operation.source] ?? operation.source,
    description: operation.updatedAt
      ? `${operation.itemCount} item(ns) | ${operation.reason ?? 'sem falha'}`
      : 'nenhuma leitura nesta sessao',
  }));
}

function getHealthPresentation({ data, error, isLoading }) {
  if (!healthCheckEnabled) {
    return { description: 'ative a API no ambiente local', title: 'Nao habilitado' };
  }

  if (isLoading) {
    return { description: 'verificando processo local', title: 'Consultando' };
  }

  if (error || !data) {
    return { description: error?.code ?? 'sem resposta valida', title: 'Offline' };
  }

  return {
    description: `${data.service.version} | uptime ${data.time.uptimeSeconds}s`,
    title: 'Online',
  };
}

function SportsDataDiagnostics() {
  const diagnostics = useSyncExternalStore(
    sportsDataSourceStore.subscribe,
    sportsDataSourceStore.getSnapshot,
  );
  const healthState = useAsyncData(getBackendHealth, [], null);

  if (!import.meta.env.DEV) {
    return null;
  }

  const health = getHealthPresentation(healthState);

  return (
    <TechnicalPanel
      ariaLabel="Diagnostico da fonte de dados esportivos"
      variant="gold"
      eyebrow="Dev diagnostics"
      title={diagnostics.apiEnabled ? 'Integracao HTTP ativada' : 'Modo mock ativado'}
      description="Origem efetiva das leituras esportivas realizadas nesta sessao local."
      asideEyebrow="Backend local"
      asideTitle={health.title}
      asideDescription={health.description}
      items={createDiagnosticItems(diagnostics.operations)}
    />
  );
}

export { createDiagnosticItems, getHealthPresentation };
export default SportsDataDiagnostics;
