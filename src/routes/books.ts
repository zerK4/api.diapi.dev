import { Hono } from "hono";
import { db } from "../db";
import { ContentType, contents } from "../db/schema";
import { getAllBooks, getBookById } from "../utils/api/books/getters";

const app = new Hono();

app.get("/all", async (ctx) => {
  const { key: searchKey, value } = ctx.req.query();
  const key = ctx.req.path.split("/")[4];

  const content = await getAllBooks(key);

  if (!content) {
    ctx.status(404);
    return ctx.json({ message: "Not found", content: null });
  }

  if (!searchKey || !value) {
    return ctx.json({
      message: "Content fetched successfully.",
      content: content,
    });
  }

  if (Array.isArray(content)) {
    const data = content
      .map((item) => {
        if (String(item[searchKey]).toLowerCase() !== value.toLowerCase())
          return null;

        return item;
      })
      .filter((item) => item !== null);

    return ctx.json({
      message: "Content fetched successfully.",
      content: data,
    });
  }

  return ctx.json({
    message: "Content fetched successfully.",
  });
});

app.get("/:id", async (ctx) => {
  const { id } = ctx.req.param();
  const key = ctx.req.path.split("/")[4];
  const book = await getBookById({
    bookId: id,
    apiKey: key,
  });

  if (!book) {
    return ctx.json({ message: "Not found", content: null });
  }

  return ctx.json({ message: "Content fetched successfully.", content: book });
});

app.put("/:id", async (ctx) => {
  const { id } = ctx.req.param();
  const key = ctx.req.path.split("/")[4];
  const { key: searchKey, value } = await ctx.req.json();
  let data: ContentType["content"] = [];

  if (!key || !value) {
    return ctx.json({ message: "Invalid data" });
  }

  const allBooks = await getAllBooks(key);

  if (!allBooks) return ctx.json({ message: "Not found" });

  if (Array.isArray(allBooks)) {
    const book = allBooks.find((book) => book.id === id);
    book[searchKey] = value;
    data = allBooks.map((x) => {
      if (x.id === id) {
        return book;
      }

      return x;
    });

    if (!book)
      return ctx.json({
        message: "Not found",
        data: null,
      });

    await db.update(contents).set({
      content: data,
    });

    return ctx.json({
      message: "Content updated successfully.",
      data: data,
    });
  }

  return ctx.json({ message: "Not found", data });
});

app.post("/", async (ctx) => {
  const key = ctx.req.path.split("/")[4];
  const { key: searchKey, value } = await ctx.req.json();
  const data = await getAllBooks(key);

  return ctx.json({
    message: "Content fetched successfully.",
  });
});

export default app;
