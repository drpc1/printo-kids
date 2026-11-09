// Makieta karty „Skopiuj rysunek na kratce” (S-35) przed planem. Pisze SVG A4 do tego folderu z prawdziwych sylwetek
// katalogu szablonów (nonogramVariants + nonogramImage) i prawdziwych rozmiarów nonogramu. Dla każdego poziomu dwa układy:
// „obok” (kratki obok siebie) i „pod” (jedna nad drugą), a dla trudnego także wersje z numerami wierszy i kolumn.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/copy-the-drawing-card/mockup.mts
// Drukuj na A4 w 100%. Przerywany prostokąt u góry to pas na postać i dymek (26 mm).
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { nonogramImage } from "../../../src/lib/nonogram/clues.ts";
import { nonogramVariants } from "../../../src/lib/nonogram/generate.ts";
import { NONOGRAM_SIZES } from "../../../src/lib/nonogram/sizes.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const PAGE = { w: 210, h: 297, inset: 10, band: 26, bandGap: 6, gridGap: 10, labelGap: 2 };
// Docelowe kratki z PRD (mm); układ może je zmniejszyć, jeśli się nie mieszczą.
const NOMINAL: Record<string, number> = { latwy: 10, sredni: 7, trudny: 5 };
const SEEDS: Record<string, number> = { latwy: 3, sredni: 11, trudny: 17 };

type Layout = "obok" | "pod";

function frac(seed: number): number {
  let a = seed + 0x6d2b79f5;
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}

function sheet(sizeId: string, layout: Layout, numbers: boolean): { svg: string; cell: number; note: string } {
  const size = NONOGRAM_SIZES.find((s) => s.id === sizeId)!;
  const variants = nonogramVariants(size);
  const v = variants[Math.floor(frac(SEEDS[sizeId]) * variants.length)];
  const image = nonogramImage(v.template, v.variants, size);
  const { columns: C, rows: R } = size;
  const label = numbers ? 4 : 0; // pas na numery nad / przed kratką
  const innerW = PAGE.w - 2 * PAGE.inset;
  const top = PAGE.inset + PAGE.band + PAGE.bandGap;
  const innerH = PAGE.h - PAGE.inset - top;
  let cell: number;
  if (layout === "obok") {
    cell = Math.min(
      NOMINAL[sizeId],
      (innerW - PAGE.gridGap - 2 * label) / (2 * C),
      (innerH - label) / R,
    );
  } else {
    cell = Math.min(
      NOMINAL[sizeId],
      (innerW - label) / C,
      (innerH - PAGE.gridGap - 2 * label) / (2 * R),
    );
  }
  cell = Math.floor(cell * 10) / 10;
  const gw = C * cell;
  const gh = R * cell;
  const blockW = layout === "obok" ? 2 * (gw + label) + PAGE.gridGap : gw + label;
  const blockH = layout === "obok" ? gh + label : 2 * (gh + label) + PAGE.gridGap;
  const left = PAGE.inset + (innerW - blockW) / 2;
  const topY = top + (innerH - blockH) / 2;
  const origins =
    layout === "obok"
      ? [
          [left + label, topY + label],
          [left + label + gw + PAGE.gridGap + label, topY + label],
        ]
      : [
          [left + label, topY + label],
          [left + label, topY + label + gh + PAGE.gridGap + label],
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
          parts.push(`<rect x="${(ox + c * cell).toFixed(2)}" y="${(oy + r * cell).toFixed(2)}" width="${cell}" height="${cell}" fill="#000"/>`);
    for (let c = 0; c <= C; c++) {
      const w = c % 5 === 0 || c === C ? 0.8 : 0.3;
      parts.push(`<line x1="${(ox + c * cell).toFixed(2)}" y1="${oy}" x2="${(ox + c * cell).toFixed(2)}" y2="${(oy + gh).toFixed(2)}" stroke="#555" stroke-width="${w}"/>`);
    }
    for (let r = 0; r <= R; r++) {
      const w = r % 5 === 0 || r === R ? 0.8 : 0.3;
      parts.push(`<line x1="${ox}" y1="${(oy + r * cell).toFixed(2)}" x2="${(ox + gw).toFixed(2)}" y2="${(oy + r * cell).toFixed(2)}" stroke="#555" stroke-width="${w}"/>`);
    }
    if (numbers) {
      const fs = Math.min(3, cell * 0.6);
      for (let c = 0; c < C; c++)
        parts.push(`<text x="${(ox + (c + 0.5) * cell).toFixed(2)}" y="${(oy - 1).toFixed(2)}" text-anchor="middle" font-size="${fs}" ${FONT}>${c + 1}</text>`);
      for (let r = 0; r < R; r++)
        parts.push(`<text x="${(ox - 1).toFixed(2)}" y="${(oy + (r + 0.5) * cell + fs / 3).toFixed(2)}" text-anchor="end" font-size="${fs}" ${FONT}>${r + 1}</text>`);
    }
  });
  // Ramka marginesu 10 mm (tylko podgląd).
  parts.push(`<rect x="${PAGE.inset}" y="${PAGE.inset}" width="${innerW}" height="${PAGE.h - 2 * PAGE.inset}" fill="none" stroke="#d33" stroke-width="0.2" stroke-dasharray="1 2"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm">${parts.join("")}</svg>`;
  return { svg, cell, note: `${size.id} ${C}×${R}, ${layout}${numbers ? ", numery" : ""}: kratka ${cell} mm (cel ${NOMINAL[sizeId]}), obiekt ${v.template.id}` };
}

const items: { file: string; svg: string; note: string }[] = [];
for (const id of ["latwy", "sredni", "trudny"]) {
  for (const layout of ["obok", "pod"] as Layout[]) {
    for (const numbers of id === "trudny" ? [false, true] : [false]) {
      const r = sheet(id, layout, numbers);
      const file = `mockup-${id}-${layout}${numbers ? "-numery" : ""}.svg`;
      writeFileSync(`${OUT}/${file}`, r.svg);
      items.push({ file, svg: r.svg, note: r.note });
      console.log(r.note);
    }
  }
}
writeFileSync(
  `${OUT}/mockups.html`,
  `<!doctype html><meta charset="utf-8"><title>Makieta S-35</title><style>body{font-family:sans-serif;display:flex;flex-wrap:wrap;gap:16px;padding:16px;background:#eee}figure{margin:0;width:340px}svg{width:340px;height:auto;background:#fff;box-shadow:0 0 4px #888}</style>${items.map((i) => `<figure>${i.svg}<figcaption>${i.note}</figcaption></figure>`).join("")}`,
);
