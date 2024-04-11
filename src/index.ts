import { Hono } from "hono";
import booksRoutes from "./routes/books";
import { cors } from "hono/cors";

const app = new Hono();

app.get("/", (ctx) => {
  return ctx.text("Hello Hono!");
});

app.use(cors());
app.route("api/v1/books/*", booksRoutes);

export default app;
