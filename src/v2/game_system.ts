import "bcdice/lib/bcdice/base";
const { loadAllI18n } = require("../generated/i18n_loader");
loadAllI18n();

console.log("[BCDice] Initializing game systems...");

import { zValidator } from "@hono/zod-validator";
import { DynamicLoader } from "bcdice";

require("bcdice/lib/bcdice/game_system/index.js");

import GameSystemList from "bcdice/lib/bcdice/game_system_list.json" with {
	type: "json",
};
import type GameSystemClass from "bcdice/lib/game_system";
import { BCDice } from "bcdice/lib/internal";
import type { BaseClass } from "bcdice/lib/internal/types/base";
import { getGameSystemClass } from "bcdice/lib/loader/loader";
import { type Context, Hono } from "hono";
import { getGameSystemParamsSchema } from "../types/getGameSystemParams";
import { getGameSystemRollParamsSchema } from "../types/getGameSystemRollParams";
import { getGameSystemRollQuerySchema } from "../types/getGameSystemRollQuery";
import { postGameSystemRollBodySchema } from "../types/postGameSystemRollBody";
import { postGameSystemRollParamsSchema } from "../types/postGameSystemRollParams";

class CloudflareFullLoader extends DynamicLoader {
	override async dynamicImport(_className: string): Promise<void> {
		// すべて静的にインポート済みのため、何もしない
		return;
	}

	override async dynamicLoad(id: string): Promise<GameSystemClass> {
		const info = this.getGameSystemInfo(id);
		const className = info.className || id;
		const gameSystemClass = BCDice.GameSystem.$const_get<BaseClass>(className);
		if (!gameSystemClass) {
			throw new Error("Failed to load game system");
		}
		return getGameSystemClass(gameSystemClass);
	}
}

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
	const loader = new CloudflareFullLoader();
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
	if (!command) {
		c.status(400);
		return c.json({ ok: false, reason: "unsupported command" });
	}

	const loader = new CloudflareFullLoader();
	const System = await loader.dynamicLoad(id).catch((_e) => {
		// 全システムをバンドルしているため、基本的にはここには到達しません
		return null;
	});

	if (!System) {
		c.status(400);
		return c.json({ ok: false, reason: "unsupported game system" });
	}

	const gameSystem = new System(command);

	if (process.env.NODE_ENV === "development") {
		const testRandsHeader = c.req.header("X-Test-Rands");
		if (testRandsHeader) {
			try {
				const testRands: [number, number][] = JSON.parse(testRandsHeader);
				let randIndex = 0;
				gameSystem.randomizer.$random = (_sides: number) => {
					const r = testRands[randIndex++];
					return r ? r[0] : 0;
				};
			} catch (_e) {
				// Ignore
			}
		}
	}

	const result = gameSystem.eval();

	if (!result) {
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
		rands: result.detailedRands.map(
			(r: { kind: string; sides: number; value: number }) => ({
				kind: r.kind,
				sides: r.sides,
				value: r.value,
			}),
		),
	});
};

app.get(
	"/:id/roll",
	zValidator("param", getGameSystemRollParamsSchema),
	zValidator("query", getGameSystemRollQuerySchema, (result, c) => {
		if (!result.success) {
			c.status(400);
			return c.json({ ok: false, reason: "unsupported command" });
		}
	}),
	async (c) => {
		const { id } = c.req.valid("param");
		const { command } = c.req.valid("query");
		return executeRoll(c, id, command);
	},
);

app.post(
	"/:id/roll",
	zValidator("param", postGameSystemRollParamsSchema),
	zValidator("json", postGameSystemRollBodySchema, (result, c) => {
		if (!result.success) {
			c.status(400);
			return c.json({ ok: false, reason: "unsupported command" });
		}
	}),
	async (c) => {
		const { id } = c.req.valid("param");
		const { command } = c.req.valid("json");
		return executeRoll(c, id, command);
	},
);

export default app;
