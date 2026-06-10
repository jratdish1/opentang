import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { waitlistSubscribers } from "../../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

/** Admin-only guard — only the owner (admin role) can access these procedures */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /** Get all verified waitlist subscribers with pagination */
  getSubscribers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(200).default(50),
        verifiedOnly: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const offset = (input.page - 1) * input.pageSize;

      const rows = await db
        .select()
        .from(waitlistSubscribers)
        .where(input.verifiedOnly ? eq(waitlistSubscribers.verified, true) : undefined)
        .orderBy(desc(waitlistSubscribers.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const totalRows = await db
        .select({ count: count() })
        .from(waitlistSubscribers)
        .where(input.verifiedOnly ? eq(waitlistSubscribers.verified, true) : undefined);

      const total = totalRows[0]?.count ?? 0;

      return {
        subscribers: rows,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  /** Export all verified subscribers as CSV data */
  exportCsv: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const rows = await db
      .select()
      .from(waitlistSubscribers)
      .where(eq(waitlistSubscribers.verified, true))
      .orderBy(desc(waitlistSubscribers.verifiedAt));

    const header = "id,email,verified,verifiedAt,ipAddress,createdAt";
    const lines = rows.map((r) =>
      [
        r.id,
        `"${r.email}"`,
        r.verified ? "true" : "false",
        r.verifiedAt ? r.verifiedAt.toISOString() : "",
        r.ipAddress ? `"${r.ipAddress}"` : "",
        r.createdAt.toISOString(),
      ].join(",")
    );

    return { csv: [header, ...lines].join("\n"), count: rows.length };
  }),

  /** Delete a subscriber by ID (admin only) */
  deleteSubscriber: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await db.delete(waitlistSubscribers).where(eq(waitlistSubscribers.id, input.id));
      return { success: true };
    }),

  /** Get dashboard stats */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const totalVerified = await db
      .select({ count: count() })
      .from(waitlistSubscribers)
      .where(eq(waitlistSubscribers.verified, true));

    const totalAll = await db
      .select({ count: count() })
      .from(waitlistSubscribers);

    // Last 7 days signups
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await db
      .select()
      .from(waitlistSubscribers)
      .where(eq(waitlistSubscribers.verified, true))
      .orderBy(desc(waitlistSubscribers.verifiedAt))
      .limit(5);

    return {
      totalVerified: totalVerified[0]?.count ?? 0,
      totalAll: totalAll[0]?.count ?? 0,
      recentSubscribers: recent,
    };
  }),
});
