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

	// 1. Patch default translation loading
	const targetI18n =
		"return self.$load_translation(JSON.stringify(require('./i18n/i18n.json')));";
	const replacementI18n = `return self.$load_translation(JSON.stringify(${i18nContent.trim()}));`;

	if (baseJsContent.includes(targetI18n)) {
		baseJsContent = baseJsContent.replace(targetI18n, replacementI18n);
	}

	// 2. Patch Table.$from_i18n
	const tableFromI18nTarget = `table = $$('I18n').$t(key, $hash2(["locale"], {"locale": locale}));
          return self.$new(table['$[]']("name"), table['$[]']("type"), table['$[]']("items"));`;
	const tableFromI18nReplacement = `table = $$('I18n').$t(key, $hash2(["locale"], {"locale": locale}));
          if (table == null || table === nil) {
            return self.$new("Unknown(" + key + ")", "1D6", []);
          }
          return self.$new(table['$[]']("name"), table['$[]']("type"), table['$[]']("items"));`;
	baseJsContent = baseJsContent.replace(
		tableFromI18nTarget,
		tableFromI18nReplacement,
	);

	// 3. Patch D66Table.$from_i18n
	const d66TableFromI18nTarget = `table = $$('I18n').$t(key, $hash2(["locale"], {"locale": locale}));
          sort_type = $$('D66SortType').$const_get(table['$[]']("d66_sort_type"));
          return self.$new(table['$[]']("name"), sort_type, table['$[]']("items"));`;
	const d66TableFromI18nReplacement = `table = $$('I18n').$t(key, $hash2(["locale"], {"locale": locale}));
          if (table == null || table === nil) {
            return self.$new("Unknown(" + key + ")", $$$($$('D66SortType'), 'ASC'), []);
          }
          sort_type = $$('D66SortType').$const_get(table['$[]']("d66_sort_type"));
          return self.$new(table['$[]']("name"), sort_type, table['$[]']("items"));`;
	baseJsContent = baseJsContent.replace(
		d66TableFromI18nTarget,
		d66TableFromI18nReplacement,
	);

	// 4. Patch recursive merge in $load_translation
	const mergeTarget = "return oldval.$merge(newval);}));";
	const mergeReplacement = `if (oldval.$merge) {
            return oldval.$merge(newval);
          } else {
            return newval;
          }
        }));`;
	baseJsContent = baseJsContent.replace(mergeTarget, mergeReplacement);

	// 5. Patch I18n.$translate to return an empty hash instead of nil
	const translateAnchor = "if ($truthy(($ret_or_1 = result))) {";
	const _translateReplacement = `if ($truthy(($ret_or_1 = result))) {
          return $ret_or_1
        } else {
          var def = options['$[]']("default");
          if (def === nil || def == null) {
            var h = $hash2([], {});
            h['$[]=']("name", "Unknown");
            h['$[]=']("type", "1D6");
            h['$[]=']("items", $hash2([], {}));
            h['$[]=']("d66_sort_type", "ASC");
            return h;
          }
          return def;
        };
        // `; // Add comment to swallow the old code if necessary

	if (baseJsContent.includes(translateAnchor)) {
		// This is tricky because we want to replace the whole block.
		// Let's use a simpler approach: replace the specific part we know.
		const oldPart = `if ($truthy(($ret_or_1 = result))) {
          return $ret_or_1
        } else {
          return options['$[]']("default")
        };`;
		const safeObjPart = `if ($truthy(($ret_or_1 = result))) {
          return $ret_or_1
        } else {
          var def = options['$[]']("default");
          if (def === nil || def == null) {
            return {
              "$[]": function() { return nil; },
              "$is_hash": true,
              "$nil?": function() { return true; },
              "$dig": function() { return nil; }
            };
          }
          return def;
        };`;
		const oldHPart = `if ($truthy(($ret_or_1 = result))) {
          return $ret_or_1
        } else {
          var def = options['$[]']("default");
          if (def === nil || def == null) {
            var h = $hash2([], {});
            h['$[]=']("name", "Unknown");
            h['$[]=']("type", "1D6");
            h['$[]=']("items", []);
            h['$[]=']("d66_sort_type", "ASC");
            return h;
          }
          return def;
        };`;

		const finalReplacement = `if ($truthy(($ret_or_1 = result))) {
          return $ret_or_1
        } else {
          var def = options['$[]']("default");
          if (def === nil || def == null) {
            var h = $hash2([], {});
            h['$[]=']("name", "Unknown");
            h['$[]=']("type", "1D6");
            h['$[]=']("items", $hash2([], {}));
            h['$[]=']("d66_sort_type", "ASC");
            return h;
          }
          return def;
        };`;

		if (baseJsContent.includes(oldHPart)) {
			baseJsContent = baseJsContent.replace(oldHPart, finalReplacement);
		} else if (baseJsContent.includes(safeObjPart)) {
			baseJsContent = baseJsContent.replace(safeObjPart, finalReplacement);
		} else if (baseJsContent.includes(oldPart)) {
			baseJsContent = baseJsContent.replace(oldPart, finalReplacement);
		}
	}

	writeFileSync(baseJsPath, baseJsContent);
	console.log("Successfully patched bcdice/lib/bcdice/base.js");
} catch (error) {
	console.error("Error patching bcdice:", error);
	process.exit(1);
}

// 6. Patch BeginningIdol.js specific crash
const beginningIdolPath = join(
	process.cwd(),
	"node_modules",
	"bcdice",
	"lib",
	"bcdice",
	"game_system",
	"BeginningIdol.js",
);

try {
	let content = readFileSync(beginningIdolPath, "utf-8");
	const target = "return items['$[]'](3).$push(skill_table);}));";
	const replacement =
		"var target = items['$[]'](3); if (target && target.$push) { return target.$push(skill_table); } else { return items; } }));";
	if (content.includes(target)) {
		content = content.replace(target, replacement);
		writeFileSync(beginningIdolPath, content);
		console.log("Successfully patched BeginningIdol.js");
	}
} catch (error) {
	console.error("Error patching BeginningIdol.js:", error);
}
