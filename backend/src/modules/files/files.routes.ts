import { files as filesContract } from "@winu/contracts";
import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { presignUpload } from "@/lib/storage/s3";
import { requireAuth } from "@/middlewares/requirePermission";

export const filesRouter: Router = Router();

/**
 * Клиент файлаа шууд S3 руу тавихад зориулсан түр зөвшөөрөл.
 *
 * Нэвтэрсэн байхыг шаардана. Төрөл, хэмжээ хоёрыг СЕРВЕР шалгана — гарын
 * үсэгт тэдгээр нь ордог тул клиент өөрчилвөл S3 өөрөө татгалзана.
 */
filesRouter.post(
  "/presign",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = filesContract.presignUploadSchema.parse(req.body);
    res.json(await presignUpload(input));
  }),
);
