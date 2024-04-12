import { Hono } from "hono";

const app = new Hono();

app.get("/", async (ctx) => {
  return ctx.text("Hello Hono!");
});

export default app;
