import { Context, Next } from "hono";
import { registerReads, registerWrites } from "../utils/api/db/register";
import { createMiddleware } from "hono/factory";

export const registrarMiddleware = createMiddleware(
  async (ctx: Context, next: Next) => {
    await next();
    const {
      req: { method },
    } = ctx;

    const contentId = ctx.res.headers.get("content-id");

    if (method === "GET") {
      await registerReads(contentId as string);
    }

    if (method !== "OPTIONS") {
      await registerWrites(contentId as string);
    }

    console.log(ctx.req.method, contentId, "starting...");
  }
);
