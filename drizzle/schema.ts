import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Verified waitlist subscribers for $HERO NFT newsletter.
 * Only emails that have completed OTP verification are stored here.
 */
export const waitlistSubscribers = mysqlTable("waitlist_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaitlistSubscriber = typeof waitlistSubscribers.$inferSelect;
export type InsertWaitlistSubscriber = typeof waitlistSubscribers.$inferInsert;

/**
 * Temporary OTP codes for email verification.
 * Codes expire after 10 minutes and are deleted after successful verification.
 */
export const emailOtps = mysqlTable("email_otps", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailOtp = typeof emailOtps.$inferSelect;

/**
 * Nova Reign Vault — verified email subscribers.
 * Two-step: age verification → email OTP → stored here.
 * Source tag: 'novareign' in master email directory.
 */
export const novaReignVault = mysqlTable("nova_reign_vault", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  ageVerified: boolean("ageVerified").default(false).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  deletedAt: timestamp("deletedAt"), // soft-delete
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NovaReignVaultSubscriber = typeof novaReignVault.$inferSelect;
export type InsertNovaReignVaultSubscriber = typeof novaReignVault.$inferInsert;

/**
 * OTP codes for Nova Reign vault email verification.
 * Separate table from hero-nft-showcase OTPs to keep concerns isolated.
 */
export const novaReignOtps = mysqlTable("nova_reign_otps", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NovaReignOtp = typeof novaReignOtps.$inferSelect;

/**
 * Valor 1775 — verified waitlist subscribers.
 * OTP-verified email list for research compound updates.
 * Source tag: 'valor1775' in master email directory.
 */
export const valor1775Subscribers = mysqlTable("valor1775_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  deletedAt: timestamp("deletedAt"), // soft-delete
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Valor1775Subscriber = typeof valor1775Subscribers.$inferSelect;
export type InsertValor1775Subscriber = typeof valor1775Subscribers.$inferInsert;

/**
 * OTP codes for Valor 1775 email verification.
 */
export const valor1775Otps = mysqlTable("valor1775_otps", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Valor1775Otp = typeof valor1775Otps.$inferSelect;
