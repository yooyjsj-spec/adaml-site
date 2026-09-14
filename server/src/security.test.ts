import { describe, expect, it } from 'vitest';
import { cleanHtml } from './sanitize.js';
import { consumeRecoveryCode, createRecoveryCodes, decrypt, encrypt, hashPassword, verifyPassword } from './security.js';

describe('admin security helpers', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(verifyPassword(hash, 'correct horse battery staple')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'wrong password')).resolves.toBe(false);
  });

  it('encrypts and decrypts server-side secrets', () => {
    const encrypted = encrypt('TOTPSECRET');
    expect(encrypted).not.toBe('TOTPSECRET');
    expect(decrypt(encrypted)).toBe('TOTPSECRET');
  });

  it('consumes recovery codes once', async () => {
    const { codes, hashes } = await createRecoveryCodes();
    const remaining = await consumeRecoveryCode(hashes, codes[0]);
    expect(remaining).toHaveLength(hashes.length - 1);
    await expect(consumeRecoveryCode(remaining ?? [], codes[0])).resolves.toBeNull();
  });
});

describe('content sanitization', () => {
  it('removes executable html from community content', () => {
    const result = cleanHtml('<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>');
    expect(result).toContain('<p>Hello</p>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('javascript:');
  });
});
