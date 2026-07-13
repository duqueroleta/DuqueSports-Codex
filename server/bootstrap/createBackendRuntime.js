import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createApiHandler } from '../app/createApiHandler.js';
import { createServerConfig, formatServerAddress } from '../config/createServerConfig.js';
import { InMemorySportsRepository } from '../repositories/InMemorySportsRepository.js';
import { createRequestTracker } from '../observability/createRequestTracker.js';

const SHUTDOWN_SIGNALS = Object.freeze(['SIGINT', 'SIGTERM']);

class BackendRuntimeError extends Error {
  constructor(message, { code, cause = null } = {}) {
    super(message, { cause });
    this.name = 'BackendRuntimeError';
    this.code = code;
  }
}

function getListenErrorCode(error) {
  if (error?.code === 'EADDRINUSE') return 'api-address-in-use';
  if (error?.code === 'EACCES') return 'api-address-forbidden';
  return 'api-listen-failed';
}

function createBackendRuntime({
  config,
  environment = process.env,
  logger = console,
  signalSource = process,
  now = () => new Date(),
  requestIdFactory = () => `req_${randomUUID()}`,
  repository = new InMemorySportsRepository(),
  handlerFactory = createApiHandler,
  requestTracker = createRequestTracker(),
  serverFactory = (handler) => createServer(handler),
  scheduleTimeout = globalThis.setTimeout,
  clearScheduledTimeout = globalThis.clearTimeout,
} = {}) {
  const resolvedConfig = config ?? createServerConfig(environment);
  const startedAt = now();
  const apiHandler = handlerFactory({
    repository,
    now,
    requestIdFactory,
    allowedOrigins: resolvedConfig.allowedOrigins,
    startedAt,
    getRequestMetrics: requestTracker.getSnapshot,
  });
  const handler = requestTracker.track(apiHandler);
  const server = serverFactory(handler);
  const signalHandlers = new Map();
  let state = 'idle';
  let startPromise = null;
  let shutdownPromise = null;
  let shutdownTimer = null;
  let forcedShutdown = false;
  let resolveStopped;
  const stoppedPromise = new Promise((resolve) => {
    resolveStopped = resolve;
  });

  function unregisterSignals() {
    signalHandlers.forEach((listener, signal) => signalSource.off(signal, listener));
    signalHandlers.clear();
  }

  function registerSignals() {
    SHUTDOWN_SIGNALS.forEach((signal) => {
      const listener = () => {
        logger.info?.(`DUQUE Score API received ${signal}; starting graceful shutdown.`);
        void stop(signal).catch((error) => {
          logger.error?.(`DUQUE Score API shutdown failed: ${error.code}`);
        });
      };

      signalHandlers.set(signal, listener);
      signalSource.on(signal, listener);
    });
  }

  function onRuntimeError(error) {
    logger.error?.(`DUQUE Score API runtime error: ${getListenErrorCode(error)}`);
  }

  function start() {
    if (state !== 'idle') {
      return Promise.reject(new BackendRuntimeError('Backend runtime cannot be started again.', {
        code: 'api-invalid-start-state',
      }));
    }

    state = 'starting';
    registerSignals();
    startPromise = new Promise((resolve, reject) => {
      function onStartupError(error) {
        server.off('listening', onListening);
        server.off('error', onStartupError);
        unregisterSignals();
        state = 'failed';
        resolveStopped({ reason: 'startup-failed' });
        reject(new BackendRuntimeError('Backend failed to open its HTTP address.', {
          code: getListenErrorCode(error),
          cause: error,
        }));
      }

      function onListening() {
        server.off('error', onStartupError);
        server.on('error', onRuntimeError);
        state = 'running';
        const boundAddress = server.address();
        const address = typeof boundAddress === 'object' && boundAddress
          ? formatServerAddress({ host: resolvedConfig.host, port: boundAddress.port })
          : formatServerAddress(resolvedConfig);
        resolve(Object.freeze({ address, config: resolvedConfig }));
      }

      server.once('error', onStartupError);
      server.once('listening', onListening);

      try {
        server.listen(resolvedConfig.port, resolvedConfig.host);
      } catch (error) {
        onStartupError(error);
      }
    });

    return startPromise;
  }

  function stop(reason = 'manual') {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    if (state === 'starting') {
      return startPromise.then(() => stop(reason), () => undefined);
    }

    if (state === 'idle' || state === 'failed' || state === 'stopped') {
      state = state === 'failed' ? 'failed' : 'stopped';
      unregisterSignals();
      resolveStopped({ reason });
      return Promise.resolve();
    }

    state = 'stopping';
    shutdownPromise = new Promise((resolve, reject) => {
      shutdownTimer = scheduleTimeout(() => {
        forcedShutdown = true;
        logger.warn?.('DUQUE Score API graceful shutdown deadline exceeded; closing remaining connections.');
        server.closeAllConnections?.();
      }, resolvedConfig.shutdownTimeoutMs ?? 10000);

      server.close((error) => {
        clearScheduledTimeout(shutdownTimer);
        shutdownTimer = null;
        server.off('error', onRuntimeError);
        unregisterSignals();

        if (error) {
          state = 'failed';
          resolveStopped({ forced: forcedShutdown, reason: 'shutdown-failed' });
          reject(new BackendRuntimeError('Backend failed during graceful shutdown.', {
            code: 'api-shutdown-failed',
            cause: error,
          }));
          return;
        }

        state = 'stopped';
        resolveStopped({ forced: forcedShutdown, reason });
        resolve();
      });
    });

    return shutdownPromise;
  }

  return Object.freeze({
    getRequestMetrics: requestTracker.getSnapshot,
    getState: () => state,
    start,
    stop,
    whenStopped: () => stoppedPromise,
  });
}

export {
  BackendRuntimeError,
  SHUTDOWN_SIGNALS,
  createBackendRuntime,
  getListenErrorCode,
};
