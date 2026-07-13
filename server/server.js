import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createApiHandler } from './app/createApiHandler.js';
import { createServerConfig, formatServerAddress } from './config/createServerConfig.js';
import { InMemorySportsRepository } from './repositories/InMemorySportsRepository.js';

const config = createServerConfig(process.env);
const repository = new InMemorySportsRepository();
const startedAt = new Date();
const handler = createApiHandler({
  repository,
  now: () => new Date(),
  requestIdFactory: () => `req_${randomUUID()}`,
  allowedOrigins: config.allowedOrigins,
  startedAt,
});
const server = createServer(handler);

server.listen(config.port, config.host, () => {
  console.log(`DUQUE Score API listening on ${formatServerAddress(config)}`);
});
