/**
 * Nova Reign Vault — tRPC Router
 * Handles age-gated email capture + OTP verification for novareign.ai vault.
 * Verified emails feed into the unified master email directory.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createNovaOtp,
  verifyNovaOtp,
  upsertNovaReignSubscriber,
  getNovaVaultCount,
} from "../novaReignDb";
import { sendNovaReignVerificationEmail } from "../novaReignEmail";
import { notifyOwner } from "../_core/notification";

export const novaReignRouter = router({
  /**
   * Step 1: Submit email — sends OTP verification code via Resend
   * Rate-limited: max 3 active OTPs per email
   */
  submitEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address.").max(320),
        ageVerified: z.boolean().refine((v) => v === true, {
          message: "Age verification is required to access the vault.",
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();
      const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        ?? ctx.req.socket?.remoteAddress
        ?? "unknown";

      const { code, rateLimited } = await createNovaOtp(email);

      if (rateLimited) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many verification attempts. Please wait a few minutes before trying again.",
        });
      }

      await sendNovaReignVerificationEmail(email, code);

      return { success: true, email };
    }),

  /**
   * Step 2: Verify OTP — confirms email ownership and adds to vault
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
      const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        ?? ctx.req.socket?.remoteAddress
        ?? "unknown";

      const result = await verifyNovaOtp(email, input.code);

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

      const { alreadySubscribed } = await upsertNovaReignSubscriber(email, ip);

      if (!alreadySubscribed) {
        const count = await getNovaVaultCount();
        await notifyOwner({
          title: "🔮 New Nova Reign Vault Member",
          content: `${email} just joined the Nova Reign Vault.\nTotal vault members: ${count}`,
        }).catch(() => {}); // non-blocking
      }

      return { success: true, alreadySubscribed };
    }),

  /** Get current vault member count (public — shown on the vault page) */
  getCount: publicProcedure.query(async () => {
    const count = await getNovaVaultCount();
    return { count };
  }),
});
