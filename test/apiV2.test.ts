import { describe, expect, it } from "bun:test";
import app from "../src";

describe("V2 API Test", () => {
	it("test_version", async () => {
		const res = await app.request("/v2/version");
		expect(res.status).toBe(200);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
		const json = await res.json();
		expect(json).toHaveProperty("bcdice");
		expect(json).toHaveProperty("api");
	});

	it("test_game_system_list", async () => {
		const res = await app.request("/v2/game_system");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.game_system.length).toBeGreaterThan(0);
		expect(Array.isArray(json.game_system)).toBe(true);

		const first = json.game_system[0];
		expect(first).toHaveProperty("name");
		expect(first).toHaveProperty("id");
		expect(first).toHaveProperty("sort_key");
	});

	it("test_game_system_info", async () => {
		const res = await app.request("/v2/game_system/DiceBot");
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.id).toBe("DiceBot");
		expect(typeof json.name).toBe("string");
		expect(typeof json.command_pattern).toBe("string");
		expect(typeof json.sort_key).toBe("string");
		expect(typeof json.help_message).toBe("string");

		expect(json.name.length).toBeGreaterThan(0);
		expect(json.command_pattern.length).toBeGreaterThan(0);
		expect(json.sort_key.length).toBeGreaterThan(0);
		expect(json.help_message.length).toBeGreaterThan(0);
	});

	it("test_diceroll", async () => {
		const res = await app.request(
			"/v2/game_system/DiceBot/roll?command=1d100<=70",
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.text).toBeDefined();
		expect(json.secret).toBe(false);
		expect(typeof json.success).toBe("boolean");
		expect(typeof json.failure).toBe("boolean");
		expect(json.critical).toBe(false);
		expect(json.fumble).toBe(false);
		expect(Array.isArray(json.rands)).toBe(true);
	});

	it("test_diceroll_with_post", async () => {
		const res = await app.request("/v2/game_system/DiceBot/roll", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ command: "1d100<=70" }),
		});
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(json.text).toBeDefined();
		expect(json.secret).toBe(false);
		expect(typeof json.success).toBe("boolean");
		expect(typeof json.failure).toBe("boolean");
		expect(json.critical).toBe(false);
		expect(json.fumble).toBe(false);
		expect(Array.isArray(json.rands)).toBe(true);
	});

	it("test_detailed", async () => {
		const res = await app.request(
			"/v2/game_system/Cthulhu7th/roll?command=CC1",
		);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		const tens_d10 = json.rands.filter(
			(r: { kind: string }) => r.kind === "tens_d10",
		);
		expect(tens_d10.length).toBeGreaterThan(0);
	});

	it("test_unexpected_game_system", async () => {
		const res = await app.request(
			"/v2/game_system/Hoge/roll?command=1d100<=70",
		);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(json.reason).toBe("unsupported game system");
	});

	it("test_unexpected_command", async () => {
		const res = await app.request("/v2/game_system/DiceBot/roll?command=a");
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(json.reason).toBe("unsupported command");
	});

	it("test_no_command", async () => {
		const res = await app.request("/v2/game_system/DiceBot/roll");
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(json.reason).toBe("unsupported command");
	});

	it("test_blank_command", async () => {
		const res = await app.request("/v2/game_system/DiceBot/roll?command=");
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(json.reason).toBe("unsupported command");
	});

	it("test_original_table", async () => {
		const table_text = `飲み物表
1D6
1:水
2:緑茶
3:麦茶
4:コーラ
5:オレンジジュース
6:選ばれし者の知的飲料`;
		const res = await app.request("/v2/original_table", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ table: table_text }),
		});
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.ok).toBe(true);
		expect(typeof json.text).toBe("string");
		expect(json.text.startsWith("飲み物表(")).toBe(true);
		expect(Array.isArray(json.rands)).toBe(true);
	});
});
