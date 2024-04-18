import { Hono } from "hono";
import { client, db } from "../db";
import { ContentType, apiKeys, contents } from "../db/schema";
import { getBook, getContentById } from "../utils/api/books/getters";
import { eq } from "drizzle-orm";

const app = new Hono();

app.get("/all", async (ctx) => {
  const { key: searchKey, value } = ctx.req.query();
  const key = ctx.req.path.split("/")[4];

  const content = await getBook(key);

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
  const book = await getContentById({
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

  const allBooks = await getBook(key);

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
        content: null,
      });

    await db.update(contents).set({
      content: data,
    });

    await client.sync();

    return ctx.json({
      message: "Content updated successfully.",
      content: book,
    });
  }

  return ctx.json({ message: "Not found", data });
});

app.post("/", async (ctx) => {
  const key = ctx.req.path.split("/")[4];
  const { clear, data } = await ctx.req.json();
  const currentBook = await getBook(key);
  const currentKey = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.key, key),
    with: {
      content: true,
    },
  });

  if (!currentBook || !currentKey) return ctx.json({ message: "Not found" });
  console.log(clear, data, "this is req");
  if (clear) {
    const [updated] = await db
      .update(contents)
      .set({
        content: data,
      })
      .where(eq(contents.id, currentKey.contentId))
      .returning();

    await client.sync();

    return ctx.json({
      content: updated.content,
      message: "Content updated successfully.",
    });
  }

  if (Array.isArray(currentBook)) {
    if (Array.isArray(data)) {
      currentBook.push(...data);
    } else {
      currentBook.push(data);
    }

    const [updated] = await db
      .update(contents)
      .set({ content: currentBook })
      .where(eq(contents.id, currentKey.contentId))
      .returning();

    await client.sync();

    return ctx.json({
      content: updated.content,
      message: "Content updated successfully.",
    });
  }

  return ctx.json({
    message: "Content fetched successfully.",
    content: [],
  });
});

export default app;
