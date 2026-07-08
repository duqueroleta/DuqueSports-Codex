const ENGINE_AUDIT_LOG_VERSION = 'engine-audit-log-v1';

function createAuditEvent({ type, severity = 'info', entityId, message, metadata = {} }) {
  return {
    type,
    severity,
    entityId,
    message,
    metadata,
  };
}

function runEngineAuditLogService({ snapshot, importedSnapshotEnvelope }) {
  const events = [];

  if (snapshot) {
    events.push(createAuditEvent({
      type: 'snapshot.created',
      entityId: snapshot.snapshotId,
      message: 'Snapshot do engine criado com contrato operacional valido.',
      metadata: {
        engineVersion: snapshot.engineVersion,
        topOpportunities: snapshot.topOpportunities.length,
        topMarkets: snapshot.topMarkets.length,
      },
    }));
  }

  if (importedSnapshotEnvelope) {
    events.push(createAuditEvent({
      type: 'snapshot.json.imported',
      entityId: importedSnapshotEnvelope.snapshot.snapshotId,
      message: 'Snapshot JSON importado e validado pelo engine.',
      metadata: {
        format: importedSnapshotEnvelope.format,
        schemaVersion: importedSnapshotEnvelope.schemaValidation.schemaVersion,
        compatibilityStatus: importedSnapshotEnvelope.compatibility.status,
      },
    }));

    events.push(createAuditEvent({
      type: 'snapshot.migration.evaluated',
      severity: importedSnapshotEnvelope.migration.migrated ? 'warning' : 'info',
      entityId: importedSnapshotEnvelope.snapshot.snapshotId,
      message: importedSnapshotEnvelope.migration.migrated
        ? 'Snapshot legado migrado para a versao atual.'
        : 'Snapshot atual nao exigiu migracao.',
      metadata: {
        registryVersion: importedSnapshotEnvelope.migration.registryVersion,
        migrationApplied: importedSnapshotEnvelope.migration.migrationApplied,
        reason: importedSnapshotEnvelope.migration.reason,
      },
    }));
  }

  const warnings = events.filter((event) => event.severity === 'warning').length;
  const errors = events.filter((event) => event.severity === 'error').length;

  return {
    model: ENGINE_AUDIT_LOG_VERSION,
    generatedAt: 'mock-audit-current-state',
    totalEvents: events.length,
    warnings,
    errors,
    health: errors > 0 ? 'critical' : warnings > 0 ? 'attention' : 'healthy',
    events,
  };
}

export { ENGINE_AUDIT_LOG_VERSION, runEngineAuditLogService };
