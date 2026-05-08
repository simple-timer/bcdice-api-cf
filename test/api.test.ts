import { describe, expect, it } from "bun:test";
import app from "../src/index";

describe("API Test", () => {
	it("test_ping", async () => {
		const res = await app.request("/");
		expect(res.status).toBe(200);
		const body = await res.text();
		expect(body).not.toBeEmpty();
	});

	it("test_not_found", async () => {
		const res = await app.request("/hogehoge");
		expect(res.status).toBe(404);
		const json = await res.json();
		expect(json.ok).toBe(false);
		expect(json.reason).toBe("not found");
	});
});
