import { createClient } from "@tursodatabase/api";

export const turso = createClient({
  org: process.env.ORG_NAME!,
  token: process.env.TURSO_TOKEN_API!,
});
