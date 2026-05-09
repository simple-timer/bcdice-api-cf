import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const baseJsPath = join(
	process.cwd(),
	"node_modules",
	"bcdice",
	"lib",
	"bcdice",
	"base.js",
);
const i18nJsonPath = join(
	process.cwd(),
	"node_modules",
	"bcdice",
	"lib",
	"bcdice",
	"i18n",
	"i18n.json",
);

try {
	const i18nContent = readFileSync(i18nJsonPath, "utf-8");
	let baseJsContent = readFileSync(baseJsPath, "utf-8");

	const target =
		"return self.$load_translation(JSON.stringify(require('./i18n/i18n.json')));";
	const replacement = `return self.$load_translation(JSON.stringify(${i18nContent.trim()}));`;

	if (baseJsContent.includes(target)) {
		baseJsContent = baseJsContent.replace(target, replacement);
		writeFileSync(baseJsPath, baseJsContent);
		console.log("Successfully patched bcdice/lib/bcdice/base.js");
	} else if (baseJsContent.includes(replacement)) {
		console.log("bcdice/lib/bcdice/base.js is already patched");
	} else {
		console.error("Target string not found in bcdice/lib/bcdice/base.js");
		process.exit(1);
	}
} catch (error) {
	console.error("Error patching bcdice:", error);
	process.exit(1);
}
