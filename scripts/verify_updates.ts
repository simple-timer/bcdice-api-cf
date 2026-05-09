const servers = [
	"http://127.0.0.1:8787",
	"https://bcdice.onlinesession.app",
	"https://bcdice.kazagakure.net",
	"https://bcdice.aimsot.net",
];

async function runCheck() {
	console.log("# BCDice API Verification Report\n");
	console.log(
		"| Server | Version (API / BCDice) | Systems | 2D6 Roll Result | Status | Error |",
	);
	console.log("| :--- | :--- | :--- | :--- | :--- | :--- |");

	for (const server of servers) {
		try {
			const vRes = await fetch(`${server}/v2/version`);
			const vData = await vRes.json();

			const sRes = await fetch(`${server}/v2/game_system`);
			const sData = await sRes.json();

			const rRes = await fetch(
				`${server}/v2/game_system/DiceBot/roll?command=2d6`,
			);
			const rData = await rRes.json();

			const rStatus = rRes.ok ? `✅ ${rRes.status}` : `❌ ${rRes.status}`;
			console.log(
				`| ${server.replace("https://", "")} | ${vData.api} / ${vData.bcdice} | ${sData.game_system.length} | ${rData.text || "ERROR"} | ${rStatus} | - |`,
			);
		} catch (e) {
			let errorMsg = `${e}`;
			if (
				server.includes("127.0.0.1") &&
				(errorMsg.includes("Unable to connect") ||
					errorMsg.includes("fetch failed"))
			) {
				errorMsg += " (Please run 'bun run dev')";
			}
			console.log(
				`| ${server.replace("https://", "")} | ERROR | - | - | ❌ FAIL | ${errorMsg} |`,
			);
		}
	}
}

runCheck();
