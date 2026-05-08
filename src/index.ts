import { Version } from "bcdice";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.text(`BCDice Version: ${Version}`);
});

export default app;
