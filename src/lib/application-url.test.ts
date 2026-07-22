import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApplicationUrlConfigurationError,
  createApplicationUrl,
  getCanonicalApplicationUrl,
} from "@/lib/application-url";

describe("canonical application URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the production URL from the environment", () => {
    expect(
      getCanonicalApplicationUrl({
        NEXT_PUBLIC_SITE_URL: "https://anar.pegah.no",
        NODE_ENV: "production",
      }),
    ).toBe("https://anar.pegah.no");
  });

  it("normalizes a trailing slash", () => {
    expect(
      getCanonicalApplicationUrl({
        NEXT_PUBLIC_SITE_URL: "https://anar.pegah.no/",
        NODE_ENV: "production",
      }),
    ).toBe("https://anar.pegah.no");
  });

  it("rejects an invalid configured URL", () => {
    expect(() =>
      getCanonicalApplicationUrl({
        NEXT_PUBLIC_SITE_URL: "anar.pegah.no",
        NODE_ENV: "production",
      }),
    ).toThrow(ApplicationUrlConfigurationError);
  });

  it("rejects a missing production URL", () => {
    expect(() =>
      getCanonicalApplicationUrl({
        NODE_ENV: "production",
      }),
    ).toThrow("NEXT_PUBLIC_SITE_URL must be set to the production application URL.");
  });

  it("allows a localhost fallback only outside production", () => {
    expect(
      getCanonicalApplicationUrl({
        NODE_ENV: "development",
      }),
    ).toBe("http://localhost:3000");

    expect(
      getCanonicalApplicationUrl({
        NODE_ENV: "test",
      }),
    ).toBe("http://localhost:3000");
  });

  it("does not allow a production localhost URL", () => {
    expect(() =>
      getCanonicalApplicationUrl({
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        NODE_ENV: "production",
      }),
    ).toThrow("NEXT_PUBLIC_SITE_URL cannot point to localhost in production.");
  });

  it("builds absolute application URLs with safe search params", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://anar.pegah.no/");
    vi.stubEnv("NODE_ENV", "production");

    expect(createApplicationUrl("/auth/callback", { next: "/today" }).toString()).toBe(
      "https://anar.pegah.no/auth/callback?next=%2Ftoday",
    );
  });
});
