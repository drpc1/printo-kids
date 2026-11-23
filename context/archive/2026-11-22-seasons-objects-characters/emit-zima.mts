// Writes src/lib/symmetry/objects/zima.ts from the approved mockup (mockup-drawings.json) and moves the snowman there
// from boze-narodzenie.ts. Usage (repo root): node --experimental-strip-types context/changes/seasons-objects-characters/emit-zima.mts
import fs from "node:fs";

interface Variant {
  lines: string[];
}
interface Size {
  width: number;
  height: number;
  base: string[];
  parts: { id: string; variants: Variant[] }[];
}
interface MockObject {
  id: string;
  categories: string[];
  holeColor: string | null;
  sizes: Record<"half4" | "half6" | "half9", Size>;
}

const mock = JSON.parse(fs.readFileSync("context/changes/seasons-objects-characters/mockup-drawings.json", "utf8")) as {
  approved: boolean;
  objects: MockObject[];
};
if (!mock.approved) throw new Error("mockup not approved");

const SIZES = [
  ["half4", "4"],
  ["half6", "6"],
  ["half9", "9"],
] as const;

/** Only the rows with cells, and the top offset of the first one. */
function trimmed(lines: string[]): { rows: string[]; top: number } {
  const used = lines.map((line, row) => (/[^.]/.test(line) ? row : -1)).filter((row) => row >= 0);
  if (used.length === 0) return { rows: [], top: 0 };
  const top = used[0];
  return { rows: lines.slice(top, used[used.length - 1] + 1), top };
}

function drawingCall(lines: string[]): string {
  const { rows, top } = trimmed(lines);
  const list = `[${rows.map((row) => JSON.stringify(row)).join(", ")}]`;
  return top === 0 ? `drawing(${list})` : `drawing(${list}, ${top})`;
}

const constName = (object: MockObject, size: string): string =>
  `${object.id.toUpperCase().replace(/[^A-Z]/g, "_")}_${size}`;

const blocks: string[] = [];
for (const object of mock.objects) {
  for (const [key, size] of SIZES) {
    const spec = object.sizes[key];
    const parts = spec.parts
      .map(
        (part) =>
          `    {\n      id: ${JSON.stringify(part.id)},\n      variants: [\n${part.variants
            .map((variant) => `        ${drawingCall(variant.lines)},`)
            .join("\n")}\n      ],\n    },`,
      )
      .join("\n");
    blocks.push(
      `const ${constName(object, size)}: SymmetryTemplate = {\n  id: ${JSON.stringify(object.id)},\n  width: ${spec.width},\n  height: ${spec.height},\n  holeColor: ${JSON.stringify(object.holeColor)},\n  categories: ${JSON.stringify(object.categories)},\n  base: ${drawingCall(spec.base)},\n  parts: [\n${parts}\n  ],\n};`,
    );
  }
}

// Move the snowman (three templates) from the Christmas file.
const christmasPath = "src/lib/symmetry/objects/boze-narodzenie.ts";
let christmas = fs.readFileSync(christmasPath, "utf8");
const start = christmas.indexOf("const BALWANEK_4: SymmetryTemplate");
const end = christmas.indexOf("const ANIOLEK_4: SymmetryTemplate");
if (start < 0 || end < 0) throw new Error("snowman blocks not found");
const snowman = christmas.slice(start, end).trimEnd();
christmas = christmas.slice(0, start) + christmas.slice(end);
christmas = christmas.replace(/BALWANEK_(4|6|9), /g, "");
fs.writeFileSync(christmasPath, christmas);

const ids = [...mock.objects.map((object) => object.id), "balwanek"];
const listOf = (size: string): string =>
  ids.map((id) => `${id.toUpperCase().replace(/[^A-Z]/g, "_")}_${size}`).join(", ");

const header = `import { drawing, type SymmetryObjectSizes, type SymmetryTemplate } from "../template-format.ts";

// Zima. Drawn from the approved mockup (context/changes/seasons-objects-characters/mockup-drawings.json, approved
// 2026-11-23): the first variant of every part gives the mockup picture. Half sizes as in the other catalog files:
// 4 by 12 (4 lat), 6 by 15 (5 and 6 lat), 9 by 24 (7 lat). The snowman moved here from Boże Narodzenie; the penguin
// stays in zwierzeta.ts with both categories. The category has a date window (see OBJECT_CATEGORIES).
`;

const footer = `export const ZIMA: SymmetryObjectSizes = {
  half4: [${listOf("4")}],
  half6: [${listOf("6")}],
  half9: [${listOf("9")}],
};
`;

fs.writeFileSync("src/lib/symmetry/objects/zima.ts", `${header}\n${blocks.join("\n\n")}\n\n${snowman}\n\n${footer}`);
console.log("written zima.ts with", ids.length, "objects");
