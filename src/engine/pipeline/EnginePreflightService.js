const ENGINE_PREFLIGHT_MODEL = 'engine-preflight-service-v1';

function createPreflightMessage({ code, severity = 'info', text }) {
  return {
    code,
    severity,
    text,
  };
}

function runEnginePreflightService({ dataSource = null }) {
  const messages = [];
  const rejectedItems = dataSource?.quarantine?.rejectedItems ?? 0;

  if (rejectedItems > 0) {
    messages.push(createPreflightMessage({
      code: 'preflight.quarantine.blocked',
      severity: 'error',
      text: 'Preflight bloqueou a execucao antes da modelagem por registros em quarentena.',
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

  const blocked = messages.some((message) => message.severity === 'error');

  return {
    model: ENGINE_PREFLIGHT_MODEL,
    status: blocked ? 'blocked' : 'passed',
    shouldContinue: !blocked,
    checkedAt: 'mock-preflight-current-state',
    messages,
  };
}

export { ENGINE_PREFLIGHT_MODEL, runEnginePreflightService };
