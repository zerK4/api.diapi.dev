import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { ContentType, apiKeys, contents } from "../../../db/schema";
import { registerReads } from "../db/register";

export async function getContentById({
  bookId,
  apiKey,
}: {
  bookId: string;
  apiKey: string;
}) {
  try {
    const books = await getBook(apiKey);

    if (Array.isArray(books.content)) {
      return books.content?.find((book) => book.id === bookId) || null;
    }

    return null;
  } catch (err) {
    console.log(err);

    throw err;
  }
}

export async function getBook(apiKey: string): Promise<{
  content: ContentType[] | null;
  contentId: string | null;
  err?: any;
}> {
  try {
    const keyContent = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey),
      with: {
        content: true,
      },
    });

    if (!keyContent)
      return {
        content: null,
        contentId: null,
      };

    registerReads(keyContent?.content.id);

    const books = await db.query.contents.findFirst({
      where: eq(contents.id, keyContent.contentId),
      with: {
        user: true,
        apiKeys: true,
      },
    });

    if (!books)
      return {
        content: null,
        contentId: null,
      };

    return {
      content: books.content as ContentType[],
      contentId: books.id,
    };
  } catch (error) {
    console.log(error);

    return {
      content: null,
      contentId: null,
      err: error,
    };
  }
}
