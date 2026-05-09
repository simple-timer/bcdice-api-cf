import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const PORT = 8787;
const BASE_URL = `http://localhost:${PORT}`;
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

describe("V2 Dicebot HTTP Tests", () => {
	let serverProcess: any;

	beforeAll(async () => {
		console.log("Starting server for HTTP tests...");
		serverProcess = Bun.spawn(["bun", "run", "dev"], {
			env: { ...process.env, NODE_ENV: "development" },
			stdout: "inherit",
			stderr: "inherit",
		});

		// Wait for server to be ready
		let ready = false;
		for (let i = 0; i < 30; i++) {
			try {
				const res = await fetch(`${BASE_URL}/`);
				if (res.ok) {
					ready = true;
					break;
				}
			} catch (_e) {
				// Ignore
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		if (!ready) {
			serverProcess.kill();
			throw new Error("Server failed to start within 30 seconds");
		}
		console.log("Server is ready.");
	}, 40000);

	afterAll(() => {
		if (serverProcess) {
			console.log("Stopping server...");
			serverProcess.kill();
		}
	});

	for (const filename of tomlFiles) {
		const filePath = path.join(dataDir, filename);
		const content = fs.readFileSync(filePath, "utf8");

		let data: TomlData;
		try {
			// biome-ignore lint/suspicious/noExplicitAny: Bun.TOML is any
			data = (Bun as any).TOML.parse(content) as TomlData;
		} catch (e) {
			describe.skip(`fail_parse: ${filename}`, () => {
				it("should parse", () => {
					throw e;
				});
			});
			continue;
		}
		if (!data.test) continue;

		describe(`File: ${filename}`, () => {
			for (let i = 0; i < data.test.length; i++) {
				const testCase = data.test[i];
				const testName = `${i + 1}:${testCase.input}`;

				it(`test_diceroll: ${testName}`, async () => {
					const rands = testCase.rands.map((r) => [r.value, r.sides]);

					const url = `${BASE_URL}/v2/game_system/${testCase.game_system}/roll?command=${encodeURIComponent(
						testCase.input,
					)}`;

					const res = await fetch(url, {
						headers: {
							"X-Test-Rands": JSON.stringify(rands),
						},
					});

					if (!res.ok) {
						const errorJson = await res.json().catch(() => ({}));
						throw new Error(
							`HTTP error! status: ${res.status}, body: ${JSON.stringify(errorJson)}`,
						);
					}

					const json = (await res.json()) as JsonResponse;
					const expectedOutput =
						testCase.output === "" ? undefined : testCase.output;

					const actual = (json.text ?? "")
						.trim()
						.replace(/\r\n/g, "\n")
						.replace(/\f/g, "\t")
						.replace(/％/g, "%");
					const expected = (expectedOutput ?? "")
						.trim()
						.replace(/\r\n/g, "\n")
						.replace(/\f/g, "\t")
						.replace(/％/g, "%");

					expect(actual).toBe(expected);

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
		});
	}
});
