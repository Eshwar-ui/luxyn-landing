import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static landing page — export plain HTML/CSS/JS for Firebase Hosting.
  output: "export",
  images: { unoptimized: true },
  // No `experimental.inlineCss`: it put the ~72KB stylesheet in a <style> tag
  // *and* twice more in the RSC payload, roughly doubling every page's HTML.
  // A cached external stylesheet measured faster (lower TBT, same-or-better
  // FCP/LCP) on both the home page and articles.
};

export default nextConfig;
