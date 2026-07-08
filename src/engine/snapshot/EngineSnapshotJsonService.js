const SNAPSHOT_JSON_FORMAT = 'duque-engine-snapshot-json-v1';

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertSnapshotContract(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('Snapshot JSON invalido: snapshot ausente.');
  }

  if (!snapshot.snapshotId || !snapshot.engineVersion) {
    throw new Error('Snapshot JSON invalido: identificadores obrigatorios ausentes.');
  }

  if (snapshot.model !== 'engine-snapshot-service-v1') {
    throw new Error('Snapshot JSON invalido: modelo de snapshot nao reconhecido.');
  }
}

function exportEngineSnapshotToJson(snapshot) {
  assertSnapshotContract(snapshot);

  return JSON.stringify(
    {
      format: SNAPSHOT_JSON_FORMAT,
      exportedAt: 'mock-export-current-state',
      snapshot: cloneJson(snapshot),
    },
    null,
    2,
  );
}

function importEngineSnapshotFromJson(jsonPayload) {
  let envelope;

  try {
    envelope = JSON.parse(jsonPayload);
  } catch {
    throw new Error('Snapshot JSON invalido: payload nao pode ser interpretado.');
  }

  if (!envelope || typeof envelope !== 'object') {
    throw new Error('Snapshot JSON invalido: envelope ausente.');
  }

  if (envelope.format !== SNAPSHOT_JSON_FORMAT) {
    throw new Error('Snapshot JSON invalido: formato nao suportado.');
  }

  assertSnapshotContract(envelope.snapshot);

  return {
    format: envelope.format,
    exportedAt: envelope.exportedAt,
    snapshot: cloneJson(envelope.snapshot),
  };
}

export {
  SNAPSHOT_JSON_FORMAT,
  exportEngineSnapshotToJson,
  importEngineSnapshotFromJson,
};
