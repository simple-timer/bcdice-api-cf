import { Version as BCDiceVersion } from "bcdice";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.json({
		api: "2.0.0",
		bcdice: BCDiceVersion,
	});
});

export default app;
