/**
 * Valor 1775 — Database Helpers
 * Handles OTP generation, verification, and subscriber management.
 * Uses crypto.randomInt for CSPRNG-safe OTP generation (Codex A+ compliant).
 */
import { randomInt, timingSafeEqual } from "crypto";
import { and, eq, gt, count } from "drizzle-orm";
import { valor1775Otps, valor1775Subscribers } from "../drizzle/schema";
import { getDb } from "./db";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_OTPS_PER_EMAIL = 3; // rate-limit: max 3 active OTPs per email

/** Generate a cryptographically secure 6-digit OTP */
export function generateValorOtp(): string {
  return String(randomInt(100000, 999999));
}

/** Create a new OTP for the given email (rate-limited) */
export async function createValorOtp(
  email: string
): Promise<{ code: string; rateLimited: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const now = new Date();

  // M-01: Clean expired OTPs for this email before inserting new one
  await db
    .delete(valor1775Otps)
    .where(and(eq(valor1775Otps.email, email), gt(valor1775Otps.expiresAt, now)));

  // Rate limit: count active (non-expired) OTPs for this email
  const activeOtps = await db
    .select({ count: count() })
    .from(valor1775Otps)
    .where(and(eq(valor1775Otps.email, email), gt(valor1775Otps.expiresAt, now)));

  if ((activeOtps[0]?.count ?? 0) >= MAX_OTPS_PER_EMAIL) {
    return { code: "", rateLimited: true };
  }

  const code = generateValorOtp();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(valor1775Otps).values({ email, code, expiresAt, attempts: 0 });

  return { code, rateLimited: false };
}

/** Verify an OTP code for the given email */
export async function verifyValorOtp(
  email: string,
  code: string
): Promise<{ success: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const now = new Date();

  // Find the most recent valid OTP for this email
  const otps = await db
    .select()
    .from(valor1775Otps)
    .where(and(eq(valor1775Otps.email, email), gt(valor1775Otps.expiresAt, now)))
    .orderBy(valor1775Otps.createdAt);

  if (otps.length === 0) {
    return { success: false, reason: "expired" };
  }

  const otp = otps[otps.length - 1]; // use most recent

  if ((otp.attempts ?? 0) >= MAX_ATTEMPTS) {
    return { success: false, reason: "max_attempts" };
  }

  // Constant-time comparison to prevent timing attacks (H-01)
  const storedBuf = Buffer.from(otp.code, "utf8");
  const inputBuf = Buffer.from(code.padEnd(otp.code.length, "\0"), "utf8");
  const codeMatch = storedBuf.length === inputBuf.length && timingSafeEqual(storedBuf, inputBuf);

  if (!codeMatch) {
    // Increment attempt count
    await db
      .update(valor1775Otps)
      .set({ attempts: (otp.attempts ?? 0) + 1 })
      .where(eq(valor1775Otps.id, otp.id));
    return { success: false, reason: "invalid" };
  }

  // Valid — delete all OTPs for this email
  await db.delete(valor1775Otps).where(eq(valor1775Otps.email, email));

  return { success: true };
}

/** Add or update a verified Valor 1775 subscriber */
export async function upsertValor1775Subscriber(
  email: string,
  ipAddress?: string
): Promise<{ alreadySubscribed: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(valor1775Subscribers)
    .where(
      and(
        eq(valor1775Subscribers.email, email),
        eq(valor1775Subscribers.verified, true)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { alreadySubscribed: true };
  }

  await db
    .insert(valor1775Subscribers)
    .values({
      email,
      verified: true,
      verifiedAt: new Date(),
      ipAddress: ipAddress ?? null,
    })
    .onDuplicateKeyUpdate({
      set: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

  return { alreadySubscribed: false };
}

/** Get total verified Valor 1775 subscriber count */
export async function getValor1775Count(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ count: count() })
    .from(valor1775Subscribers)
    .where(and(eq(valor1775Subscribers.verified, true)));

  return rows[0]?.count ?? 0;
}
