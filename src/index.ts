import { Hono } from "hono";
import booksRoutes from "./routes/books";
import { cors } from "hono/cors";
import syncRoute from "./routes/config/sync";
import { bearerAuth } from "hono/bearer-auth";
import { rateLimiter } from "hono-rate-limiter";
import typesRoutes from "./routes/config/types";

const app = new Hono();

const token = process.env.SYNC_TOKEN!;

const limiter = rateLimiter({
  windowMs: 2 * 60 * 1000, // 10 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  // keyGenerator: (c) => "v4()", // Method to generate custom identifiers for clients.
  // store: ... , // Redis, MemoryStore, etc. See below.
});

app.use(limiter);
app.use("/api/v1/config/sync", bearerAuth({ token }));

app.get("/", async (ctx) => {
  console.log(ctx.req, "asd");
  return ctx.text("Hello Hono!");
});

app.get("/:id", async (ctx) => {
  // const { id } = ctx.req.param();)

  // const db = await user(id).getUserDb(id);

  return ctx.text("Hello Hono!");
});

app.use(cors());
app.route("api/v1/books/*", booksRoutes);
// app.route("/api/v1/auth/register", registerRoutes);
app.route("/api/v1/config/sync", syncRoute);
app.route("/api/v1/config/types", typesRoutes);

export default app;
