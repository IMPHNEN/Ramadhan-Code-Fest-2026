import type { MiddlewareHandler } from "hono";

export const logger = (): MiddlewareHandler => async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(
    `[${new Date().toLocaleTimeString("id-ID")}] ${method} ${path} - ${status} (${duration}ms)`,
  );
};
