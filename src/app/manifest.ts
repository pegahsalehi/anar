import type { MetadataRoute } from "next";

const appName = "Anar";
const appDescription = "Track foods, daily nutrition targets, and healthy habits with Anar.";
const themeColor = "#FFFCF7";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appName} - Personal Nutrition Tracker`,
    short_name: appName,
    description: appDescription,
    id: "/",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    background_color: themeColor,
    theme_color: themeColor,
    orientation: "portrait",
    categories: ["health", "fitness", "food"],
    icons: [
      {
        src: "/icons/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/pwa/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
