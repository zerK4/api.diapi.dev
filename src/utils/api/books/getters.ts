import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { apiKeys, contents } from "../../../db/schema";

export async function getContentById({
  bookId,
  apiKey,
}: {
  bookId: string;
  apiKey: string;
}) {
  try {
    const books = await getBook(apiKey);

    if (Array.isArray(books)) {
      return books.find((book) => book.id === bookId) || null;
    }

    return null;
  } catch (err) {
    console.log(err);

    throw err;
  }
}

export async function getBook(apiKey: string) {
  try {
    const keyContent = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        content: true,
      },
    });

    if (!keyContent) return null;

    const books = await db.query.contents.findFirst({
      where: eq(contents.id, keyContent.contentId),
      with: {
        user: true,
        apiKeys: true,
      },
    });

    if (!books) return null;

    return books.content;
  } catch (error) {
    console.log(error);

    return error;
  }
}
