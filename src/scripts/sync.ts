import { client } from "../db";

async function main() {
  console.log("Starting sync...");
  await client
    .sync()
    .then(() => {
      console.log("Sync complete");
    })
    .catch((err) => {
      console.log(err, "An error occurred during sync.");
    });
}

main();
