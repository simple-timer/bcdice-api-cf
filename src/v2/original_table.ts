import UserDefinedDiceTable from "bcdice/lib/user_defined_dice_table.js";
import { Hono } from "hono";

const app = new Hono();

app.post("/", async (c) => {
	const body = (await c.req.parseBody().catch(() => ({}))) as Record<
		string,
		string
	>;
	const tableText = typeof body.table === "string" ? body.table : "";

	try {
		const table = new UserDefinedDiceTable(tableText);
		const result = table.roll();

		if (!result) {
			c.status(400);
			return c.json({ ok: false, reason: "invalid table" });
		}

		return c.json({
			ok: true,
			text: result.text,
			rands: result.detailedRands.map((r) => ({
				kind: r.kind,
				sides: r.sides,
				value: r.value,
			})),
		});
	} catch (_e) {
		c.status(400);
		return c.json({ ok: false, reason: "invalid table" });
	}
});

export default app;
