import { isIP } from 'node:net';

const DEFAULT_SERVER_CONFIG = Object.freeze({
  host: '127.0.0.1',
  port: 8787,
  shutdownTimeoutMs: 10000,
  allowedOrigins: Object.freeze([
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ]),
});

class ServerConfigError extends Error {
  constructor(issues) {
    super(`Invalid backend configuration: ${issues.map((issue) => issue.code).join(', ')}`);
    this.name = 'ServerConfigError';
    this.issues = Object.freeze(issues.map((issue) => Object.freeze({ ...issue })));
  }
}

function parsePort(value) {
  const normalized = value === undefined ? DEFAULT_SERVER_CONFIG.port : Number(String(value).trim());

  if (!Number.isInteger(normalized) || normalized < 1 || normalized > 65535) {
    throw new ServerConfigError([{ code: 'api-port-invalid', field: 'API_PORT' }]);
  }

  return normalized;
}

function parseHost(value) {
  const normalized = value === undefined ? DEFAULT_SERVER_CONFIG.host : String(value).trim().toLowerCase();

  if (normalized !== 'localhost' && isIP(normalized) === 0) {
    throw new ServerConfigError([{ code: 'api-host-invalid', field: 'API_HOST' }]);
  }

  return normalized;
}

function parseShutdownTimeout(value) {
  const normalized = value === undefined
    ? DEFAULT_SERVER_CONFIG.shutdownTimeoutMs
    : Number(String(value).trim());

  if (!Number.isInteger(normalized) || normalized < 100 || normalized > 120000) {
    throw new ServerConfigError([{
      code: 'shutdown-timeout-invalid',
      field: 'API_SHUTDOWN_TIMEOUT_MS',
    }]);
  }

  return normalized;
}

function normalizeOrigin(value) {
  const normalized = String(value).trim();

  if (!normalized || normalized === '*') {
    throw new ServerConfigError([{ code: 'cors-origin-invalid', field: 'API_ALLOWED_ORIGINS' }]);
  }

  let url;

  try {
    url = new URL(normalized);
  } catch {
    throw new ServerConfigError([{ code: 'cors-origin-invalid', field: 'API_ALLOWED_ORIGINS' }]);
  }

  const hasUnsupportedParts = !['http:', 'https:'].includes(url.protocol)
    || Boolean(url.username || url.password || url.search || url.hash)
    || url.pathname !== '/';

  if (hasUnsupportedParts) {
    throw new ServerConfigError([{ code: 'cors-origin-invalid', field: 'API_ALLOWED_ORIGINS' }]);
  }

  return url.origin;
}

function parseAllowedOrigins(value) {
  if (value === undefined) {
    return DEFAULT_SERVER_CONFIG.allowedOrigins;
  }

  if (!String(value).trim()) {
    return Object.freeze([]);
  }

  const origins = String(value).split(',').map(normalizeOrigin);
  return Object.freeze([...new Set(origins)]);
}

function createServerConfig(environment = {}) {
  const issues = [];
  let port;
  let host;
  let allowedOrigins;
  let shutdownTimeoutMs;

  for (const [field, parser, value] of [
    ['API_PORT', parsePort, environment.API_PORT],
    ['API_HOST', parseHost, environment.API_HOST],
    ['API_ALLOWED_ORIGINS', parseAllowedOrigins, environment.API_ALLOWED_ORIGINS],
    ['API_SHUTDOWN_TIMEOUT_MS', parseShutdownTimeout, environment.API_SHUTDOWN_TIMEOUT_MS],
  ]) {
    try {
      const parsed = parser(value);

      if (field === 'API_PORT') port = parsed;
      if (field === 'API_HOST') host = parsed;
      if (field === 'API_ALLOWED_ORIGINS') allowedOrigins = parsed;
      if (field === 'API_SHUTDOWN_TIMEOUT_MS') shutdownTimeoutMs = parsed;
    } catch (error) {
      if (error instanceof ServerConfigError) {
        issues.push(...error.issues);
      } else {
        throw error;
      }
    }
  }

  if (issues.length) {
    throw new ServerConfigError(issues);
  }

  return Object.freeze({ host, port, allowedOrigins, shutdownTimeoutMs });
}

function formatServerAddress({ host, port }) {
  const displayHost = isIP(host) === 6 ? `[${host}]` : host;
  return `http://${displayHost}:${port}`;
}

export {
  DEFAULT_SERVER_CONFIG,
  ServerConfigError,
  createServerConfig,
  formatServerAddress,
  normalizeOrigin,
  parseAllowedOrigins,
  parseHost,
  parsePort,
  parseShutdownTimeout,
};
