import { and, eq, gt } from "drizzle-orm";
import { getDb } from "./db";
import { emailOtps, waitlistSubscribers } from "../drizzle/schema";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Generate a cryptographically random 6-digit code */
export function generateOtpCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return digits.toString();
}

/** Delete any existing OTP for this email, then insert a fresh one */
export async function upsertOtp(email: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Remove stale OTPs for this email
  await db.delete(emailOtps).where(eq(emailOtps.email, email));

  await db.insert(emailOtps).values({ email, code, expiresAt, attempts: 0 });
  return code;
}

/** Verify an OTP code. Returns 'valid' | 'expired' | 'invalid' | 'max_attempts' */
export async function verifyOtp(
  email: string,
  code: string
): Promise<"valid" | "expired" | "invalid" | "max_attempts"> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const rows = await db
    .select()
    .from(emailOtps)
    .where(eq(emailOtps.email, email))
    .limit(1);

  if (rows.length === 0) return "expired";

  const otp = rows[0];

  if (otp.expiresAt < now) {
    await db.delete(emailOtps).where(eq(emailOtps.email, email));
    return "expired";
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    return "max_attempts";
  }

  if (otp.code !== code) {
    // Increment attempt counter
    await db
      .update(emailOtps)
      .set({ attempts: otp.attempts + 1 })
      .where(eq(emailOtps.email, email));
    return "invalid";
  }

  // Code is correct — delete OTP and mark subscriber as verified
  await db.delete(emailOtps).where(eq(emailOtps.email, email));
  return "valid";
}

/** Add or update a subscriber as verified */
export async function upsertVerifiedSubscriber(
  email: string,
  ipAddress?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  await db
    .insert(waitlistSubscribers)
    .values({ email, verified: true, verifiedAt: now, ipAddress: ipAddress ?? null })
    .onDuplicateKeyUpdate({ set: { verified: true, verifiedAt: now } });
}

/** Check if an email is already a verified subscriber */
export async function isAlreadySubscribed(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const rows = await db
    .select({ id: waitlistSubscribers.id })
    .from(waitlistSubscribers)
    .where(
      and(
        eq(waitlistSubscribers.email, email),
        eq(waitlistSubscribers.verified, true)
      )
    )
    .limit(1);

  return rows.length > 0;
}

/** Get total verified subscriber count */
export async function getSubscriberCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db
    .select({ id: waitlistSubscribers.id })
    .from(waitlistSubscribers)
    .where(eq(waitlistSubscribers.verified, true));

  return rows.length;
}
