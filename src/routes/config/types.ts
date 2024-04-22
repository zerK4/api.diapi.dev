import { Hono } from "hono";
import JsonToTS from "json-to-ts";

const app = new Hono();

app.post("/", async (ctx) => {
  const data = await ctx.req.json();

  const schema = JsonToTS(data).map((typeInterface) => {
    console.log(JSON.stringify(typeInterface));

    console.log(JSON.parse(JSON.stringify(typeInterface)));

    return typeInterface;
  });

  console.log(schema);

  return ctx.text("cool");
});

export default app;
