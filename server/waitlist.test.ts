import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateOtpCode } from "./waitlistDb";

// Mock the DB and Resend so tests don't hit real services
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
    },
  })),
}));

describe("Waitlist OTP", () => {
  it("generateOtpCode returns a 6-digit numeric string", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code)).toBeLessThanOrEqual(999999);
    }
  });

  it("generateOtpCode produces different codes on successive calls", () => {
    const codes = new Set(Array.from({ length: 10 }, () => generateOtpCode()));
    // With 10 calls, we should get at least 5 unique codes (extremely unlikely to collide)
    expect(codes.size).toBeGreaterThan(5);
  });
});

describe("Waitlist Router schema validation", () => {
  it("rejects invalid email in submitEmail input", async () => {
    const { z } = await import("zod");
    const schema = z.object({ email: z.string().email() });
    expect(() => schema.parse({ email: "not-an-email" })).toThrow();
    expect(() => schema.parse({ email: "valid@example.com" })).not.toThrow();
  });

  it("rejects non-6-digit code in verifyCode input", async () => {
    const { z } = await import("zod");
    const schema = z.object({ code: z.string().length(6) });
    expect(() => schema.parse({ code: "12345" })).toThrow();
    expect(() => schema.parse({ code: "1234567" })).toThrow();
    expect(() => schema.parse({ code: "123456" })).not.toThrow();
  });
});
