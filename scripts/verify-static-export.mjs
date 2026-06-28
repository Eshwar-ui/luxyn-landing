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
