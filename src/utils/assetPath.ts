/**
 * Prefixes an asset path with Vite's base URL so static files resolve
 * correctly on GitHub Pages (subdirectory) deployments.
 *
 * NOTE:
 * - `new URL(path, import.meta.env.BASE_URL)` 은 브라우저에서
 *   `BASE_URL` 이 절대 URL이 아닐 때(`'/'`, `'./'`, `'/repo/'` 등) 에러를 발생시킵니다.
 * - 그래서 단순 문자열 결합으로 안전하게 경로를 만들어 줍니다.
 */
export const assetPath = (relativePath: string) => {
  const base = import.meta.env?.BASE_URL || '/';

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const trimmed = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

  return `${normalizedBase}/${trimmed}`;
};

