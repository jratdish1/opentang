/**
 * Nova Reign Vault — Database Helpers
 * Handles OTP generation, verification, and subscriber management.
 * Uses crypto.randomInt for CSPRNG-safe OTP generation (Codex A+ compliant).
 */
import { randomInt } from "crypto";
import { and, eq, gt, count } from "drizzle-orm";
import { novaReignOtps, novaReignVault } from "../drizzle/schema";
import { getDb } from "./db";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_OTPS_PER_EMAIL = 3; // rate-limit: max 3 active OTPs per email

/** Generate a cryptographically secure 6-digit OTP */
export function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

/** Create a new OTP for the given email (rate-limited) */
export async function createNovaOtp(email: string): Promise<{ code: string; rateLimited: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const now = new Date();

  // Rate limit: count active (non-expired) OTPs for this email
  const activeOtps = await db
    .select({ count: count() })
    .from(novaReignOtps)
    .where(and(eq(novaReignOtps.email, email), gt(novaReignOtps.expiresAt, now)));

  if ((activeOtps[0]?.count ?? 0) >= MAX_OTPS_PER_EMAIL) {
    return { code: "", rateLimited: true };
  }

  const code = generateOtp();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(novaReignOtps).values({ email, code, expiresAt, attempts: 0 });

  return { code, rateLimited: false };
}

/** Verify an OTP code for the given email */
export async function verifyNovaOtp(
  email: string,
  code: string
): Promise<{ success: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const now = new Date();

  // Find the most recent valid OTP for this email
  const otps = await db
    .select()
    .from(novaReignOtps)
    .where(and(eq(novaReignOtps.email, email), gt(novaReignOtps.expiresAt, now)))
    .orderBy(novaReignOtps.createdAt);

  if (otps.length === 0) {
    return { success: false, reason: "expired" };
  }

  const otp = otps[otps.length - 1]; // use most recent

  if ((otp.attempts ?? 0) >= MAX_ATTEMPTS) {
    return { success: false, reason: "max_attempts" };
  }

  if (otp.code !== code) {
    // Increment attempt count
    await db
      .update(novaReignOtps)
      .set({ attempts: (otp.attempts ?? 0) + 1 })
      .where(eq(novaReignOtps.id, otp.id));
    return { success: false, reason: "invalid" };
  }

  // Valid — delete all OTPs for this email
  await db.delete(novaReignOtps).where(eq(novaReignOtps.email, email));

  return { success: true };
}

/** Add or update a verified Nova Reign vault subscriber */
export async function upsertNovaReignSubscriber(
  email: string,
  ipAddress?: string
): Promise<{ alreadySubscribed: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(novaReignVault)
    .where(and(eq(novaReignVault.email, email), eq(novaReignVault.verified, true)))
    .limit(1);

  if (existing.length > 0) {
    return { alreadySubscribed: true };
  }

  await db
    .insert(novaReignVault)
    .values({
      email,
      verified: true,
      verifiedAt: new Date(),
      ageVerified: true,
      ipAddress: ipAddress ?? null,
    })
    .onDuplicateKeyUpdate({
      set: {
        verified: true,
        verifiedAt: new Date(),
        ageVerified: true,
      },
    });

  return { alreadySubscribed: false };
}

/** Get total verified Nova Reign vault subscriber count */
export async function getNovaVaultCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ count: count() })
    .from(novaReignVault)
    .where(and(eq(novaReignVault.verified, true)));

  return rows[0]?.count ?? 0;
}
