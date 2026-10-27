import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "@/lib/asyncHandler";
import {
  legacyTravelFileContentTypes,
  legacyTravelFileKeySchema,
  readLegacyTravelFile,
} from "./legacyTravelFiles";

/** Хуучин runtime-аар upload хийсэн URL-уудыг эвдэхгүй унших compatibility endpoint. */
export const legacyTravelFilesRouter: Router = Router();

legacyTravelFilesRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const params = z.object({ key: legacyTravelFileKeySchema }).parse(req.params);
    const { key, file } = await readLegacyTravelFile(params.key);
    const extension = key.split(".").pop()?.toLowerCase() ?? "";
    res.type(legacyTravelFileContentTypes[extension] ?? "application/octet-stream").send(file);
  }),
);
