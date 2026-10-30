// Writes preview.html: the whole silhouette (half and mirror) of every new look in the mockup. Usage: render-preview.mts [mockup.json]
import fs from "node:fs";
import { symmetryTemplatesFor } from "../../../src/lib/symmetry/templates.ts";
import { drawing } from "../../../src/lib/symmetry/template-format.ts";
import type { SymmetryCell, SymmetryTemplate } from "../../../src/lib/symmetry/template-format.ts";

type SizeKey = "half4" | "half6" | "half9";
const LEVEL_OF = { half4: "lat4", half6: "lat5", half9: "lat7" } as const;
const FILL: Record<string, string> = { red: "#d33", green: "#3a3", yellow: "#eb3", blue: "#36c", orange: "#e83", gray: "#999", black: "#222", brown: "#843" };
const mock = JSON.parse(fs.readFileSync(process.argv[2] ?? "context/changes/gh124-more-symetric-shapes/mockup-drawings.json", "utf8"));

function svg(template: SymmetryTemplate, set: number[], holes: boolean): string {
  const cells = [...template.base, ...template.parts.flatMap((part, index) => part.variants[set[index]])];
  const w = template.width * 2;
  const unit = template.width === 9 ? 9 : template.width === 6 ? 12 : 16;
  const solid = new Set<string>();
  const rects: string[] = [];
  for (const cell of cells) {
    for (const col of [cell.col, w - 1 - cell.col]) {
      solid.add(`${col},${cell.row}`);
      rects.push(`<rect x="${col * unit}" y="${cell.row * unit}" width="${unit}" height="${unit}" fill="${FILL[cell.color]}"/>`);
    }
  }
  void holes;
  return `<svg width="${w * unit}" height="${template.height * unit}" style="background:#fff;border:1px solid #bbb">${rects.join("")}</svg>`;
}

function patched(size: SizeKey): { template: SymmetryTemplate; added: number[][]; isNew: boolean }[] {
  const out: { template: SymmetryTemplate; added: number[][]; isNew: boolean }[] = [];
  const base = symmetryTemplatesFor(LEVEL_OF[size]).map((t) => ({ ...t, parts: t.parts.map((p) => ({ ...p, variants: [...p.variants] })) })) as SymmetryTemplate[];
  const addedSets = new Map<string, number[][]>();
  for (const add of (mock.variants ?? []).filter((v: { size: string }) => v.size === size)) {
    const template = base.find((t) => t.id === add.object)!;
    const partIndex = template.parts.findIndex((p) => p.id === add.part);
    (template.parts[partIndex].variants as unknown as SymmetryCell[][]).push(drawing(add.lines, add.top ?? 0, add.left ?? 0));
    const set = template.parts.map(() => 0);
    set[partIndex] = template.parts[partIndex].variants.length - 1;
    addedSets.set(add.object, [...(addedSets.get(add.object) ?? []), set]);
  }
  for (const [id, sets] of addedSets) out.push({ template: base.find((t) => t.id === id)!, added: sets, isNew: false });
  for (const object of mock.objects ?? []) {
    const spec = object.sizes[size];
    const template: SymmetryTemplate = {
      id: object.id, width: spec.width, height: spec.height, holeColor: object.holeColor, categories: object.categories,
      base: drawing(spec.base),
      parts: spec.parts.map((p: { id: string; variants: { lines: string[]; top?: number; left?: number }[] }) => ({ id: p.id, variants: p.variants.map((v) => drawing(v.lines, v.top ?? 0, v.left ?? 0)) })),
    };
    let sets: number[][] = [[]];
    for (const part of template.parts) sets = sets.flatMap((s) => part.variants.map((_, i) => [...s, i]));
    out.push({ template, added: sets, isNew: true });
  }
  return out;
}

let html = "<!doctype html><meta charset=utf-8><title>GH124 makieta</title><body style='font-family:sans-serif;margin:16px;background:#f4f4f4'><h1>GH #124: makieta wariantów</h1><p>Dla starych obiektów: pierwszy obrazek to dotychczasowy wygląd (wszystkie części w wariancie 0), kolejne to nowe warianty. Nowe obiekty (kotwica, lizak): wszystkie kombinacje.</p>";
for (const size of ["half4", "half6", "half9"] as const) {
  html += `<h2>${size === "half4" ? "4×12 (poziom 1)" : size === "half6" ? "6×15 (poziomy 2–3)" : "9×24 (poziom 4)"}</h2>`;
  for (const { template, added, isNew } of patched(size)) {
    const first = template.parts.map(() => 0);
    html += `<div style="margin:8px 0"><b>${template.id}</b>${isNew ? " (nowy)" : ""}<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">`;
    if (!isNew) html += `<div>${svg(template, first, true)}<br><small>dotychczas</small></div>`;
    for (const set of added) html += `<div>${svg(template, set, true)}<br><small>${isNew ? set.join("-") : "nowy"}</small></div>`;
    html += "</div></div>";
  }
}
fs.writeFileSync("context/changes/gh124-more-symetric-shapes/preview.html", html);
console.log("written preview.html");
