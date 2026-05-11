import { Hono } from "hono";
import admin from "./admin";
import gameSystem from "./game_system";
import originalTable from "./original_table";
import version from "./version";

const app = new Hono();

// /v2/version
app.route("/version", version);
// /v2/game_system
app.route("/game_system", gameSystem);
// /v2/original_table
app.route("/original_table", originalTable);
// /v2/admin
app.route("/admin", admin);

export default app;
