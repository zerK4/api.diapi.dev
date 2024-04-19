import { Hono } from "hono";
import booksRoutes from "./routes/books";
import { cors } from "hono/cors";
import syncRoute from "./routes/config/sync";
import { bearerAuth } from "hono/bearer-auth";

const app = new Hono();

const token = process.env.SYNC_TOKEN!;

app.use("/api/v1/config/*", bearerAuth({ token }));

app.get("/:id", async (ctx) => {
  // const { id } = ctx.req.param();)

  // const db = await user(id).getUserDb(id);

  return ctx.text("Hello Hono!");
});

app.use(cors());
app.route("api/v1/books/*", booksRoutes);
// app.route("/api/v1/auth/register", registerRoutes);
app.route("/api/v1/config/sync", syncRoute);

export default app;
