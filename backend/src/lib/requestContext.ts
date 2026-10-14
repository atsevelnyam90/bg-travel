import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";
import type { AuthContext } from "@/modules/auth/authContext";

type RequestContext = {
  auth?: AuthContext;
};

const requestContext = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext(req: Request, _res: Response, next: NextFunction): void {
  requestContext.run({ auth: req.auth }, next);
}

export function getRequestAuth(): AuthContext | undefined {
  return requestContext.getStore()?.auth;
}
