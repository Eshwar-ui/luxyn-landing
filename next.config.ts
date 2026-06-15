import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static landing page — export plain HTML/CSS/JS for Firebase Hosting.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
