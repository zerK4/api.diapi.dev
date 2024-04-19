import { Hono } from "hono";
import { client, db } from "../db";
import { ContentType, apiKeys, contents } from "../db/schema";
import { getBook, getContentById } from "../utils/api/books/getters";
import { eq } from "drizzle-orm";
import { registerWrites } from "../utils/api/db/register";

const app = new Hono();

app.get("/all", async (ctx) => {
  const { key: searchKey, value } = ctx.req.query();
  const key = ctx.req.path.split("/")[4];

  const { content } = await getBook(key);

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
        if (
          String(item[searchKey as keyof typeof item]).toLowerCase() !==
          value.toLowerCase()
        )
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

  const { content, contentId } = await getBook(key);

  if (!content || !contentId) return ctx.json({ message: "Not found" });

  registerWrites(contentId);

  if (Array.isArray(content)) {
    const book = content.find((book) => book.id === id);
    content[searchKey] = value;
    data = content.map((x) => {
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
  const { content, contentId } = await getBook(key);
  const currentKey = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.key, key),
    with: {
      content: true,
    },
  });

  if (!content || !contentId || !currentKey)
    return ctx.json({ message: "Not found" });

  registerWrites(contentId);

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

  if (Array.isArray(content)) {
    if (Array.isArray(data)) {
      content.push(...data);
    } else {
      content.push(data);
    }

    const [updated] = await db
      .update(contents)
      .set({ content: content })
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

app.delete("/:id", async (ctx) => {
  try {
    const { id } = ctx.req.param();
    const key = ctx.req.path.split("/")[4];

    if (!id) return ctx.json({ message: "Invalid data" });

    const { content, contentId } = await getBook(key);

    if (!content || !contentId) return ctx.json({ message: "Not found" });

    registerWrites(contentId);

    if (Array.isArray(content)) {
      const data = content.filter((item) => item.id !== id);

      await db
        .update(contents)
        .set({ content: data })
        .where(eq(contents.id, contentId))
        .returning();
    }

    return ctx.json({ message: "Content deleted successfully." });
  } catch (err) {
    console.log(err);

    throw err;
  }
});

export default app;
