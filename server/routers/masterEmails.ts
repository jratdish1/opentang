/**
 * Master Email Directory Router
 * Aggregates verified emails from all sites into one secured admin view.
 * Currently sources: hero-nft-showcase waitlist
 * Future: novareign.ai, herobase.io, vetsincrypto.com, regenvalor.com
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { waitlistSubscribers } from "../../drizzle/schema";
import { eq, desc, count, like, or } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  }
  return next({ ctx });
});

export const masterEmailsRouter = router({
  /**
   * Get all verified emails across all sites (currently hero-nft-showcase)
   * Returns unified list tagged by source site
   */
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(500).default(100),
        search: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const offset = (input.page - 1) * input.pageSize;

      // Build where clause
      let whereClause = eq(waitlistSubscribers.verified, true) as any;
      if (input.search) {
        whereClause = or(
          like(waitlistSubscribers.email, `%${input.search}%`),
          eq(waitlistSubscribers.verified, true)
        );
      }

      const rows = await db
        .select()
        .from(waitlistSubscribers)
        .where(eq(waitlistSubscribers.verified, true))
        .orderBy(desc(waitlistSubscribers.verifiedAt))
        .limit(input.pageSize)
        .offset(offset);

      const totalRows = await db
        .select({ count: count() })
        .from(waitlistSubscribers)
        .where(eq(waitlistSubscribers.verified, true));

      const total = totalRows[0]?.count ?? 0;

      // Tag each row with source site
      const tagged = rows.map((r) => ({
        ...r,
        source: "hero-nft-showcase",
        siteLabel: "$HERO NFT Waitlist",
        siteUrl: "https://nft.herobase.io",
      }));

      return {
        emails: tagged,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
        sources: [
          { id: "hero-nft-showcase", label: "$HERO NFT Waitlist", count: total },
          // Future sources will be added here:
          // { id: "novareign", label: "Nova Reign Vault", count: 0 },
          // { id: "vetsincrypto", label: "VetsInCrypto", count: 0 },
          // { id: "herobase", label: "herobase.io", count: 0 },
        ],
      };
    }),

  /** Export master email list as CSV */
  exportMasterCsv: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const rows = await db
      .select()
      .from(waitlistSubscribers)
      .where(eq(waitlistSubscribers.verified, true))
      .orderBy(desc(waitlistSubscribers.verifiedAt));

    const header = "source,email,verifiedAt,ipAddress,createdAt";
    const lines = rows.map((r) =>
      [
        "hero-nft-showcase",
        `"${r.email}"`,
        r.verifiedAt ? r.verifiedAt.toISOString() : "",
        r.ipAddress ? `"${r.ipAddress}"` : "",
        r.createdAt.toISOString(),
      ].join(",")
    );

    return {
      csv: [header, ...lines].join("\n"),
      count: rows.length,
      generatedAt: new Date().toISOString(),
    };
  }),

  /** Summary stats across all sources */
  getSummary: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const heroCount = await db
      .select({ count: count() })
      .from(waitlistSubscribers)
      .where(eq(waitlistSubscribers.verified, true));

    return {
      totalAcrossAllSites: heroCount[0]?.count ?? 0,
      breakdown: [
        {
          source: "hero-nft-showcase",
          label: "$HERO NFT Waitlist",
          url: "https://nft.herobase.io",
          count: heroCount[0]?.count ?? 0,
          status: "active",
        },
        {
          source: "novareign",
          label: "Nova Reign Vault",
          url: "https://novareign.ai",
          count: 0,
          status: "pending-integration",
        },
        {
          source: "vetsincrypto",
          label: "VetsInCrypto",
          url: "https://vetsincrypto.com",
          count: 0,
          status: "pending-integration",
        },
        {
          source: "herobase",
          label: "herobase.io",
          url: "https://herobase.io",
          count: 0,
          status: "pending-integration",
        },
      ],
    };
  }),
});
