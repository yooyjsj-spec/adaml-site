import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from './env.js';
import {
  coverForJournalName,
  doiSlug,
  extFromContentType,
  fallbackCoverSvg,
  isPaperFigureCover,
  isPlaceholderCover,
  normalizeDoi,
  resolveCoverSource,
} from './journalCoverResolve.js';
import { prisma } from './prisma.js';

export {
  coverForJournalName,
  coverProxyPath,
  fallbackCoverSvg,
  isPaperFigureCover,
  isPlaceholderCover,
  isValidDoi,
  normalizeDoi,
  publicationCoverImage,
} from './journalCoverResolve.js';

const inflight = new Map<string, Promise<string | null>>();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const storeCoverBuffer = async (doi: string, image: { buffer: Buffer; contentType: string; url: string }) => {
  const dir = path.join(env.uploadDir, 'covers');
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${doiSlug(doi)}${extFromContentType(image.contentType, image.url)}`;
  await fs.writeFile(path.join(dir, fileName), image.buffer);
  return `${env.uploadPublicPath}/covers/${fileName}`;
};

const resolveAndStore = async (doi: string, meta?: { journal?: string | null; date?: string | null }) => {
  const catalog = coverForJournalName(meta?.journal);
  if (catalog) return catalog;
  const source = await resolveCoverSource(doi, meta?.journal);
  if (source) {
    try {
      return await storeCoverBuffer(doi, source);
    } catch {
      return source.url;
    }
  }
  if (!meta?.journal) return null;
  return storeCoverBuffer(doi, {
    buffer: Buffer.from(fallbackCoverSvg(meta.journal, meta.date ?? '')),
    contentType: 'image/svg+xml',
    url: `${env.uploadPublicPath}/covers/${doiSlug(doi)}.svg`,
  });
};

export const ensureCoverUrl = (doiRaw: string, meta?: { journal?: string | null; date?: string | null }) => {
  const doi = normalizeDoi(doiRaw);
  const existing = inflight.get(doi);
  if (existing) return existing;
  const pending = resolveAndStore(doi, meta).finally(() => inflight.delete(doi));
  inflight.set(doi, pending);
  return pending;
};

export const backfillMissingJournalCovers = async () => {
  const rows = await prisma.journalPublication.findMany({
    where: { doi: { not: null } },
    select: { id: true, doi: true, image: true, journal: true, date: true },
  });
  let updated = 0;
  for (const row of rows) {
    if (!row.doi) continue;
    const catalog = coverForJournalName(row.journal);
    if (catalog && (isPlaceholderCover(row.image) || isPaperFigureCover(row.image))) {
      await prisma.journalPublication.update({ where: { id: row.id }, data: { image: catalog } });
      updated += 1;
      continue;
    }
    if (!isPlaceholderCover(row.image) && !isPaperFigureCover(row.image)) continue;
    const stored = await ensureCoverUrl(row.doi, { journal: row.journal, date: row.date });
    if (!stored) continue;
    await prisma.journalPublication.update({ where: { id: row.id }, data: { image: stored } });
    updated += 1;
    await delay(120);
  }
  console.log(`Backfilled ${updated} journal cover(s).`);
};
