import crypto from 'node:crypto';
import argon2 from 'argon2';
import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { env } from './env.js';
import { LAB_NAME } from './lab.js';

export const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');

export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

export const encrypt = (plainText: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', env.adminCryptoKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
};

export const decrypt = (payload: string) => {
  const [ivRaw, tagRaw, encryptedRaw] = payload.split('.');
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error('Invalid encrypted payload');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    env.adminCryptoKey,
    Buffer.from(ivRaw, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
};

export const createTotpSecret = (username: string) => {
  const secret = generateSecret();
  const otpauth = generateURI({ issuer: LAB_NAME, label: username, secret });
  return { secret, otpauth };
};

export const totpQrDataUrl = (otpauth: string) => QRCode.toDataURL(otpauth);

export const verifyTotp = (token: string, encryptedSecret: string) =>
  verifySync({ token, secret: decrypt(encryptedSecret) }).valid;

export const createRecoveryCodes = async () => {
  const codes = Array.from({ length: 10 }, () => randomToken(8).slice(0, 10).toUpperCase());
  const hashes = await Promise.all(codes.map((code) => hashPassword(code)));
  return { codes, hashes };
};

export const consumeRecoveryCode = async (hashes: string[], code: string) => {
  for (let i = 0; i < hashes.length; i += 1) {
    if (await argon2.verify(hashes[i], code)) {
      return hashes.filter((_, index) => index !== i);
    }
  }
  return null;
};
