import { useSyncExternalStore } from 'react';
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

function SportsDataDiagnostics() {
  const diagnostics = useSyncExternalStore(
    sportsDataSourceStore.subscribe,
    sportsDataSourceStore.getSnapshot,
  );

  if (!import.meta.env.DEV) {
    return null;
  }

  const recentOperation = Object.values(diagnostics.operations)
    .filter((operation) => operation.updatedAt)
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))[0];

  return (
    <TechnicalPanel
      ariaLabel="Diagnostico da fonte de dados esportivos"
      variant="gold"
      eyebrow="Dev diagnostics"
      title={diagnostics.apiEnabled ? 'Integracao HTTP ativada' : 'Modo mock ativado'}
      description="Origem efetiva das leituras esportivas realizadas nesta sessao local."
      asideEyebrow="Ultima fonte"
      asideTitle={SOURCE_LABELS[recentOperation?.source] ?? 'Aguardando'}
      asideDescription={recentOperation?.updatedAt ?? 'sem leitura registrada'}
      items={createDiagnosticItems(diagnostics.operations)}
    />
  );
}

export { createDiagnosticItems };
export default SportsDataDiagnostics;
