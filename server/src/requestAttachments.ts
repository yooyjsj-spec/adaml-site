import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyRequest } from 'fastify';
import { env } from './env.js';
import { randomToken } from './security.js';

export const MAX_REQUEST_ATTACHMENT_BYTES = 1024 * 1024 * 1024;
export const MAX_REQUEST_ATTACHMENT_FILES = 10;
export const OVER_LIMIT_MESSAGE = '첨부 용량은 1GB까지입니다.';

export type RequestFileAttachment = {
  kind: 'file';
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type RequestLinkAttachment = {
  kind: 'link';
  url: string;
};

export type RequestAttachment = RequestFileAttachment | RequestLinkAttachment;

type StagedFile = RequestFileAttachment & { tmpPath: string };

const httpError = (statusCode: number, message: string) => Object.assign(new Error(message), { statusCode });

export const requestFilePath = (requestId: string, fileName: string) =>
  path.join(env.uploadDir, 'requests', requestId, fileName);

export const parseAttachments = (value: unknown): RequestAttachment[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is RequestAttachment => {
    if (!item || typeof item !== 'object') return false;
    if (item.kind === 'link' && typeof item.url === 'string') return true;
    return (
      item.kind === 'file' &&
      typeof item.originalName === 'string' &&
      typeof item.fileName === 'string' &&
      typeof item.mimeType === 'string' &&
      typeof item.size === 'number'
    );
  });
};

const safeOriginalName = (name: string) => path.basename(name).replace(/[\u0000-\u001f]/g, '').slice(0, 200) || 'attachment';

const persistAcrossDevices = async (from: string, to: string) => {
  try {
    await fs.promises.rename(from, to);
  } catch {
    await fs.promises.copyFile(from, to);
    await fs.promises.unlink(from);
  }
};

export const stageMultipartFiles = async (request: FastifyRequest) => {
  const fields: Record<string, string> = {};
  const files: StagedFile[] = [];
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'smd-req-'));

  try {
    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname !== 'files') {
          part.file.resume();
          continue;
        }
        if (files.length >= MAX_REQUEST_ATTACHMENT_FILES) {
          part.file.resume();
          throw httpError(400, `첨부 파일은 최대 ${MAX_REQUEST_ATTACHMENT_FILES}개까지입니다.`);
        }
        const ext = path.extname(part.filename).slice(0, 16);
        const fileName = `${randomToken(12)}${ext}`;
        const tmpPath = path.join(tmpDir, fileName);
        await pipeline(part.file, fs.createWriteStream(tmpPath));
        if (part.file.truncated) {
          throw httpError(413, OVER_LIMIT_MESSAGE);
        }
        const size = (await fs.promises.stat(tmpPath)).size;
        if (size > MAX_REQUEST_ATTACHMENT_BYTES) {
          throw httpError(413, OVER_LIMIT_MESSAGE);
        }
        files.push({
          kind: 'file',
          originalName: safeOriginalName(part.filename),
          fileName,
          mimeType: part.mimetype || 'application/octet-stream',
          size,
          tmpPath,
        });
      } else {
        fields[part.fieldname] = String(part.value ?? '');
      }
    }

    const total = files.reduce((sum, file) => sum + file.size, 0);
    if (total > MAX_REQUEST_ATTACHMENT_BYTES) {
      throw httpError(413, OVER_LIMIT_MESSAGE);
    }

    return { fields, files, tmpDir };
  } catch (error) {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
    throw error;
  }
};

export const saveStagedRequestFiles = async (requestId: string, files: StagedFile[]) => {
  if (files.length === 0) return;
  const destDir = path.join(env.uploadDir, 'requests', requestId);
  await fs.promises.mkdir(destDir, { recursive: true });
  for (const file of files) {
    await persistAcrossDevices(file.tmpPath, path.join(destDir, file.fileName));
  }
};

export const cleanupStagedFiles = async (tmpDir?: string) => {
  if (!tmpDir) return;
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
};

export const isSafeStoredFileName = (fileName: string) =>
  Boolean(fileName) && !fileName.includes('..') && !fileName.includes('/') && !fileName.includes('\\');
