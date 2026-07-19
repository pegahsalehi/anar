import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Anar - Personal Nutrition Tracker",
    template: "%s | Anar",
  },
  description: "Track foods, daily nutrition goals, and healthy habits with Anar.",
  applicationName: "Anar",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFDFB" },
    { media: "(prefers-color-scheme: dark)", color: "#FBFDFB" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
