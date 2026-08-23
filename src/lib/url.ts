const PASSTHROUGH_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

export function joinBase(base: string, path: string): string {
  if (PASSTHROUGH_URL.test(path)) return path;

  const normalizedBase = `/${base}`.replace(/\/{2,}/g, '/').replace(/\/?$/, '/');
  const normalizedPath = path.replace(/^\/+/, '');

  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}

export function withBase(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
