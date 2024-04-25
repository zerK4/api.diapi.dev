import { Hono } from "hono";
import { getBook } from "../../utils/api/books/getters";

const app = new Hono();

app.get("/*", async (ctx) => {
  const apiKey = ctx.req.url.split("/")[6];

  const book = await getBook(apiKey);

  console.log(book, "the url");
  return ctx.text("Hello, world!");
});

export default app;
