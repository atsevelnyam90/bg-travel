import {
  orders as ordersContract,
  products as productsContract,
  travels as travelsContract,
} from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { publicOrderRateLimit } from "@/middlewares/rateLimit";
import { auditFromRequest } from "@/modules/audit/writeAudit";
import { createPublicOrder, getPublicPaymentInfo } from "@/modules/orders/publicOrderService";
import { getPublicProduct, listPublicProducts } from "@/modules/products/productService";
import { getPublicTravel, listPublicTravels } from "@/modules/travels/publicTravelService";

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
  "/travels",
  asyncHandler(async (req, res) => {
    const { locale } = travelsContract.publicTravelsQuerySchema.parse(req.query);
    res.json(await listPublicTravels(locale));
  }),
);

publicRouter.get(
  "/travels/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = slugParamSchema.parse(req.params);
    const { locale } = travelsContract.publicTravelsQuerySchema.parse(req.query);
    res.json(await getPublicTravel(slug, locale));
  }),
);

publicRouter.get("/payment-info", (_req, res) => {
  res.json(getPublicPaymentInfo());
});

publicRouter.post(
  "/orders",
  publicOrderRateLimit,
  asyncHandler(async (req, res) => {
    const input = ordersContract.createPublicOrderSchema.parse(req.body);
    const result = await createPublicOrder(input);
    if (result.created) {
      await auditFromRequest(req)({
        action: "create",
        resource: "order",
        resourceId: result.orderId,
        meta: { publicOrderId: result.order.publicOrderId },
      });
    }
    res.status(result.created ? 201 : 200).json(result.order);
  }),
);

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
