import { products as productsContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { getPublicProduct, listPublicProducts } from "@/modules/products/productService";

/**
 * НЭВТРЭЛТГҮЙ endpoint-ууд.
 *
 * Дүрэм:
 *   - `requirePermission` ЭНД БАЙХГҮЙ — зориудаар нээлттэй
 *   - Зөвхөн нийтэд зориулсан талбарууд буцаана (status, дотоод id, эзэмшигч г.м биш)
 *   - Зөвхөн PUBLISHED өгөгдөл
 *   - Бичих үйлдэл ХИЙХГҮЙ (маягт хүлээж авах бол тусад нь rate limit + captcha)
 *
 * Шинэ public endpoint нэмэхдээ дээрх дөрвийг шалга.
 */
const slugParamSchema = z.object({ slug: z.string().min(1).max(200) });

export const publicRouter: Router = Router();

publicRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const query = productsContract.listProductsQuerySchema.parse(req.query);
    res.json(await listPublicProducts(query));
  }),
);

publicRouter.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = slugParamSchema.parse(req.params);
    res.json(await getPublicProduct(slug));
  }),
);
