import { expect, test } from "bun:test";
import { decrypt, encrypt } from "./crypto";

test("encrypt and decrypt roundtrip", async () => {
  const key = "abc123def456ghi789jkl012mno345pq";
  const text = "API_KEY=sk-secret-value-123";
  const encrypted = await encrypt(text, key);
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBe(text);
});

test("different keys produce different ciphertext", async () => {
  const text = "SECRET=value";
  const a = await encrypt(text, "key1");
  const b = await encrypt(text, "key2");
  expect(a).not.toBe(b);
});

test("wrong key fails to decrypt", async () => {
  const text = "DATA=test";
  const encrypted = await encrypt(text, "correctkey");
  await expect(decrypt(encrypted, "wrongkey")).rejects.toThrow();
});

test("handles special characters", async () => {
  const key = "testkey12345678901234567890123456";
  const text = "VAR=hello@world!#$%^&*()_+=[]{}|;':\",./<>?";
  const encrypted = await encrypt(text, key);
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBe(text);
});

test("handles unicode", async () => {
  const key = "unicodekey123456789012345678901234";
  const text = "MSG=こんにちは世界🌍";
  const encrypted = await encrypt(text, key);
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBe(text);
});

test("handles empty value", async () => {
  const key = "emptyvaluekey12345678901234567890";
  const text = "EMPTY=";
  const encrypted = await encrypt(text, key);
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBe(text);
});

test("short keys are padded", async () => {
  const key = "short";
  const text = "TEST=value";
  const encrypted = await encrypt(text, key);
  const decrypted = await decrypt(encrypted, key);
  expect(decrypted).toBe(text);
});
