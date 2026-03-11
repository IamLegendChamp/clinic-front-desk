/**
 * API base URL is set by the host before loading shared (e.g. in main.tsx):
 * (globalThis as any).__CLINIC_API_BASE_URL__ = import.meta.env.VITE_API_URL;
 */
export function getApiBaseURL(): string {
  const g = globalThis as { __CLINIC_API_BASE_URL__?: string };
  return g.__CLINIC_API_BASE_URL__ ?? '';
}

export function setApiBaseURL(url: string): void {
  (globalThis as unknown as { __CLINIC_API_BASE_URL__: string }).__CLINIC_API_BASE_URL__ = url;
}
