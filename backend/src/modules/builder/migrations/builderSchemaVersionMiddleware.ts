import type { NextFunction, Request, Response } from "express";
import { assertBuilderSchemaVersion } from "./builderMigrationService";

let schemaCheckPromise: Promise<void> | null = null;

export async function requireBuilderSchemaVersion(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    schemaCheckPromise ??= assertBuilderSchemaVersion().catch((error: unknown) => {
      schemaCheckPromise = null;
      throw error;
    });
    await schemaCheckPromise;
    next();
  } catch (error) {
    next(error);
  }
}
