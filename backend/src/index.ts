import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { ensureBucket } from "@/lib/storage/s3";
import { createServer } from "@/server";

// Create the bucket during development; the deployment script provisions it in production.
if (env.NODE_ENV === "development") void ensureBucket();

const app = createServer();
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "API асав");
});

/**
 * Graceful shutdown.
 *
 * Үүнгүйгээр deploy бүрт дунд нь явж байсан хүсэлт тасарна — төлбөр бичиж
 * байсан бол хагас төлөвт үлдэж болно. SIGTERM ирэхэд:
 *   1. Шинэ холболт хүлээж авахаа болино
 *   2. Явж байгаа хүсэлтүүд дуусахыг хүлээнэ
 *   3. DB холболтыг цэвэр хаана
 */
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Унтрааж байна…");

  // Хүлээх дээд хугацаа — гацсан хүсэлт deploy-г түгжихээс сэргийлнэ.
  const force = setTimeout(() => {
    logger.error("Хугацаа хэтэрлээ — албадан хаана");
    process.exit(1);
  }, 15_000);
  force.unref();

  server.close(async (error) => {
    if (error) logger.error({ err: error }, "Сервер хаахад алдаа");
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, "DB салгахад алдаа");
    }
    logger.info("Цэвэр унтарлаа");
    process.exit(error ? 1 : 0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

// Баригдаагүй алдаа — лог руу бичээд унтарна (PM2/orchestrator дахин асаана).
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Баригдаагүй promise rejection");
  void shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Баригдаагүй exception");
  void shutdown("uncaughtException");
});
