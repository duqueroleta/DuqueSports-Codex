const snapshotStore = new Map();

function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

function saveEngineSnapshot(snapshot) {
  snapshotStore.set(snapshot.snapshotId, cloneSnapshot(snapshot));

  return getEngineSnapshotById(snapshot.snapshotId);
}

function getEngineSnapshotById(snapshotId) {
  const snapshot = snapshotStore.get(snapshotId);

  return snapshot ? cloneSnapshot(snapshot) : null;
}

function getEngineSnapshotHistory() {
  return [...snapshotStore.values()].map(cloneSnapshot);
}

function resetEngineSnapshotRepository() {
  snapshotStore.clear();
}

export {
  getEngineSnapshotById,
  getEngineSnapshotHistory,
  resetEngineSnapshotRepository,
  saveEngineSnapshot,
};
