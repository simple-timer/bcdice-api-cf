import { Hono } from "hono";
import v2 from "./v2/v2";

const app = new Hono();

app.route("/v2", v2);

app.get("/", (c) => {
	return c.text(`BCDice API is running`);
});

export default app;
