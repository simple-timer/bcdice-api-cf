import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const i18nDir = join(
	process.cwd(),
	"node_modules",
	"bcdice",
	"lib",
	"bcdice",
	"i18n",
);
const outputPath = join(process.cwd(), "src", "generated", "i18n_loader.ts");

try {
	const files = readdirSync(i18nDir).filter(
		(f) => f.endsWith(".json") && f !== "i18n.json",
	);

	let content = 'import { I18n } from "bcdice/lib/internal";\n';

	// Import statements
	files.forEach((file, index) => {
		const varName = `i18n_${index}`;
		content += `import ${varName} from "bcdice/lib/bcdice/i18n/${file}";\n`;
	});

	content +=
		"\n/**\n * Cloudflare Workers 向けに全翻訳データを静的にロードする。\n * このファイルは自動生成されています。\n */\n";
	content += "export function loadAllI18n() {\n";
	files.forEach((_file, index) => {
		const varName = `i18n_${index}`;
		content += `\tI18n.$load_translation(JSON.stringify(${varName}));\n`;
	});
	content += "}\n";

	writeFileSync(outputPath, content);
	console.log(
		`Successfully generated ${outputPath} with ${files.length} translations.`,
	);
} catch (error) {
	console.error("Error generating i18n loader:", error);
	process.exit(1);
}
