import { Prisma } from "@/generated/prisma/client";

/**
 * Зөөлөн устгал автоматаар шүүх Prisma extension.
 *
 * Асуудал: `deletedAt: null`-ыг query бүрд ГАРААР бичих нь модуль олшрох тусам
 * мартагдана. Нэг мартсан газар = устгасан мөр буцаж гарч ирнэ.
 *
 * Шийдэл: доорх model-уудын унших query-д шүүлтийг автоматаар шахна.
 *
 * ⚠️ Хоёр зүйлийг анхаар:
 *   1. `findUnique` → `findFirst` болж хувирна (findUnique нь unique бус
 *      талбараар шүүхийг зөвшөөрдөггүй). Семантик ижил, batching алдагдана.
 *   2. Устгагдсан мөр ҮНЭХЭЭР хэрэгтэй бол (сэргээх, аудит) `prismaUnfiltered`
 *      ашиглана — `lib/prisma.ts`.
 *
 * Model нэмэхдээ энэ жагсаалтад бичнэ — schema-д `deletedAt` байгаа эсэхийг
 * шалга, эс тэгвэл Prisma "Unknown argument" гэж унана.
 */
const SOFT_DELETE_MODELS = new Set<string>([
  "User",
  "Organization",
  "Product",
  "Travel",
  "TravelDeparture",
  "Order",
  "WebsitePage",
  "WebsiteSection",
  "BuilderDefinition",
  "BuilderView",
]);

type WhereArgs = { where?: Record<string, unknown> };

const notDeleted = <T extends WhereArgs>(args: T): T => ({
  ...args,
  where: { ...args.where, deletedAt: null },
});

export const softDeleteExtension = Prisma.defineExtension({
  name: "softDelete",
  query: {
    $allModels: {
      findMany({ model, args, query }) {
        return query(SOFT_DELETE_MODELS.has(model) ? notDeleted(args) : args);
      },
      findFirst({ model, args, query }) {
        return query(SOFT_DELETE_MODELS.has(model) ? notDeleted(args) : args);
      },
      count({ model, args, query }) {
        return query(SOFT_DELETE_MODELS.has(model) ? notDeleted(args) : args);
      },
      // findUnique нь `where`-т unique бус талбар авдаггүй тул шүүлт нэмэх
      // боломжгүй. Дуудагч тал `deletedAt`-ыг өөрөө шалгана — эсвэл findFirst
      // ашиглана. Энэ хязгаарыг ил тэмдэглэж байна.
    },
  },
});
