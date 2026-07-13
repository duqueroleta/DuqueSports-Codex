import { createBackendRuntime } from './bootstrap/createBackendRuntime.js';

async function main() {
  try {
    const runtime = createBackendRuntime();
    const startup = await runtime.start();
    console.log(`DUQUE Score API listening on ${startup.address}`);
  } catch (error) {
    const code = error?.code ?? error?.issues?.map((issue) => issue.code).join(',') ?? 'api-startup-failed';
    console.error(`DUQUE Score API failed to start: ${code}`);
    process.exitCode = 1;
  }
}

void main();
