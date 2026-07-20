import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  it("describes Anar as an installable standalone app", () => {
    expect(manifest()).toMatchObject({
      name: "Anar - Personal Nutrition Tracker",
      short_name: "Anar",
      start_url: "/today",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#FFFCF7",
      background_color: "#FFFCF7",
    });
  });

  it("includes Android and maskable icons", () => {
    expect(manifest().icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/pwa/icon-192.png",
          sizes: "192x192",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icons/pwa/icon-512.png",
          sizes: "512x512",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icons/pwa/maskable-512.png",
          sizes: "512x512",
          purpose: "maskable",
        }),
      ]),
    );
  });
});
