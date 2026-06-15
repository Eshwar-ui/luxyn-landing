import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUXYN — Space to do your best work",
  description:
    "LUXYN leases private, design-led suites to independent beauty and wellness professionals — the freedom to build, serve, and grow in an elevated space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
