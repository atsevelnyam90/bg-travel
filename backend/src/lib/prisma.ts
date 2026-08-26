import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";
import { softDeleteExtension } from "./softDelete";

// ГАНЦ instance. Шинээр `new PrismaClient()` хийхгүй — winu-д мөрдөгдсөн зөв дүрэм
// (олон instance нь холболтын pool-ыг шавхдаг).
//
// Prisma 7: холболт нь schema-аас биш, driver adapter-ээс ирнэ.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const createBaseClient = () =>
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

const createClient = () => createBaseClient().$extends(softDeleteExtension);

// tsx watch дахин ачаалах бүрт шинэ холболт үүсгэхээс сэргийлнэ.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
  prismaUnfiltered?: ReturnType<typeof createBaseClient>;
};

/**
 * Ердийн client. Зөөлөн устгагдсан мөрийг АВТОМАТААР шүүнэ (`lib/softDelete.ts`).
 * Бараг үргэлж үүнийг ашиглана.
 */
export const prisma = globalForPrisma.prisma ?? createClient();

/**
 * Шүүлтгүй client — устгагдсан мөрийг ҮНЭХЭЭР харах шаардлагатай үед
 * (сэргээх, аудит, засварын script). Ашиглах болгондоо шалтгааныг тайлбарла.
 */
export const prismaUnfiltered = globalForPrisma.prismaUnfiltered ?? createBaseClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaUnfiltered = prismaUnfiltered;
}
