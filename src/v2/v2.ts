import { Hono } from "hono";
import admin from "./admin";
import gameSystem from "./game_system";
import originalTable from "./original_table";
import version from "./version";

const app = new Hono();

app.route("/version", version);
app.route("/game_system", gameSystem);
app.route("/original_table", originalTable);
app.route("/admin", admin);

export default app;
