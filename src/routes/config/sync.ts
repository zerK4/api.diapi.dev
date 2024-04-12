import { Hono } from "hono";
import { client } from "../../db";
import { bearerAuth } from "hono/bearer-auth";

const app = new Hono();
const token = process.env.SYNC_TOKEN!;

app.get("/", async (ctx) => {
  // protect this.
  await client.sync();

  return ctx.text("Synced");
});

export default app;
