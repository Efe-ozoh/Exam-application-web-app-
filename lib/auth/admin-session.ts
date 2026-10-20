import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "admin_auth";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

const SESSION_SCOPE = "admin";

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be configured for admin auth.",
    );
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/**
 * Creates a signed, expiring admin session token.
 * The previous implementation stored the literal string "true", which any
 * caller could forge with `Cookie: admin_auth=true`.
 */
export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + ADMIN_COOKIE_MAX_AGE * 1000;
  const payload = `${SESSION_SCOPE}.${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSessionToken(
  token: string | null | undefined,
): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [scope, expiresAtRaw, signature] = parts;
  if (scope !== SESSION_SCOPE) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  let expected: string;
  try {
    expected = sign(`${scope}.${expiresAtRaw}`);
  } catch {
    // Missing admin configuration should fail closed, not crash the proxy.
    return false;
  }

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

/**
 * Constant-time comparison for the admin password. Both values are hashed
 * first so the comparison always runs over equal-length buffers.
 */
export function safeCompareSecret(provided: string, expected: string): boolean {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();

  return timingSafeEqual(providedHash, expectedHash);
}
