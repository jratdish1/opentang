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
import { waitlistSubscribers, novaReignVault, valor1775Subscribers } from "../../drizzle/schema";
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
        id: r.id,
        email: r.email,
        verifiedAt: r.verifiedAt,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
        source: "hero-nft-showcase",
        siteLabel: "$HERO NFT Waitlist",
        siteUrl: "https://nft.herobase.io",
      }));

      // Also fetch Nova Reign vault subscribers
      const novaRows = await db
        .select()
        .from(novaReignVault)
        .where(eq(novaReignVault.verified, true))
        .orderBy(desc(novaReignVault.verifiedAt))
        .limit(input.pageSize)
        .offset(offset);

      const novaTagged = novaRows.map((r) => ({
        id: r.id + 100000, // offset to avoid ID collision in unified list
        email: r.email,
        verifiedAt: r.verifiedAt,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
        source: "novareign",
        siteLabel: "Nova Reign Vault",
        siteUrl: "https://novareign.ai",
      }));

      const novaTotal = await db
        .select({ count: count() })
        .from(novaReignVault)
        .where(eq(novaReignVault.verified, true));
      const novaTotalCount = novaTotal[0]?.count ?? 0;

      // Fetch Valor 1775 subscribers
      const valorRows = await db
        .select()
        .from(valor1775Subscribers)
        .where(eq(valor1775Subscribers.verified, true))
        .orderBy(desc(valor1775Subscribers.verifiedAt))
        .limit(input.pageSize)
        .offset(offset);

      const valorTagged = valorRows.map((r) => ({
        id: r.id + 200000,
        email: r.email,
        verifiedAt: r.verifiedAt,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
        source: "valor1775",
        siteLabel: "Valor 1775 Waitlist",
        siteUrl: "https://1775valor.com",
      }));

      const valorTotal = await db
        .select({ count: count() })
        .from(valor1775Subscribers)
        .where(eq(valor1775Subscribers.verified, true));
      const valorTotalCount = valorTotal[0]?.count ?? 0;

      return {
        emails: [...tagged, ...novaTagged, ...valorTagged],
        total: total + novaTotalCount + valorTotalCount,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil((total + novaTotalCount + valorTotalCount) / input.pageSize),
        sources: [
          { id: "hero-nft-showcase", label: "$HERO NFT Waitlist", count: total },
          { id: "novareign", label: "Nova Reign Vault", count: novaTotalCount },
          { id: "valor1775", label: "Valor 1775 Waitlist", count: valorTotalCount },
        ],
      };
    }),

  /** Export master email list as CSV — includes all sources */
  exportMasterCsv: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const heroRows = await db
      .select()
      .from(waitlistSubscribers)
      .where(eq(waitlistSubscribers.verified, true))
      .orderBy(desc(waitlistSubscribers.verifiedAt));

    const novaRows = await db
      .select()
      .from(novaReignVault)
      .where(eq(novaReignVault.verified, true))
      .orderBy(desc(novaReignVault.verifiedAt));

    const header = "source,email,verifiedAt,ipAddress,createdAt";
    const valorRows = await db
      .select()
      .from(valor1775Subscribers)
      .where(eq(valor1775Subscribers.verified, true))
      .orderBy(desc(valor1775Subscribers.verifiedAt));

    const heroLines = heroRows.map((r) =>
      ["hero-nft-showcase", `"${r.email}"`, r.verifiedAt?.toISOString() ?? "", r.ipAddress ? `"${r.ipAddress}"` : "", r.createdAt.toISOString()].join(",")
    );
    const novaLines = novaRows.map((r) =>
      ["novareign", `"${r.email}"`, r.verifiedAt?.toISOString() ?? "", r.ipAddress ? `"${r.ipAddress}"` : "", r.createdAt.toISOString()].join(",")
    );
    const valorLines = valorRows.map((r) =>
      ["valor1775", `"${r.email}"`, r.verifiedAt?.toISOString() ?? "", r.ipAddress ? `"${r.ipAddress}"` : "", r.createdAt.toISOString()].join(",")
    );

    return {
      csv: [header, ...heroLines, ...novaLines, ...valorLines].join("\n"),
      count: heroRows.length + novaRows.length + valorRows.length,
      generatedAt: new Date().toISOString(),
    };
  }),

  /** Summary stats across all sources */
  getSummary: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const [heroCount, novaCount, valorCount] = await Promise.all([
      db.select({ count: count() }).from(waitlistSubscribers).where(eq(waitlistSubscribers.verified, true)),
      db.select({ count: count() }).from(novaReignVault).where(eq(novaReignVault.verified, true)),
      db.select({ count: count() }).from(valor1775Subscribers).where(eq(valor1775Subscribers.verified, true)),
    ]);

    const heroTotal = heroCount[0]?.count ?? 0;
    const novaTotal = novaCount[0]?.count ?? 0;
    const valorTotal = valorCount[0]?.count ?? 0;

    return {
      totalAcrossAllSites: heroTotal + novaTotal + valorTotal,
      breakdown: [
        { source: "hero-nft-showcase", label: "$HERO NFT Waitlist", url: "https://nft.herobase.io", count: heroTotal, status: "active" },
        { source: "novareign", label: "Nova Reign Vault", url: "https://novareign.ai", count: novaTotal, status: "active" },
        { source: "valor1775", label: "Valor 1775 Waitlist", url: "https://1775valor.com", count: valorTotal, status: "active" },
        { source: "vetsincrypto", label: "VetsInCrypto", url: "https://vetsincrypto.com", count: 0, status: "pending-integration" },
        { source: "herobase", label: "herobase.io", url: "https://herobase.io", count: 0, status: "pending-integration" },
      ],
    };
  }),
});
