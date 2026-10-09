import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static landing page — export plain HTML/CSS/JS for Firebase Hosting.
  output: "export",
  images: { unoptimized: true },
  // Ship the (small, Tailwind-only) stylesheet inside the HTML instead of a
  // render-blocking <link> — removes a round trip before first paint, which is
  // most of what new visitors on mobile wait for.
  experimental: { inlineCss: true },
};

export default nextConfig;
