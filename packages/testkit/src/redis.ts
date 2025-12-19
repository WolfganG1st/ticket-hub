export function buildRedisUrlForWorker(baseUrl: string, workerId: number): string {
  const url = new URL(baseUrl);

  const baseDbRaw = url.pathname && url.pathname !== '/' ? url.pathname.slice(1) : '0';
  const baseDb = Number.parseInt(baseDbRaw, 10);
  const safeBaseDb = Number.isFinite(baseDb) ? baseDb : 0;

  // Redis has 16 DBs by default (0-15). Ensure we stay within range.
  const dbIndex = (safeBaseDb + workerId) % 16;
  url.pathname = `/${dbIndex}`;

  return url.toString();
}
