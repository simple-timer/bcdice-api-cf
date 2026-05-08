import fs from "node:fs";
import path from "node:path";

const targetDir = path.resolve(process.cwd(), "node_modules/bcdice");

function removeMapFiles(dir: string) {
	if (!fs.existsSync(dir)) {
		return;
	}

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			removeMapFiles(fullPath);
		} else if (entry.isFile() && entry.name.endsWith(".map")) {
			try {
				fs.unlinkSync(fullPath);
			} catch (err) {
				// 削除に失敗しても後続の処理を継続する
				console.error(`Failed to delete ${fullPath}:`, err);
			}
		}
	}
}

try {
	removeMapFiles(targetDir);
} catch (err) {
	console.error("Error while removing .map files:", err);
}
