import { coverForJournalName } from './journalTitleCovers.js';

export { coverForJournalName };

const UA = 'SEOL-LabSite/1.0 (mailto:jb.seol@postech.ac.kr; https://smd-lab.com)';
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const IMAGE_HOSTS = [
  'ars.els-cdn.com',
  'media.springernature.com',
  'static-content.springer.com',
  'www.powdermat.org',
  'powdermat.org',
  'onlinelibrary.wiley.com',
  'journals.sagepub.com',
];

export const normalizeDoi = (doi?: string | null) =>
  (doi ?? '')
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/\/+$/, '')
    .toLowerCase();

export const isValidDoi = (doi: string) => /^10\.\d{4,9}\/\S+$/i.test(doi);

export const isPlaceholderCover = (image?: string | null) => {
  const value = image?.trim() ?? '';
  if (!value) return true;
  return /unsplash\.com|photo-1532094349884|images\/journals\/default\.(svg|jpg|png)/i.test(value);
};

export const isPaperFigureCover = (image?: string | null) =>
  /\/images\/journals\/10-|\/uploads\/covers\/10-/.test(image ?? '');

export const coverProxyPath = (doi: string) =>
  `/api/publications/cover?doi=${encodeURIComponent(normalizeDoi(doi))}`;

export const doiSlug = (doi: string) =>
  normalizeDoi(doi)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

export const publicationCoverImage = (item: { doi?: string | null; image?: string | null; journal?: string | null }) => {
  const titled = coverForJournalName(item.journal);
  if (titled) return titled;
  if (!isPlaceholderCover(item.image) && !isPaperFigureCover(item.image)) return item.image;
  return item.doi ? coverProxyPath(item.doi) : item.image;
};

const allowedImageUrl = (url: string) => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return IMAGE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
};

export const extFromContentType = (contentType: string, url: string) => {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('svg')) return '.svg';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  try {
    const fromUrl = new URL(url).pathname.toLowerCase();
    if (fromUrl.endsWith('.png')) return '.png';
    if (fromUrl.endsWith('.webp')) return '.webp';
    if (fromUrl.endsWith('.gif')) return '.gif';
    if (fromUrl.endsWith('.svg')) return '.svg';
  } catch {
    // keep jpeg default
  }
  return '.jpg';
};

export const fetchImage = async (url: string): Promise<{ buffer: Buffer; contentType: string; url: string } | null> => {
  if (!allowedImageUrl(url)) return null;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.8' },
    redirect: 'follow',
  });
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1500) return null;
  return { buffer, contentType, url: res.url };
};

const firstWorkingImage = async (urls: string[]) => {
  for (const url of urls) {
    try {
      const image = await fetchImage(url);
      if (image) return image;
    } catch {
      // try the next candidate
    }
  }
  return null;
};

const crossrefWork = async (doi: string) => {
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { message?: Record<string, unknown> };
  return body.message ?? null;
};

const issnDigits = (issn: string) => issn.replace(/-/g, '');

const elsevierJournalCovers = (issn: string) => {
  const digits = issnDigits(issn);
  return ['26', '25', '24'].flatMap((year) => [
    `https://ars.els-cdn.com/content/image/1-s2.0-S${digits}${year}X0012X-cov200h.gif`,
    `https://ars.els-cdn.com/content/image/1-s2.0-S${digits}${year}X00017-cov200h.gif`,
  ]);
};

const springerJournalCovers = (doi: string) => {
  const match = doi.match(/^10\.(1007|1186)\/s(\d+)-/i);
  if (!match) return [];
  const journalId = match[2];
  return [
    `https://media.springernature.com/w400/springer-static/cover-hires/journal/${journalId}`,
    `https://media.springernature.com/full/springer-static/cover-hires/journal/${journalId}`,
  ];
};

const absoluteUrl = (value: string, base: string) => {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
};

const imagesFromHtml = (html: string, base: string) => {
  const found = new Set<string>();
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)/gi,
    /content=["']([^"']+)["'][^>]*property=["']og:image/gi,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)/gi,
    /<img[^>]+src=["']([^"']+)["']/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const url = absoluteUrl(match[1], base);
      if (!url || !allowedImageUrl(url)) continue;
      if (/sprite|icon|logo|pixel|badge|avatar|button/i.test(url)) continue;
      found.add(url);
    }
  }
  return [...found];
};

const htmlCandidates = async (urls: string[]) => {
  const found: string[] = [];
  for (const url of urls.slice(0, 2)) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml' },
        redirect: 'follow',
      });
      if (!res.ok) continue;
      const html = await res.text();
      found.push(...imagesFromHtml(html, res.url));
    } catch {
      // ignore publisher blocks
    }
  }
  return found;
};

export const resolveCoverSource = async (doiRaw: string, journalName?: string | null) => {
  const titled = coverForJournalName(journalName);
  if (titled && !titled.endsWith('.svg')) {
    const local = titled.startsWith('http') ? await fetchImage(titled) : null;
    if (local) return local;
  }

  const doi = normalizeDoi(doiRaw);
  if (!isValidDoi(doi)) return null;

  const work = await crossrefWork(doi);
  const issns = Array.isArray(work?.ISSN) ? (work.ISSN as string[]) : [];
  const htmlLinks = Array.isArray(work?.link)
    ? (work.link as { URL?: string; 'content-type'?: string }[])
        .filter((link) => /html/i.test(link['content-type'] ?? ''))
        .map((link) => link.URL)
        .filter((url): url is string => Boolean(url))
    : [];

  const candidates = [
    ...issns.flatMap((issn) => elsevierJournalCovers(issn)),
    ...springerJournalCovers(doi),
  ];

  const direct = await firstWorkingImage(candidates);
  if (direct) return direct;

  return firstWorkingImage(await htmlCandidates(htmlLinks));
};

export const fallbackCoverSvg = (journal = 'Journal article', date = '') => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="${escapeXml(journal)}">
  <rect width="640" height="400" fill="#f6f3f4"/>
  <rect width="18" height="400" fill="#a61955"/>
  <text x="48" y="176" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#2b2b2b">${escapeXml(journal.slice(0, 48))}</text>
  <text x="48" y="216" font-family="Inter, 'Noto Sans KR', sans-serif" font-size="16" fill="#7a7772">${escapeXml(date || 'SEOL · POSTECH GIFT')}</text>
</svg>`;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
