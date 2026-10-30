import { products as productsContract } from "@winu/contracts";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import { requirePermission } from "@/middlewares/requirePermission";
import { createProduct, deleteProduct, listProducts, updateProduct } from "./productService";

export const productsRouter: Router = Router();

// Express 5-д req.params нь string | string[] төрөлтэй — шууд дамжуулж болохгүй.
const idParamSchema = z.object({ id: z.uuid("id буруу байна") });

productsRouter.get(
  "/",
  requirePermission("product:read"),
  asyncHandler(async (req, res) => {
    const query = productsContract.listProductsQuerySchema.parse(req.query);
    res.json(await listProducts(query));
  }),
);

productsRouter.post(
  "/",
  requirePermission("product:write"),
  asyncHandler(async (req, res) => {
    const input = productsContract.createProductSchema.parse(req.body);
    const product = await createProduct(input);
    res.status(201).json(product);
  }),
);

productsRouter.patch(
  "/:id",
  requirePermission("product:write"),
  asyncHandler(async (req, res) => {
    const input = productsContract.updateProductSchema.parse(req.body);
    const { id } = idParamSchema.parse(req.params);
    res.json(await updateProduct(id, input));
  }),
);

productsRouter.delete(
  "/:id",
  requirePermission("product:delete"),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    await deleteProduct(id);
    res.status(204).end();
  }),
);
