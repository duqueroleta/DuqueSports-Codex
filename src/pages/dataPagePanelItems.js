function getExecutiveReportItems(executiveReport) {
  return [
    {
      label: 'Jogos',
      value: executiveReport.summary.matches,
      description: `${executiveReport.summary.eliteOpportunities} oportunidades elite`,
    },
    {
      label: 'Top leitura',
      value: executiveReport.highlights.topOpportunity?.label ?? 'Sem destaque',
      description: `${executiveReport.highlights.topOpportunity?.opportunityScore ?? 0} score`,
    },
    {
      label: 'Recomendacao',
      value: executiveReport.highlights.topOpportunity?.market ?? 'Aguardar',
      description: executiveReport.recommendation,
    },
  ];
}

function getDataSourceItems(dataSource) {
  return [
    {
      label: 'Jogos',
      value: dataSource.totals.matches,
      description: 'partidas carregadas',
    },
    {
      label: 'Mercados',
      value: dataSource.totals.markets,
      description: 'mercados mockados',
    },
    {
      label: 'Auditorias',
      value: dataSource.totals.audits,
      description: 'leituras especializadas',
    },
    {
      label: 'Oportunidades',
      value: dataSource.totals.opportunities,
      description: 'itens analisados',
    },
    {
      label: 'Validacao',
      value: dataSource.validation.valid ? 'Valida' : 'Invalida',
      description: `${dataSource.validation.checkedItems} itens verificados`,
    },
    {
      label: 'Quarentena',
      value: dataSource.quarantine.status,
      description: `${dataSource.quarantine.rejectedItems} registros retidos`,
    },
  ];
}

function getPreflightItems(preflight) {
  return [
    {
      label: 'Continuidade',
      value: preflight.shouldContinue ? 'Liberada' : 'Bloqueada',
      description: preflight.checkedAt,
    },
    {
      label: 'Bloqueantes',
      value: preflight.severityPolicy.blockingSeverities.join(', '),
      description: 'severidades que interrompem a rodada',
    },
    {
      label: 'Mensagens',
      value: preflight.messages.length,
      description: preflight.messages[0]?.code ?? 'sem eventos',
    },
  ];
}

function getApiResponseItems(apiResponse) {
  return [
    {
      label: 'Metodo',
      value: apiResponse.method,
      description: apiResponse.generatedAt,
    },
    {
      label: 'Payload',
      value: apiResponse.data.status,
      description: `${apiResponse.data.topOpportunities.length} oportunidades no contrato`,
    },
    {
      label: 'Persistencia',
      value: apiResponse.meta.persistence,
      description: apiResponse.meta.mock ? 'mock ativo' : 'producao',
    },
  ];
}

function getExecutionStatusItems(executionStatus) {
  return executionStatus.messages.map((message) => ({
    label: message.code,
    value: message.severity,
    description: message.text,
  }));
}

function getExecutiveDashboardItems(executiveDashboard) {
  return [
    {
      label: 'Ao vivo',
      value: executiveDashboard.totals.liveMatches,
      description: 'partidas em monitoramento live',
    },
    {
      label: 'Top oportunidade',
      value: executiveDashboard.highlights.topOpportunity
        ? `${executiveDashboard.highlights.topOpportunity.home} x ${executiveDashboard.highlights.topOpportunity.away}`
        : 'Calculando',
      description: executiveDashboard.highlights.topOpportunity?.tier ?? 'Sem tier',
    },
    {
      label: 'Top mercado',
      value: executiveDashboard.highlights.topMarket?.marketName ?? 'Calculando',
      description: `${executiveDashboard.highlights.topMarket?.averageScore ?? 0} score medio`,
    },
    {
      label: 'Auditoria',
      value: `${executiveDashboard.quality.averageAuditHitRate}%`,
      description: `${executiveDashboard.quality.averageStability} estabilidade media`,
    },
  ];
}

function getEngineSnapshotItems(engineSnapshot) {
  return [
    {
      label: 'Top oportunidade',
      value: engineSnapshot.topOpportunities[0]?.label ?? 'Sem snapshot',
      description: `${engineSnapshot.topOpportunities[0]?.opportunityScore ?? 0} score`,
    },
    {
      label: 'Top mercado',
      value: engineSnapshot.topMarkets[0]?.marketName ?? 'Sem snapshot',
      description: `${engineSnapshot.topMarkets[0]?.averageScore ?? 0} score medio`,
    },
    {
      label: 'Top auditoria',
      value: engineSnapshot.auditSummary[0]?.marketName ?? 'Sem snapshot',
      description: `${engineSnapshot.auditSummary[0]?.stabilityScore ?? 0} estabilidade`,
    },
  ];
}

function getPersistedSnapshotItems(persistedSnapshot, snapshotHistory, recoveredSnapshot) {
  return [
    {
      label: 'Ultima versao',
      value: persistedSnapshot.engineVersion,
      description: persistedSnapshot.scope,
    },
    {
      label: 'Historico',
      value: snapshotHistory.length,
      description: 'registros em memoria',
    },
    {
      label: 'Consulta',
      value: recoveredSnapshot?.topOpportunities.length ?? 0,
      description: 'oportunidades recuperadas',
    },
  ];
}

function getSnapshotJsonItems(importedSnapshotEnvelope) {
  return [
    {
      label: 'Export ID',
      value: importedSnapshotEnvelope.snapshot.snapshotId,
      description: 'snapshot pronto para transporte',
    },
    {
      label: 'Schema',
      value: importedSnapshotEnvelope.schemaValidation.valid ? 'Valido' : 'Invalido',
      description: importedSnapshotEnvelope.schemaValidation.schemaVersion,
    },
    {
      label: 'Compatibilidade',
      value: importedSnapshotEnvelope.compatibility.status,
      description: importedSnapshotEnvelope.compatibility.migrationRequired ? 'migracao necessaria' : 'sem migracao',
    },
    {
      label: 'Migracao',
      value: importedSnapshotEnvelope.migration.migrated ? 'Aplicada' : 'Nao requerida',
      description: importedSnapshotEnvelope.migration.registryVersion,
    },
  ];
}

function getAuditLogItems(auditLog) {
  return auditLog.events.map((event) => ({
    label: event.type,
    value: event.severity,
    description: event.message,
  }));
}

export {
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
};
