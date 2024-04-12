import { Hono } from "hono";
import { user } from "../../utils/api/user/config";

const app = new Hono();

app.get("/:id", async (ctx) => {
  const { id } = ctx.req.param();

  const { user: newUser } = await user(id).createDatabase();

  console.log(newUser, "this is the user id");

  return ctx.json({ newUser });
});

export default app;
