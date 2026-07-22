import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("offline fallback document", () => {
  it("renders a compact Anar offline page with a retry action", () => {
    const html = readFileSync(resolve(process.cwd(), "public/offline.html"), "utf8");

    expect(html).toContain("<title>You're offline | Anar</title>");
    expect(html).toContain('src="/brand/anar-icon.png"');
    expect(html).toContain("Reconnect to view or update your nutrition data.");
    expect(html).toContain("Pages and account data require an internet connection.");
    expect(html).toContain('onclick="window.location.reload()"');
    expect(html).not.toContain("food_logs");
    expect(html).not.toContain("profiles");
  });
});
