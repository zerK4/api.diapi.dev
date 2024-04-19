import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { contents } from "../../../db/schema";

export async function registerReads(id: string) {
  try {
    const book = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });

    if (!book) return null;

    await db
      .update(contents)
      .set({
        reads: book.reads! + 1,
      })
      .where(eq(contents.id, id));

    return "updated";
  } catch (err) {
    console.log(err);

    throw err;
  }
}

export async function registerWrites(id: string) {
  try {
    const book = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });

    if (!book) return null;

    await db
      .update(contents)
      .set({
        writes: book.writes! + 1,
      })
      .where(eq(contents.id, id));

    return "updated";
  } catch (err) {
    console.log(err);

    throw err;
  }
}
