import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const outDir = join(process.cwd(), "out");

const checks = [];
const failures = [];

function check(name, assertion) {
  try {
    if (!assertion()) {
      failures.push(name);
      console.error(`FAIL ${name}`);
      return;
    }
    checks.push(name);
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

function readRequiredFile(relativePath) {
  const absolutePath = join(outDir, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    return fullPath;
  });
}

function htmlPathForRoute(routePath) {
  if (routePath === "/") return "index.html";
  return `${routePath.replace(/^\//, "")}.html`;
}

check("out directory exists", () => existsSync(outDir));

check("required root files exist", () =>
  ["index.html", "404.html", "sitemap.xml", "manifest.webmanifest", "facts.json"].every((file) =>
    existsSync(join(outDir, file)),
  ),
);

check("Next static assets exist", () => {
  const staticDir = join(outDir, "_next", "static");
  if (!existsSync(staticDir)) return false;
  const files = walkFiles(staticDir);
  return files.some((file) => extname(file) === ".js") && files.some((file) => extname(file) === ".css");
});

check("sitemap routes have HTML files", () => {
  const sitemap = readRequiredFile("sitemap.xml");
  const routeLocs = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  if (!routeLocs.length) throw new Error("No routes found in sitemap.xml");

  const missingRoutes = routeLocs
    .map((routePath) => [routePath, htmlPathForRoute(routePath)])
    .filter(([, htmlPath]) => !existsSync(join(outDir, htmlPath)));

  if (missingRoutes.length) {
    throw new Error(`Missing HTML for routes: ${missingRoutes.map(([routePath]) => routePath).join(", ")}`);
  }

  return true;
});

check("indexable HTML has unique metadata and canonical URLs", () => {
  const htmlFiles = walkFiles(outDir)
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !file.endsWith("404.html"))
    .filter((file) => !file.endsWith("_not-found.html"));
  const titles = new Map();
  const canonicals = new Map();

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const route = relative(outDir, file);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    if (!title || !description || !canonical) throw new Error(`Missing title, description, or canonical: ${route}`);
    if (titles.has(title)) throw new Error(`Duplicate title: ${title}`);
    if (canonicals.has(canonical[1])) throw new Error(`Duplicate canonical: ${canonical[1]}`);
    titles.set(title, route);
    canonicals.set(canonical[1], route);
  }
  return true;
});

check("indexable HTML contains structured data", () => {
  const htmlFiles = walkFiles(outDir)
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !file.endsWith("404.html"))
    .filter((file) => !file.endsWith("_not-found.html"));
  return htmlFiles.every((file) => readFileSync(file, "utf8").includes('type="application/ld+json"'));
});

check("new service and question routes are exported", () => {
  const expected = [
    "services/hair-stylist-suites.html",
    "services/esthetician-room-rental.html",
    "services/nail-suite-rental.html",
    "services/lash-brow-studio.html",
    "services/massage-wellness-room.html",
    "questions/what-is-included-in-a-salon-suite-lease.html",
    "questions/salon-suite-vs-booth-rent.html",
    "questions/how-to-lease-a-salon-suite.html",
  ];
  return expected.every((file) => existsSync(join(outDir, file)));
});

check("home page contains brand and footer credit", () => {
  const home = readRequiredFile("index.html");
  return home.includes("LUXYN") && home.includes("designed and developed by") && home.includes("VELVO MEDIA");
});

check("machine-readable feeds are valid", () => {
  JSON.parse(readRequiredFile("facts.json"));
  const llms = readRequiredFile("llms.txt");
  return llms.includes("LUXYN");
});

check("export has no empty html/css/js files", () => {
  const badFiles = walkFiles(outDir).filter((file) => {
    const extension = extname(file);
    return [".html", ".css", ".js"].includes(extension) && statSync(file).size === 0;
  });

  if (badFiles.length) {
    throw new Error(`Empty output files: ${badFiles.map((file) => relative(outDir, file)).join(", ")}`);
  }

  return true;
});

if (failures.length) {
  console.error(`\nStatic export verification failed: ${failures.length} failure(s).`);
  process.exit(1);
}

console.log(`\nStatic export verification passed: ${checks.length} checks.`);
