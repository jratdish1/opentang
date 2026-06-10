/**
 * Valor 1775 — tRPC Router
 * Handles email capture + OTP verification for 1775valor.com waitlist.
 * Verified emails feed into the unified master email directory.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createValorOtp,
  verifyValorOtp,
  upsertValor1775Subscriber,
  getValor1775Count,
} from "../valor1775Db";
import { sendValor1775VerificationEmail } from "../valor1775Email";
import { notifyOwner } from "../_core/notification";

export const valor1775Router = router({
  /**
   * Step 1: Submit email — sends OTP verification code via Resend
   * Rate-limited: max 3 active OTPs per email
   */
  submitEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address.").max(320),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();

      const { code, rateLimited } = await createValorOtp(email);

      if (rateLimited) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many verification attempts. Please wait a few minutes before trying again.",
        });
      }

      await sendValor1775VerificationEmail(email, code);

      return { success: true, email };
    }),

  /**
   * Step 2: Verify OTP — confirms email ownership and adds to waitlist
   */
  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(320),
        code: z.string().length(6, "Verification code must be exactly 6 digits.").regex(/^\d{6}$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();
      const ip =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        ctx.req.socket?.remoteAddress ??
        "unknown";

      const result = await verifyValorOtp(email, input.code);

      if (!result.success) {
        const messages: Record<string, string> = {
          expired: "Your verification code has expired. Please request a new one.",
          max_attempts: "Too many incorrect attempts. Please request a new code.",
          invalid: "Incorrect verification code. Please try again.",
        };
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: messages[result.reason ?? "invalid"] ?? "Verification failed.",
        });
      }

      const { alreadySubscribed } = await upsertValor1775Subscriber(email, ip);

      const subscriberCount = await getValor1775Count();

      if (!alreadySubscribed) {
        await notifyOwner({
          title: "⭐ New Valor 1775 Waitlist Member",
          content: `${email} just joined the Valor 1775 waitlist.\nTotal subscribers: ${subscriberCount}\nSemper Fidelis.`,
        }).catch(() => {}); // non-blocking
      }

      return { success: true, alreadySubscribed, subscriberCount };
    }),

  /** Get current waitlist count (public) */
  getCount: publicProcedure.query(async () => {
    const count = await getValor1775Count();
    return { count };
  }),
});
