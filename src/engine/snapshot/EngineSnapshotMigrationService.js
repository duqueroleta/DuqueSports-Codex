import { ENGINE_VERSION } from '../core/contracts.js';
import { assessEngineSnapshotCompatibility } from './EngineSnapshotSchemaService.js';

const SNAPSHOT_MIGRATION_REGISTRY_VERSION = 'snapshot-migration-registry-v1';

const SUPPORTED_LEGACY_ENGINE_PREFIX = 'duque-score-engine-v1.';

function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

function migrateEngineSnapshotToCurrentVersion(snapshot) {
  const compatibility = assessEngineSnapshotCompatibility(snapshot);

  if (!compatibility.compatible) {
    return {
      migrated: false,
      migrationApplied: null,
      reason: compatibility.status,
      snapshot: cloneSnapshot(snapshot),
      compatibility,
      registryVersion: SNAPSHOT_MIGRATION_REGISTRY_VERSION,
    };
  }

  if (!compatibility.migrationRequired) {
    return {
      migrated: false,
      migrationApplied: null,
      reason: 'already-current',
      snapshot: cloneSnapshot(snapshot),
      compatibility,
      registryVersion: SNAPSHOT_MIGRATION_REGISTRY_VERSION,
    };
  }

  const migratedSnapshot = {
    ...cloneSnapshot(snapshot),
    engineVersion: ENGINE_VERSION,
    snapshotId: String(snapshot.snapshotId).replace(snapshot.engineVersion, ENGINE_VERSION),
    migratedFromEngineVersion: snapshot.engineVersion,
    migrationRegistryVersion: SNAPSHOT_MIGRATION_REGISTRY_VERSION,
  };

  return {
    migrated: true,
    migrationApplied: 'legacy-v1-to-current',
    reason: 'legacy-compatible',
    snapshot: migratedSnapshot,
    compatibility: assessEngineSnapshotCompatibility(migratedSnapshot),
    registryVersion: SNAPSHOT_MIGRATION_REGISTRY_VERSION,
  };
}

function canAttemptSnapshotMigration(snapshot) {
  return String(snapshot?.engineVersion ?? '').startsWith(SUPPORTED_LEGACY_ENGINE_PREFIX);
}

export {
  SNAPSHOT_MIGRATION_REGISTRY_VERSION,
  canAttemptSnapshotMigration,
  migrateEngineSnapshotToCurrentVersion,
};
