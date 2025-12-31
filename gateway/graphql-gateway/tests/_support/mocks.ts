import { vi } from 'vitest';

export const getFetchCall = (urlPart: string) => {
  const call = vi.mocked(global.fetch).mock.calls.find((c) => c[0].toString().includes(urlPart));
  if (!call) {
    throw new Error(`No fetch call found for URL containing: ${urlPart}`);
  }
  return call;
};
