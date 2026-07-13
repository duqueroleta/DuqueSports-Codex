import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { createApiHandler } from './app/createApiHandler.js';
import { InMemorySportsRepository } from './repositories/InMemorySportsRepository.js';

const port = Number(process.env.API_PORT ?? 8787);
const allowedOrigins = (process.env.API_ALLOWED_ORIGINS ?? 'http://127.0.0.1:5173,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const repository = new InMemorySportsRepository();
const startedAt = new Date();
const handler = createApiHandler({
  repository,
  now: () => new Date(),
  requestIdFactory: () => `req_${randomUUID()}`,
  allowedOrigins,
  startedAt,
});
const server = createServer(handler);

server.listen(port, '127.0.0.1', () => {
  console.log(`DUQUE Score API listening on http://127.0.0.1:${port}`);
});
