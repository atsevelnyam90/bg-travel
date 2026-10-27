import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "dist",
  "node_modules",
  "out",
  "src/api/generated",
]);

const portalImportRules = [
  {
    root: "portal/src",
    disallowed: [
      {
        pattern: /from\s+["']@winu\/mn-integrations(?:\/[^"']*)?["']|import\(\s*["']@winu\/mn-integrations(?:\/[^"']*)?["']\s*\)/,
        message: "portal нь @winu/mn-integrations import хийхгүй",
      },
      {
        pattern: /from\s+["'][^"']*(?:\.\.\/)+backend(?:\/[^"']*)?["']|import\(\s*["'][^"']*(?:\.\.\/)+backend(?:\/[^"']*)?["']\s*\)/,
        message: "portal нь backend folder-оос шууд import хийхгүй",
      },
    ],
  },
  {
    root: "portal/packages",
    disallowed: [
      {
        pattern: /from\s+["']@winu\/mn-integrations(?:\/[^"']*)?["']|import\(\s*["']@winu\/mn-integrations(?:\/[^"']*)?["']\s*\)/,
        message: "portal package нь @winu/mn-integrations import хийхгүй",
      },
    ],
  },
];

function walk(relativeRoot) {
  const absoluteRoot = path.join(repoRoot, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];

  const files = [];
  const visit = (absoluteDirectory) => {
    for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
      const absolutePath = path.join(absoluteDirectory, entry.name);
      const relativePath = path.relative(repoRoot, absolutePath);
      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name) || ignoredDirectories.has(relativePath)) continue;
        visit(absolutePath);
        continue;
      }
      if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
        files.push(relativePath);
      }
    }
  };

  visit(absoluteRoot);
  return files;
}

function lines(file) {
  return readFileSync(path.join(repoRoot, file), "utf8")
    .split("\n")
    .map((text, index) => ({ number: index + 1, text }));
}

const failures = [];

for (const rule of portalImportRules) {
  for (const file of walk(rule.root)) {
    for (const line of lines(file)) {
      for (const disallowed of rule.disallowed) {
        if (disallowed.pattern.test(line.text)) {
          failures.push(`${file}:${line.number} ${disallowed.message}`);
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Boundary check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Boundary check passed.");
