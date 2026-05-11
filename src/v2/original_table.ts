import { zValidator } from "@hono/zod-validator";
import { UserDefinedDiceTable } from "bcdice";
import { Hono } from "hono";
import { postOriginalTableBodySchema } from "../types/postOriginalTableBody";

const app = new Hono();

// /v2/original_table
app.post("/", zValidator("json", postOriginalTableBodySchema), async (c) => {
	const { table: tableText } = c.req.valid("json");

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
