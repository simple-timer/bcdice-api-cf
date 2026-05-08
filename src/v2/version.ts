import { Version as BCDiceVersion } from "bcdice";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.json({
		api: "cf-3.0.0",
		bcdice: BCDiceVersion,
	});
});

export default app;
