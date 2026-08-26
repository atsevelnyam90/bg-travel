import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: migrate/CLI-ийн холболт энд (schema.prisma дотор биш).
// Runtime холболт нь src/lib/prisma.ts дахь driver adapter-ээр.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
