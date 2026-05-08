import { zValidator } from "@hono/zod-validator";
import GameSystemList from "bcdice/lib/bcdice/game_system_list.json" with {
	type: "json",
};
import DynamicLoader from "bcdice/lib/loader/dynamic_loader.js";
import { type Context, Hono } from "hono";
import { getGameSystemParamsSchema } from "../types/getGameSystemParams";
import { getGameSystemRollParamsSchema } from "../types/getGameSystemRollParams";
import { getGameSystemRollQuerySchema } from "../types/getGameSystemRollQuery";
import { postGameSystemRollBodySchema } from "../types/postGameSystemRollBody";
import { postGameSystemRollParamsSchema } from "../types/postGameSystemRollParams";

const app = new Hono();

app.get("/", (c) => {
	const systems = GameSystemList.gameSystems.map((sys) => ({
		id: sys.id,
		name: sys.name,
		sort_key: sys.sortKey,
	}));

	return c.json({ game_system: systems });
});

app.get("/:id", zValidator("param", getGameSystemParamsSchema), async (c) => {
	const { id } = c.req.valid("param");
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

const executeRoll = async (c: Context, id: string, command: string) => {
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

app.get(
	"/:id/roll",
	zValidator("param", getGameSystemRollParamsSchema),
	zValidator("query", getGameSystemRollQuerySchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const { command } = c.req.valid("query");
		return executeRoll(c, id, command);
	},
);

app.post(
	"/:id/roll",
	zValidator("param", postGameSystemRollParamsSchema),
	zValidator("json", postGameSystemRollBodySchema),
	async (c) => {
		const { id } = c.req.valid("param");
		const { command } = c.req.valid("json");
		return executeRoll(c, id, command);
	},
);

export default app;
