import { Hono } from "hono";
import { cors } from "hono/cors";
import v2 from "./v2/v2";

const app = new Hono();

app.use("*", cors());

app.route("/v2", v2);

app.get("/", (c) => {
	return c.text(`BCDice API is running`);
});

app.notFound((c) => {
	return c.json({ ok: false, reason: "not found" }, 404);
});

export default app;
