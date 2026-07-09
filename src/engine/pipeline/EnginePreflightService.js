const ENGINE_PREFLIGHT_MODEL = 'engine-preflight-service-v1';
const ENGINE_PREFLIGHT_SEVERITY_POLICY_MODEL = 'engine-preflight-severity-policy-v1';

function createPreflightSeverityPolicy() {
  return {
    model: ENGINE_PREFLIGHT_SEVERITY_POLICY_MODEL,
    blockingSeverities: ['error'],
    warningSeverities: ['warning'],
    toleratesWarnings: true,
  };
}

function createPreflightMessage({ code, severity = 'info', text }) {
  return {
    code,
    severity,
    text,
  };
}

function runEnginePreflightService({ dataSource = null }) {
  const messages = [];
  const severityPolicy = createPreflightSeverityPolicy();
  const rejectedRecords = dataSource?.quarantine?.rejectedRecords ?? [];
  const hasBlockingQuarantine = rejectedRecords.some((record) => (
    severityPolicy.blockingSeverities.includes(record.severity)
  ));
  const hasWarningQuarantine = rejectedRecords.some((record) => (
    severityPolicy.warningSeverities.includes(record.severity)
  ));

  if (hasBlockingQuarantine) {
    messages.push(createPreflightMessage({
      code: 'preflight.quarantine.blocked',
      severity: 'error',
      text: 'Preflight bloqueou a execucao antes da modelagem por registros em quarentena.',
    }));
  }

  if (!hasBlockingQuarantine && hasWarningQuarantine) {
    messages.push(createPreflightMessage({
      code: 'preflight.quarantine.warning',
      severity: 'warning',
      text: 'Preflight encontrou registros em observacao, mas liberou a modelagem.',
    }));
  }

  if (dataSource?.validation && !dataSource.validation.valid) {
    messages.push(createPreflightMessage({
      code: 'preflight.validation.blocked',
      severity: 'error',
      text: 'Preflight bloqueou a execucao antes da modelagem por entrada invalida.',
    }));
  }

  if (!messages.length) {
    messages.push(createPreflightMessage({
      code: 'preflight.passed',
      text: 'Preflight aprovado para processamento estatistico.',
    }));
  }

  const blocked = messages.some((message) => severityPolicy.blockingSeverities.includes(message.severity));
  const hasWarning = messages.some((message) => severityPolicy.warningSeverities.includes(message.severity));

  return {
    model: ENGINE_PREFLIGHT_MODEL,
    status: blocked ? 'blocked' : hasWarning ? 'warning' : 'passed',
    shouldContinue: !blocked,
    severityPolicy,
    checkedAt: 'mock-preflight-current-state',
    messages,
  };
}

export {
  ENGINE_PREFLIGHT_MODEL,
  ENGINE_PREFLIGHT_SEVERITY_POLICY_MODEL,
  createPreflightSeverityPolicy,
  runEnginePreflightService,
};
