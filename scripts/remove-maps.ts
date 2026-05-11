/**
 * bcdiceのnode_modules配下のマップファイルを削除する
 */
import fs from "node:fs";
import path from "node:path";

// bcdiceのnode_modulesディレクトリのパス
const targetDir = path.resolve(process.cwd(), "node_modules/bcdice");

/**
 * マップファイルを再帰的に削除する
 * @param dir 削除対象のディレクトリパス
 */
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
