#!/usr/bin/env node
// Тест DB-г бэлдэнэ: үүсгэх (байхгүй бол) + migration хэрэглэх.
//
// Тусдаа DB ашиглах шалтгаан: тест бүр өгөгдөл устгадаг тул dev DB дээр
// ажиллуулбал ажлаа алдана.

import { execSync } from "node:child_process";

const DEV_URL = process.env.DATABASE_URL ?? "";
const TEST_URL =
  process.env.TEST_DATABASE_URL ?? DEV_URL.replace(/\/starter(\?|$)/, "/starter_test$1");

if (!TEST_URL || TEST_URL === DEV_URL) {
  console.error("TEST_DATABASE_URL тохируулаагүй, эсвэл dev DB-тэй ижил байна.");
  process.exit(1);
}

function databaseUrl(value, databaseName) {
  const url = new URL(value);
  url.pathname = `/${databaseName}`;
  url.search = "";
  return url.toString();
}

const adminUrl = databaseUrl(TEST_URL, "postgres");

const run = (command, env) =>
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env, COREPACK_ENABLE_AUTO_PIN: "0", ...env },
  });

try {
  // DB байхгүй бол үүсгэнэ (volume аль хэдийн үүссэн тохиолдолд init script ажиллахгүй).
  const exists = execSync(
    `psql "${adminUrl}" -tAc "SELECT 1 FROM pg_database WHERE datname='starter_test'"`,
    { env: process.env },
  )
    .toString()
    .trim();
  if (exists !== "1") {
    run(`psql "${adminUrl}" -v ON_ERROR_STOP=1 -c "CREATE DATABASE starter_test"`);
  }
} catch {
  console.log("psql олдсонгүй эсвэл DB аль хэдийн бий — үргэлжлүүлнэ");
}

run("corepack pnpm exec prisma migrate deploy", { DATABASE_URL: TEST_URL });
console.log("✓ Тест DB бэлэн:", TEST_URL.replace(/:[^:@]+@/, ":***@"));
