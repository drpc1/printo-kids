// Makiety dla GitHub #363: czy warto powiększyć kratkę "Skopiuj rysunek na kratce" do granicy szerokości strony,
// i czy układ "pod" (jedna kratka nad drugą) przy tej granicy wypada lepiej niż dzisiejszy "obok". Dla każdego
// poziomu trzy warianty: "dzis" (nominalny cellSize z levels.ts), "obok-max" (kratka powiększona do granicy
// szerokości przy układzie obok siebie) i "pod-max" (kratka powiększona do granicy przy układzie jedna pod drugą).
// Podpis każdej karty podaje wysokość siatki jako % dostępnej wysokości strony (ten sam miernik co w komentarzu
// do issue #363: nonogram tego samego rozmiaru siatki wypełnia 61%+).
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/gh363-copy-drawing-fill/mockup.mts
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { nonogramImage } from "../../../src/lib/nonogram/clues.ts";
import { nonogramVariants } from "../../../src/lib/nonogram/generate.ts";
import { NONOGRAM_SIZES } from "../../../src/lib/nonogram/sizes.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 6, gridGap: 10 };
const NOMINAL: Record<string, number> = { latwy: 10, sredni: 7, trudny: 5 };
const SEEDS: Record<string, number> = { latwy: 3, sredni: 11, trudny: 17 };

type Layout = "obok" | "pod";

function frac(seed: number): number {
  let a = seed + 0x6d2b79f5;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}

const innerW = PAGE.w - 2 * PAGE.inset;
const top = PAGE.inset + PAGE.band + PAGE.bandGap;
const availH = PAGE.h - PAGE.inset - top;

function maxCell(columns: number, rows: number, layout: Layout): number {
  if (layout === "obok") {
    return Math.min((innerW - PAGE.gridGap) / (2 * columns), availH / rows);
  }
  return Math.min(innerW / columns, (availH - PAGE.gridGap) / (2 * rows));
}

function sheet(sizeId: string, layout: Layout, mode: "dzis" | "max"): { svg: string; cell: number; note: string } {
  const size = NONOGRAM_SIZES.find((s) => s.id === sizeId)!;
  const variants = nonogramVariants(size);
  const v = variants[Math.floor(frac(SEEDS[sizeId]) * variants.length)];
  const image = nonogramImage(v.template, v.variants, size);
  const { columns: C, rows: R } = size;
  const bound = maxCell(C, R, layout);
  const cell = mode === "dzis" ? Math.min(NOMINAL[sizeId], bound) : Math.floor(bound * 20) / 20;
  const gw = C * cell;
  const gh = R * cell;
  const blockW = layout === "obok" ? 2 * gw + PAGE.gridGap : gw;
  const blockH = layout === "obok" ? gh : 2 * gh + PAGE.gridGap;
  const left = PAGE.inset + (innerW - blockW) / 2;
  const topY = top + (availH - blockH) / 2;
  const origins: [number, number][] =
    layout === "obok"
      ? [
          [left, topY],
          [left + gw + PAGE.gridGap, topY],
        ]
      : [
          [left, topY],
          [left, topY + gh + PAGE.gridGap],
        ];
  const parts: string[] = [];
  parts.push(`<rect width="210" height="297" fill="#fff"/>`);
  parts.push(
    `<rect x="${PAGE.inset}" y="${PAGE.inset}" width="${innerW}" height="${PAGE.band}" fill="none" stroke="#888" stroke-width="0.3" stroke-dasharray="2 1.5"/>`,
    `<text x="${PAGE.w / 2}" y="${PAGE.inset + 16}" text-anchor="middle" font-size="7" ${FONT}>Przerysuj obrazek na pustą kratkę.</text>`,
  );
  origins.forEach(([ox, oy], g) => {
    for (let r = 0; r < R; r++)
      for (let c = 0; c < C; c++)
        if (g === 0 && image[r][c])
          parts.push(
            `<rect x="${(ox + c * cell).toFixed(2)}" y="${(oy + r * cell).toFixed(2)}" width="${cell}" height="${cell}" fill="#000"/>`,
          );
    for (let c = 0; c <= C; c++) {
      const w = c % 5 === 0 || c === C ? 0.8 : 0.3;
      parts.push(
        `<line x1="${(ox + c * cell).toFixed(2)}" y1="${oy}" x2="${(ox + c * cell).toFixed(2)}" y2="${(oy + gh).toFixed(2)}" stroke="#555" stroke-width="${w}"/>`,
      );
    }
    for (let r = 0; r <= R; r++) {
      const w = r % 5 === 0 || r === R ? 0.8 : 0.3;
      parts.push(
        `<line x1="${ox}" y1="${(oy + r * cell).toFixed(2)}" x2="${(ox + gw).toFixed(2)}" y2="${(oy + r * cell).toFixed(2)}" stroke="#555" stroke-width="${w}"/>`,
      );
    }
  });
  parts.push(
    `<rect x="${PAGE.inset}" y="${PAGE.inset}" width="${innerW}" height="${PAGE.h - 2 * PAGE.inset}" fill="none" stroke="#d33" stroke-width="0.2" stroke-dasharray="1 2"/>`,
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm">${parts.join("")}</svg>`;
  const fillPct = ((blockH / availH) * 100).toFixed(1);
  const note = `${size.id} ${C}×${R}, ${layout} ${mode}: kratka ${cell} mm, blok wysokości ${blockH.toFixed(1)} mm = ${fillPct}% dostępnej wysokości (obiekt ${v.template.id})`;
  return { svg, cell, note };
}

const items: { file: string; svg: string; note: string }[] = [];
for (const id of ["latwy", "sredni", "trudny"]) {
  for (const [layout, mode] of [
    ["obok", "dzis"],
    ["obok", "max"],
    ["pod", "max"],
  ] as [Layout, "dzis" | "max"][]) {
    const r = sheet(id, layout, mode);
    const file = `mockup-${id}-${layout}-${mode}.svg`;
    writeFileSync(`${OUT}/${file}`, r.svg);
    items.push({ file, svg: r.svg, note: r.note });
    console.log(r.note);
  }
}
writeFileSync(
  `${OUT}/mockups.html`,
  `<!doctype html><meta charset="utf-8"><title>Makieta GH #363</title><style>body{font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px;padding:16px;background:#eee}figure{margin:0;width:340px}svg{width:340px;height:auto;background:#fff;box-shadow:0 0 4px #888}</style>${items
    .map((i) => `<figure>${i.svg}<figcaption>${i.note}</figcaption></figure>`)
    .join("")}`,
);
