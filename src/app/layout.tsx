import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

const appName = "Anar";
const appDescription = "Track foods, daily nutrition targets, and healthy habits with Anar.";
const themeColor = "#FFFCF7";

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${appName} - Personal Nutrition Tracker`,
    template: "%s | Anar",
  },
  description: appDescription,
  applicationName: appName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/brand/anar-icon.png?v=20260720",
        sizes: "1023x1023",
        type: "image/png",
      },
      {
        url: "/icons/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "/brand/anar-icon.png?v=20260720",
        sizes: "1023x1023",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/pwa/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor,
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={manrope.variable} lang="en" dir="ltr">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
