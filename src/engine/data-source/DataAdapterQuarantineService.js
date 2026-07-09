const DATA_ADAPTER_QUARANTINE_MODEL = 'data-adapter-quarantine-v1';

function createQuarantineRecord({ validation, reason, index }) {
  return {
    id: `${validation.entityName}-rejected-${index + 1}`,
    entityName: validation.entityName,
    severity: 'error',
    action: 'reject-record',
    reason,
  };
}

function createEntityQuarantineSummary(validation) {
  const rejectedItems = validation.errors.length;

  return {
    entityName: validation.entityName,
    status: rejectedItems > 0 ? 'quarantined' : 'clear',
    checkedItems: validation.checkedItems,
    acceptedItems: Math.max(validation.checkedItems - rejectedItems, 0),
    rejectedItems,
  };
}

function createDataAdapterQuarantine({ source, validations }) {
  const rejectedRecords = validations.flatMap((validation) => (
    validation.errors.map((reason, index) => createQuarantineRecord({ validation, reason, index }))
  ));

  return {
    model: DATA_ADAPTER_QUARANTINE_MODEL,
    source,
    status: rejectedRecords.length > 0 ? 'quarantined' : 'clear',
    generatedAt: 'mock-quarantine-current-state',
    checkedItems: validations.reduce((total, validation) => total + validation.checkedItems, 0),
    rejectedItems: rejectedRecords.length,
    entitySummary: validations.map(createEntityQuarantineSummary),
    rejectedRecords,
  };
}

export { DATA_ADAPTER_QUARANTINE_MODEL, createDataAdapterQuarantine };
