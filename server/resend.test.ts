import { describe, expect, it } from "vitest";

describe("Resend API Key", () => {
  it("RESEND_API_KEY environment variable is set", () => {
    const key = process.env.RESEND_API_KEY;
    expect(key, "RESEND_API_KEY must be set in environment").toBeTruthy();
    expect(key?.startsWith("re_"), "RESEND_API_KEY should start with re_").toBe(true);
  });

  it("Resend API key can reach the Resend API domains endpoint", async () => {
    const key = process.env.RESEND_API_KEY;
    const resp = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    // 200 = valid key with domains, 403 = valid key no domains — both mean key is valid
    expect([200, 403]).toContain(resp.status);
  });
});
