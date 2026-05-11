import { Hono } from "hono";
import { env } from "hono/adapter";

const app = new Hono();

// /v2/admin
app.get("/", (c) => {
	// 環境変数から取得
	const { ADMIN_NAME, ADMIN_URL, ADMIN_EMAIL } = env<{
		ADMIN_NAME: string;
		ADMIN_URL: string;
		ADMIN_EMAIL: string;
	}>(c);

	return c.json({
		name: ADMIN_NAME,
		url: ADMIN_URL,
		email: ADMIN_EMAIL,
	});
});

export default app;
