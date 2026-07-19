import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Anar - Personal Nutrition Tracker",
    template: "%s | Anar",
  },
  description: "Track foods, daily nutrition targets, and healthy habits with Anar.",
  applicationName: "Anar",
  icons: {
    icon: [
      {
        url: "/brand/anar-icon.png?v=20260720",
        sizes: "1023x1023",
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
        url: "/brand/anar-icon.png?v=20260720",
        sizes: "1023x1023",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFCF7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={manrope.variable} lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
