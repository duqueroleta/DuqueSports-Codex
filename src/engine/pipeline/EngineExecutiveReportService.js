const ENGINE_EXECUTIVE_REPORT_MODEL = 'engine-executive-report-v1';

function runEngineExecutiveReportService({
  executionStatus,
  executiveDashboard,
  engineSnapshot,
  auditLog,
}) {
  const topOpportunity = engineSnapshot.topOpportunities[0] ?? null;
  const topMarket = engineSnapshot.topMarkets[0] ?? null;
  const topAudit = engineSnapshot.auditSummary[0] ?? null;

  return {
    model: ENGINE_EXECUTIVE_REPORT_MODEL,
    headline: executionStatus.status === 'completed'
      ? 'Engine operacional e pronto para leitura estatistica.'
      : 'Engine exige revisao antes de exposicao operacional.',
    status: executionStatus.status,
    health: auditLog.health,
    generatedAt: 'mock-executive-report-current-state',
    summary: {
      matches: executiveDashboard.totals.matches,
      eliteOpportunities: executiveDashboard.totals.eliteOpportunities,
      rankedMarkets: executiveDashboard.totals.rankedMarkets,
      auditedMarkets: executiveDashboard.totals.auditedMarkets,
      auditEvents: auditLog.totalEvents,
    },
    highlights: {
      topOpportunity,
      topMarket,
      topAudit,
    },
    recommendation: topOpportunity
      ? `Priorizar leitura de ${topOpportunity.label} no mercado ${topOpportunity.market}.`
      : 'Aguardar novas oportunidades antes de priorizar leitura.',
  };
}

export { ENGINE_EXECUTIVE_REPORT_MODEL, runEngineExecutiveReportService };
