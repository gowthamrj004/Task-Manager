/**
 * Base URL for API requests.
 * In dev with Vite proxy, must be "/api" (never a SPA route like "/register").
 */
export function resolveApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || '').trim();

  if (!raw) return '/api';

  const isRootApi = raw === '/api' || raw === '/api/';
  const isHttpWithApiPath =
    /^https?:\/\//i.test(raw) && /\/api\/?$/i.test(raw.replace(/\/$/, ''));

  if (isRootApi || isHttpWithApiPath) {
    return raw.replace(/\/$/, '') || '/api';
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[api] VITE_API_URL must be "/api" (Vite proxy) or "https://host…/api". Got:',
      raw,
      '→ using "/api"'
    );
    return '/api';
  }

  if (import.meta.env.PROD && !raw.includes('/api')) {
    // eslint-disable-next-line no-console
    console.warn('[api] VITE_API_URL should end with /api in production. Got:', raw);
  }

  return raw.replace(/\/$/, '') || '/api';
}
