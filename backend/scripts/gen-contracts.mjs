#!/usr/bin/env node
// backend/packages/contracts → portal/src/api/generated/contracts
//
// API-г backend тодорхойлдог тул contract-ийн ЭЗЭН нь backend.
// Portal нь хуулбарыг уншина — гараар бичсэн DTO биш.
//
// winu дээр portal 26 DTO файлыг гараар хуулж бичсэн байсан бөгөөд backend
// enum/response өөрчлөгдвөл зөвхөн runtime-д мэдэгддэг байсан. Энэ script нь
// хуулбарыг машин үүсгэдэг болгож, portal-ыг compile үед унагадаг болгоно.
//
// CI дээр дахин ажиллуулж, git diff гарвал унана — дрифт үүсэхгүй.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, "../packages/contracts/src");
const DEST = path.resolve(here, "../../portal/src/api/generated/contracts");

const BANNER = `// ⚠️ АВТОМАТААР ҮҮССЭН ФАЙЛ — ГАРААР БҮҮ ЗАС.
// Эх сурвалж: backend/packages/contracts/src
// Дахин үүсгэх: pnpm gen:contracts
`;

async function collect(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(full, base)));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".spec.ts")) {
      files.push(path.relative(base, full));
    }
  }
  return files;
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`Эх folder олдсонгүй: ${SRC}`);
    process.exit(1);
  }

  // Хуучин гаралтыг бүрэн устгана — устгагдсан файл portal-д үлдэхгүй.
  await rm(DEST, { recursive: true, force: true });
  await mkdir(DEST, { recursive: true });

  const files = await collect(SRC);
  for (const relative of files) {
    const target = path.join(DEST, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, BANNER + (await readFile(path.join(SRC, relative), "utf8")));
  }

  console.log(`✓ ${files.length} файл → portal/src/api/generated/contracts`);
  for (const file of files) console.log(`  ${file}`);
}

main();
