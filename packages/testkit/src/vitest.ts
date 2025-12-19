import process from 'node:process';

export function getVitestWorkerId(): number {
  const raw = process.env.VITEST_WORKER_ID ?? process.env.VITEST_POOL_ID ?? '0';
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function makeSchemaName(workerId: number): string {
  return `vitest_w${workerId}`;
}
