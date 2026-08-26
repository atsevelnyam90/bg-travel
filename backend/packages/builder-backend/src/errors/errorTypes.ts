export type BuilderErrors = {
  badRequest(message: string, details?: unknown): Error;
  unauthorized(message?: string): Error;
  forbidden(message?: string): Error;
  notFound(message?: string): Error;
  conflict(message: string): Error;
};
