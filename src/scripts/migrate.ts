import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../db";

function main() {
  console.log("Starting migration...");
  migrate(db, {
    migrationsFolder: "./drizzle",
  })
    .then(() => {
      console.log("Migration complete");
    })
    .catch((err) => {
      console.log(err.message, "An error occurred during migration.");
    });
}

main();
