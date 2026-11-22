// Renders the S-38 mockup (mockup-drawings.json) to PNG previews for approval: every part combination of every new
// object, in colors (holes in the template's hole color, white when it has none) and in black (holes white, as the
// nonogram and the black "Skopiuj obrazek" card show it), plus every dictation shape at every drawn level, plain and
// mirrored. Usage (from the repo root): node --experimental-strip-types context/changes/seasons-objects-characters/render-preview.mts [mockup.json]
// Writes preview-4x12.png, preview-6x15.png, preview-9x24.png and preview-shapes.png next to the mockup.
// Moved from context/archive/2026-10-30-gh124-more-symetric-shapes/render-preview.mts; now writes PNG through Playwright.
import fs from "node:fs";
import nodePath from "node:path";
import { chromium } from "@playwright/test";
import { drawing } from "../../../src/lib/symmetry/template-format.ts";
import type { SymmetryCell } from "../../../src/lib/symmetry/template-format.ts";

type SizeKey = "half4" | "half6" | "half9";
const FILL: Record<string, string> = {
  red: "#d33",
  green: "#3a3",
  yellow: "#eb3",
  blue: "#36c",
  orange: "#e83",
  gray: "#999",
  black: "#222",
  brown: "#843",
};
const UNIT: Record<SizeKey, number> = { half4: 14, half6: 11, half9: 7 };
const TITLE: Record<SizeKey, string> = {
  half4: "4×12 (symetria Poziom 1, nonogram łatwy, dyktando łatwy, „Skopiuj obrazek” łatwy)",
  half6: "6×15 (symetria Poziomy 2–3, nonogram średni, dyktando średni, „Skopiuj obrazek” średni)",
  half9: "9×24 (symetria Poziom 4, nonogram trudny, dyktando trudny, „Skopiuj obrazek” trudny)",
};
const CATEGORY_LABEL: Record<string, string> = {
  "boze-narodzenie": "Boże Narodzenie",
  zima: "Zima",
  zwierzeta: "Zwierzęta",
  budowle: "Domy i budowle",
  przyroda: "Przyroda",
  ksztalty: "Kształty",
};

interface MockVariant {
  top?: number;
  left?: number;
  lines: string[];
}
interface MockObject {
  id: string;
  name: string;
  categories: string[];
  holeColor: string | null;
  sizes: Record<
    SizeKey,
    { width: number; height: number; base: string[]; parts: { id: string; variants: MockVariant[] }[] }
  >;
}
interface MockShape {
  name: string;
  categories: string[];
  levels: Partial<Record<"lat5" | "lat6" | "lat7", { rows: string[] }>>;
}

const mockPath = process.argv[2] ?? "context/changes/seasons-objects-characters/mockup-drawings.json";
const dir = nodePath.dirname(mockPath);
const mock = JSON.parse(fs.readFileSync(mockPath, "utf8")) as {
  objects: MockObject[];
  shapes: Record<string, MockShape>;
};

/** Empty cells the silhouette closes in: a flood from outside the padded grid never reaches them. */
function holesOf(filled: ReadonlySet<string>, width: number, height: number): Set<string> {
  const reached = new Set<string>(["-1,-1"]);
  const queue = [[-1, -1]];
  for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
    const [col, row] = next;
    for (const [c, r] of [
      [col + 1, row],
      [col - 1, row],
      [col, row + 1],
      [col, row - 1],
    ]) {
      const key = `${c},${r}`;
      if (c >= -1 && c <= width && r >= -1 && r <= height && !filled.has(key) && !reached.has(key)) {
        reached.add(key);
        queue.push([c, r]);
      }
    }
  }
  const holes = new Set<string>();
  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      if (!filled.has(`${c},${r}`) && !reached.has(`${c},${r}`)) holes.add(`${c},${r}`);
    }
  }
  return holes;
}

function gridSvg(colors: ReadonlyMap<string, string>, width: number, height: number, unit: number): string {
  const rects: string[] = [];
  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      const fill = colors.get(`${c},${r}`) ?? "#fff";
      rects.push(
        `<rect x="${c * unit}" y="${r * unit}" width="${unit}" height="${unit}" fill="${fill}" stroke="#ddd" stroke-width="0.5"/>`,
      );
    }
  }
  return `<svg width="${width * unit}" height="${height * unit}" style="background:#fff;border:1px solid #888">${rects.join("")}</svg>`;
}

