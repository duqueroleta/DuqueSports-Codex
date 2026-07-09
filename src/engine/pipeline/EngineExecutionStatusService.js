const ENGINE_EXECUTION_STATUS_MODEL = 'engine-execution-status-v1';

function createExecutionMessage({ code, severity = 'info', text }) {
  return {
    code,
    severity,
    text,
  };
}

function resolveExecutionStatus({ persistedSnapshot, importedSnapshotEnvelope, auditLog, dataSource = null }) {
  const messages = [];

  if (dataSource?.validation && !dataSource.validation.valid) {
    messages.push(createExecutionMessage({
      code: 'data-source.validation.invalid',
      severity: 'error',
      text: 'Fonte de dados invalida bloqueou a execucao operacional do engine.',
    }));
  }

  if (!persistedSnapshot) {
    messages.push(createExecutionMessage({
      code: 'snapshot.persistence.missing',
      severity: 'error',
      text: 'Snapshot nao foi persistido durante a execucao.',
    }));
  }

  if (!importedSnapshotEnvelope?.schemaValidation?.valid) {
    messages.push(createExecutionMessage({
      code: 'snapshot.schema.invalid',
      severity: 'error',
      text: 'Snapshot importado nao passou pela validacao de schema.',
    }));
  }

  if (importedSnapshotEnvelope?.migration?.migrated) {
    messages.push(createExecutionMessage({
      code: 'snapshot.migration.applied',
      severity: 'warning',
      text: 'Snapshot legado foi migrado para a versao atual do engine.',
    }));
  }

  if (auditLog?.health === 'critical') {
    messages.push(createExecutionMessage({
      code: 'audit.health.critical',
      severity: 'error',
      text: 'Auditoria encontrou falha critica na execucao.',
    }));
  }

  if (!messages.length) {
    messages.push(createExecutionMessage({
      code: 'execution.completed',
      text: 'Execucao concluida com snapshot, importacao e auditoria saudaveis.',
    }));
  }

  const hasError = messages.some((message) => message.severity === 'error');
  const hasWarning = messages.some((message) => message.severity === 'warning');

  return {
    model: ENGINE_EXECUTION_STATUS_MODEL,
    status: hasError ? 'blocked' : hasWarning ? 'partial' : 'completed',
    isTerminal: true,
    messages,
  };
}

export { ENGINE_EXECUTION_STATUS_MODEL, resolveExecutionStatus };
