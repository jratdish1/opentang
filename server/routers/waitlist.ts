import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { sendVerificationEmail } from "../resendEmail";
import {
  getSubscriberCount,
  isAlreadySubscribed,
  upsertOtp,
  upsertVerifiedSubscriber,
  verifyOtp,
} from "../waitlistDb";
import { notifyOwner } from "../_core/notification";

export const waitlistRouter = router({
  /** Step 1: Submit email → send OTP via Resend */
  submitEmail: publicProcedure
    .input(z.object({ email: z.string().email("Please enter a valid email address") }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();

      // Check if already verified
      const alreadySubscribed = await isAlreadySubscribed(email);
      if (alreadySubscribed) {
        return { success: true, alreadySubscribed: true } as const;
      }

      // Generate and store OTP, then send via Resend
      const code = await upsertOtp(email);
      await sendVerificationEmail(email, code);

      return { success: true, alreadySubscribed: false } as const;
    }),

  /** Step 2: Verify OTP code → add to waitlist */
  verifyCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6, "Code must be 6 digits"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();
      const code = input.code.trim();

      const result = await verifyOtp(email, code);

      if (result === "expired") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your verification code has expired. Please request a new one.",
        });
      }

      if (result === "max_attempts") {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many incorrect attempts. Please request a new code.",
        });
      }

      if (result === "invalid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Incorrect code. Please check your email and try again.",
        });
      }

      // result === "valid" — save the verified subscriber
      const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        ?? ctx.req.socket?.remoteAddress
        ?? undefined;

      await upsertVerifiedSubscriber(email, ip);

      // Notify owner of new verified subscriber
      const count = await getSubscriberCount();
      await notifyOwner({
        title: "New $HERO Waitlist Subscriber",
        content: `${email} just verified and joined the $HERO NFT waitlist. Total verified subscribers: ${count}`,
      });

      return { success: true, subscriberCount: count } as const;
    }),

  /** Get total verified subscriber count (public — for social proof display) */
  getCount: publicProcedure.query(async () => {
    const count = await getSubscriberCount();
    return { count };
  }),
});
