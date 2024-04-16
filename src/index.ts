import { Hono } from "hono";
import booksRoutes from "./routes/books";
import { cors } from "hono/cors";
import registerRoutes from "./routes/auth/register";
import syncRoute from "./routes/config/sync";
import { user } from "./utils/api/user/config";

const app = new Hono();

app.get("/:id", async (ctx) => {
  // const { id } = ctx.req.param();

  // const db = await user(id).getUserDb(id);

  return ctx.text("Hello Hono!");
});

app.use(cors());
app.route("api/v1/books/*", booksRoutes);
// app.route("/api/v1/auth/register", registerRoutes);
app.route("/api/v1/config/sync", syncRoute);

export default app;
