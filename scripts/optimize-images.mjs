// Recompresses the heavy PNG art into WebP at identical dimensions, so every
// CSS background-position / background-size ratio in the page keeps working
// untouched — we only change the bytes, not the geometry. Also emits a small,
// purpose-built Open Graph card (JPEG, ~1200x630) for link previews.
//   Run:  node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public/assets");

// PNGs that are referenced as CSS backgrounds — convert these to WebP and drop
// the original. `logo.png` is intentionally excluded: it doubles as the raster
// `logo` in our structured data, where PNG is the safer, best-supported format.
const convert = [
  "hero-bg.png", "hero-arch.png", "about-1.png", "about-2.png",
  "gallery-1.png", "gallery-2.png", "cta-bg.png", "amenities-illustration.png",
  "findpro-a.png", "findpro-stylist.png", "findpro-b.png",
];

const kb = (p) => (statSync(p).size / 1024) | 0;

for (const file of convert) {
  const src = join(dir, file);
  if (!existsSync(src)) { console.log("skip (missing):", file); continue; }
  const out = src.replace(/\.png$/, ".webp");
  const before = kb(src);
  await sharp(src).webp({ quality: 80, effort: 6 }).toFile(out);
  unlinkSync(src); // remove the now-unreferenced PNG so it isn't shipped
  console.log(`${file.padEnd(28)} ${before}KB png  →  ${kb(out)}KB webp`);
}

// Dedicated Open Graph / Twitter card. A focused 1200x630 JPEG keeps share
// scrapers happy (some reject multi-MB images) and renders crisply in feeds.
const ogSrc = join(dir, "cta-bg.webp");
if (existsSync(ogSrc)) {
  const ogOut = join(dir, "og.jpg");
  await sharp(ogSrc).resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(ogOut);
  console.log(`og.jpg                       built 1200x630  →  ${kb(ogOut)}KB`);
}

console.log("Done.");
