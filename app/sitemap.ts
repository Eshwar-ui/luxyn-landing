import type { MetadataRoute } from "next";
import { site } from "./lib/site";

export const dynamic = "force-static";

/** Build-time stamp — kept as a fixed ISO date so the static export is
 *  deterministic. Bump this when the content meaningfully changes. */
const lastModified = "2026-06-18";

/** Key imagery surfaced to image search via the homepage entry. */
const homeImages = [
  "/assets/hero-bg.png",
  "/assets/gallery-1.png",
  "/assets/gallery-2.png",
  "/assets/cta-bg.png",
].map(p => `${site.url}${p}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`,        lastModified, changeFrequency: "monthly", priority: 1,   images: homeImages },
    { url: `${site.url}/privacy`, lastModified, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${site.url}/terms`,   lastModified, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${site.url}/cookies`, lastModified, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
