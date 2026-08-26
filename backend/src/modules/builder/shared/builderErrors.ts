import type { BuilderErrors } from "@winu/builder-backend/errors";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "@/lib/errors";

export const builderErrors: BuilderErrors = {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};

export const { badRequest: builderBadRequest } = builderErrors;
export const { conflict: builderConflict } = builderErrors;
export const { forbidden: builderForbidden } = builderErrors;
export const { notFound: builderNotFound } = builderErrors;
export const { unauthorized: builderUnauthorized } = builderErrors;
