import path from "node:path";
import { defineConfig } from "vitest/config";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://starter:starter@localhost:5433/starter_test?schema=public";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    // scrypt зориудаар CPU/санах ой хүнд (N=2^17) — hash тутамд ~0.5s.
    // CI дээр ачаалалтай үед default 5s хүрэлцэхгүй байж flake үүсгэдэг.
    testTimeout: 30_000,
    // Integration тестүүд ижил DB-г хуваалцдаг тул дараалан ажиллана.
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: TEST_DATABASE_URL,
      SESSION_SECRET: "test-secret-at-least-32-characters-long",
      CORS_ORIGINS: "http://localhost:3000",
    },
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
});
