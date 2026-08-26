import rateLimit from "express-rate-limit";
import { env } from "@/lib/env";

// ⚠️ Default store нь ПРОЦЕССЫН САНАХ ОЙД байдаг. Нэг instance дээр л зөв
// ажиллана — олон instance / PM2 cluster дээр хязгаар нь instance тутамд
// тусдаа тоологдоно.
//
// Production-д олон instance ажиллуулах бол Redis store холбоно:
//   import { RedisStore } from "rate-limit-redis";
//   store: new RedisStore({ sendCommand: (...args) => redis.sendCommand(args) })
//
// Энэ хязгаарлалтыг ил бичиж байгаа шалтгаан: winu дээр session-ыг санах ойд
// хадгалсныг хэн ч тэмдэглээгүйгээс production дээр асуудал үүссэн.

const isTest = env.NODE_ENV === "test";

/** Нэвтрэх оролдлого — brute force-оос сэргийлнэ. */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1_000 : 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Алдааны формат бусад endpoint-той ижил байх ёстой.
  handler: (_req, res) => {
    res.status(429).json({
      message: "Хэт олон оролдлого. Хэсэг хүлээгээд дахин оролдоно уу.",
      code: "TOO_MANY_REQUESTS",
    });
  },
});

/** Токен сэргээх — хулгайлагдсан токеноор дараалан оролдохоос сэргийлнэ. */
export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1_000 : 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Хэт олон оролдлого. Хэсэг хүлээгээд дахин оролдоно уу.",
      code: "TOO_MANY_REQUESTS",
    });
  },
});
