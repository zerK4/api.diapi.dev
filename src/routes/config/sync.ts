import { Hono } from "hono";
import { client } from "../../db";

const app = new Hono();

app.get("/", async (ctx) => {
  console.log("Syncing...");
  await client.sync();

  return ctx.text("Synced");
});

export default app;
