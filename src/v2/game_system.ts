import GameSystemList from "bcdice/lib/bcdice/game_system_list.json" with {
	type: "json",
};
import DynamicLoader from "bcdice/lib/loader/dynamic_loader.js";
import { type Context, Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	const systems = GameSystemList.gameSystems.map((sys) => ({
		id: sys.id,
		name: sys.name,
		sort_key: sys.sortKey,
	}));

	return c.json({ game_system: systems });
});

app.get("/:id", async (c) => {
	const id = c.req.param("id") || "";
	const loader = new DynamicLoader();
	const System = await loader.dynamicLoad(id).catch(() => null);

	if (!System) {
		c.status(400);
		return c.json({ ok: false, reason: "unsupported game system" });
	}

	return c.json({
		ok: true,
		id: System.ID,
		name: System.NAME,
		sort_key: System.SORT_KEY,
		command_pattern: System.COMMAND_PATTERN.source,
		help_message: System.HELP_MESSAGE,
	});
});

const rollHandler = async (c: Context) => {
	const id = c.req.param("id") || "";
	let command = "";

	if (c.req.method === "GET") {
		command = c.req.query("command") || "";
	} else if (c.req.method === "POST") {
		const body = (await c.req.parseBody().catch(() => ({}))) as Record<
			string,
			string
		>;
		command = typeof body.command === "string" ? body.command : "";
	}

	const loader = new DynamicLoader();
	const System = await loader.dynamicLoad(id).catch(() => null);

	if (!System) {
		c.status(400);
		return c.json({ ok: false, reason: "unsupported game system" });
	}

	const result = System.eval(command);

	if (!result) {
		c.status(400);
		return c.json({ ok: false, reason: "unsupported command" });
	}

	return c.json({
		ok: true,
		text: result.text,
		secret: result.secret,
		success: result.success,
		failure: result.failure,
		critical: result.critical,
		fumble: result.fumble,
		rands: result.detailedRands.map((r) => ({
			kind: r.kind,
			sides: r.sides,
			value: r.value,
		})),
	});
};

app.get("/:id/roll", rollHandler);
app.post("/:id/roll", rollHandler);

export default app;