function objectSvgs(object: MockObject, size: SizeKey, set: readonly number[]): { color: string; black: string } {
  const spec = object.sizes[size];
  const cells: SymmetryCell[] = [
    ...drawing(spec.base),
    ...spec.parts.flatMap((part, index) => {
      const variant = part.variants[set[index]];
      return drawing(variant.lines, variant.top ?? 0, variant.left ?? 0);
    }),
  ];
  const width = spec.width * 2;
  const color = new Map<string, string>();
  for (const cell of cells) {
    color.set(`${cell.col},${cell.row}`, FILL[cell.color]);
    color.set(`${width - 1 - cell.col},${cell.row}`, FILL[cell.color]);
  }
  const filled = new Set(color.keys());
  const black = new Map([...filled].map((key) => [key, FILL.black]));
  if (object.holeColor !== null) {
    for (const hole of holesOf(filled, width, spec.height)) color.set(hole, FILL[object.holeColor]);
  }
  const unit = UNIT[size];
  return { color: gridSvg(color, width, spec.height, unit), black: gridSvg(black, width, spec.height, unit) };
}

function combos(counts: readonly number[]): number[][] {
  let sets: number[][] = [[]];
  for (const count of counts)
    sets = sets.flatMap((set) => Array.from({ length: count }, (_, index) => [...set, index]));
  return sets;
}

const page = (title: string, body: string): string =>
  `<!doctype html><meta charset=utf-8><body style="font-family:Segoe UI,sans-serif;margin:16px;background:#f4f4f4;width:max-content;max-width:2200px"><h1 style="font-size:20px">${title}</h1>${body}</body>`;
const categories = (ids: readonly string[]): string => ids.map((id) => CATEGORY_LABEL[id] ?? id).join(" + ");
const pages: { file: string; html: string }[] = [];

for (const size of ["half4", "half6", "half9"] as const) {
  let body =
    "<p>Każdy obrazek to jedna kombinacja części (numery wariantów pod obrazkiem). Najpierw w kolorach, potem w czerni (jak nonogram i czarna „Skopiuj obrazek”).</p>";
  for (const object of mock.objects) {
    const spec = object.sizes[size];
    const sets = combos(spec.parts.map((part) => part.variants.length));
    const drawn = sets.map((set) => ({ set, ...objectSvgs(object, size, set) }));
    const tile = (svg: string, label: string): string =>
      `<div style="text-align:center">${svg}<br><small>${label}</small></div>`;
    body += `<div style="margin:12px 0;padding:8px;background:#fff;border:1px solid #ccc"><b>${object.name}</b> — kategorie: ${categories(object.categories)}; części: ${spec.parts.map((part) => part.id).join(", ")}; ${sets.length} kombinacji`;
    body += `<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-top:6px">${drawn.map((entry) => tile(entry.color, entry.set.join("-"))).join("")}</div>`;
    body += `<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-top:6px">${drawn.map((entry) => tile(entry.black, entry.set.join("-"))).join("")}</div></div>`;
  }
  pages.push({
    file: `preview-${size === "half4" ? "4x12" : size === "half6" ? "6x15" : "9x24"}.png`,
    html: page(`S-38 Boże Narodzenie — obiekty z szablonów, ${TITLE[size]}`, body),
  });
}

{
  const unitOf = { lat5: 14, lat6: 11, lat7: 8 } as const;
  const levelName = { lat5: "łatwy", lat6: "średni", lat7: "trudny" } as const;
  let body =
    "<p>Kształty tylko dla dyktanda, bez kolorów. Dziury nie są rysowane (dziecko rysuje zewnętrzny obrys). Każdy poziom: kształt i jego odbicie, które jest drugą kartą.</p>";
  for (const [id, shape] of Object.entries(mock.shapes)) {
    body += `<div style="margin:12px 0;padding:8px;background:#fff;border:1px solid #ccc"><b>${shape.name}</b> (${id}) — kategorie: ${categories(shape.categories)}<div style="display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap;margin-top:6px">`;
    for (const levelId of ["lat5", "lat6", "lat7"] as const) {
      const rows = shape.levels[levelId]?.rows;
      if (rows === undefined) continue;
      const width = rows[0].length;
      for (const mirrored of [false, true]) {
        const cells = new Map<string, string>();
        rows.forEach((line, row) => {
          [...line].forEach((letter, col) => {
            if (letter === "#") cells.set(`${mirrored ? width - 1 - col : col},${row}`, FILL.black);
          });
        });
        body += `<div style="text-align:center">${gridSvg(cells, width, rows.length, unitOf[levelId])}<br><small>${levelName[levelId]} ${width}×${rows.length}${mirrored ? ", odbicie" : ""}</small></div>`;
      }
    }
    body += "</div></div>";
  }
  pages.push({ file: "preview-shapes.png", html: page("S-54 Zima — kształty dyktanda", body) });
}

const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 2240, height: 800 } });
  for (const { file, html } of pages) {
    await tab.setContent(html);
    await tab.screenshot({ path: nodePath.join(dir, file), fullPage: true });
    console.log(`written ${nodePath.join(dir, file)}`);
  }
} finally {
  await browser.close();
}
