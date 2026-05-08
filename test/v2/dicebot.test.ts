process.env.NODE_ENV = "development";

import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import app from "../../src/index";

const dataDir = path.join(process.cwd(), "bcdice", "test", "data");

let tomlFiles: string[] = [];
try {
	tomlFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith(".toml"));
} catch (_e) {
	console.error("Could not read bcdice/test/data directory.");
}

type TomlData = {
	test: {
		game_system: string;
		input: string;
		output?: string;
		secret?: boolean;
		success?: boolean;
		failure?: boolean;
		critical?: boolean;
		fumble?: boolean;
		rands: { sides: number; value: number }[];
	}[];
};

type JsonResponse = {
	ok: boolean;
	text?: string;
	secret?: boolean;
	success?: boolean;
	failure?: boolean;
	critical?: boolean;
	fumble?: boolean;
	reason?: string;
};

describe("V2 Dicebot Tests", () => {
	for (const filename of tomlFiles) {
		const filePath = path.join(dataDir, filename);
		const content = fs.readFileSync(filePath, "utf8");

		// biome-ignore lint/suspicious/noExplicitAny: Bun.TOML is any
		const data = (Bun as any).TOML.parse(content) as TomlData;
		if (!data.test) continue;

		for (let i = 0; i < data.test.length; i++) {
			const testCase = data.test[i];
			const testName = `${filename}:${i + 1}:${testCase.input}`;

			it(`test_diceroll: ${testName}`, async () => {
				const rands = testCase.rands.map((r) => [r.value, r.sides]);

				const res = await app.request(
					`/v2/game_system/${testCase.game_system}/roll?command=${encodeURIComponent(
						testCase.input,
					)}`,
					{
						headers: {
							"X-Test-Rands": JSON.stringify(rands),
						},
					},
				);

				const json = (await res.json()) as JsonResponse;
				const expectedOutput =
					testCase.output === "" ? undefined : testCase.output;

				expect(json.text).toBe(expectedOutput);

				if (expectedOutput === undefined) {
					return;
				}

				expect(json.secret).toBe(testCase.secret ?? false);
				expect(json.success).toBe(testCase.success ?? false);
				expect(json.failure).toBe(testCase.failure ?? false);
				expect(json.critical).toBe(testCase.critical ?? false);
				expect(json.fumble).toBe(testCase.fumble ?? false);
			});
		}
	}
});
