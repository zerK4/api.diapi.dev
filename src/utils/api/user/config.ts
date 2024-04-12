import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { turso } from "../../turso/init";

export class User {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async buildDatabase() {
    try {
      const newDb = await turso.databases.create(
        "user-" + this.userId.split("-")[0]
      );
      const newToken = await turso.databases.createToken(newDb.name);

      return {
        name: newDb.name,
        token: newToken,
      };
    } catch (err) {
      console.log(err);

      throw err;
    }
  }
  async createDatabase() {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, this.userId),
      });

      console.log(user, "this is the user");

      if (!user) return { user: null };

      if (!user.databaseName) {
        const { name, token } = await this.buildDatabase();
        await db
          .update(users)
          .set({
            databaseName: name,
            databaseToken: token.jwt,
          })
          .where(eq(users.id, this.userId));
      }

      return { user };
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  async getUserDb(userId: string) {
    try {
      const db = await turso.databases.get("user-" + userId.split("-")[0]);
      const token = await turso.groups.list();

      console.log(token, "this is the db");
      return db;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}

export const user = (userId: string) => new User(userId);
