// Podgląd karty „Od najmniejszego” (S-48, faza 1): rysuje karty z prawdziwych modułów produktu (poziomy, generator,
// układ, stałe druku) w skali 1:1 (A4, 210 × 297 mm). Trzy poziomy, każdy bez kolorów i z kolorami (ta sama karta,
// bo kolory jej nie zmieniają), z postacią (kółko i dymek z pasa postaci) albo bez niej (samo polecenie).
// Pisze preview-*.svg i previews.html (oba w .gitignore tego folderu; commitowany jest tylko ten skrypt). Nie jest kodem
// produktu: importuje tylko src/lib/size-order/*, ikony i kształty; nie ma własnych wymiarów rysunku. Kolory kredek
// są wartościami z global.css (--symmetry-*), bo poza stroną nie ma tokenów.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/size-order-card/preview.mts
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { iconById, type IconFigure } from "../../../src/lib/odd-one-out/icons.ts";
import type { OddCrayon } from "../../../src/lib/odd-one-out/rules.ts";
import { SPEECH_BAND } from "../../../src/lib/sheet/speech.ts";
import { sudokuShapePath } from "../../../src/lib/sudoku/shapes.ts";
import { generateSizeOrderCard } from "../../../src/lib/size-order/generate.ts";
import { iconBounds, layoutSizeOrderSheet } from "../../../src/lib/size-order/layout.ts";
import { SIZE_ORDER_LEVELS } from "../../../src/lib/size-order/levels.ts";
import { SIZE_ORDER_SHEET } from "../../../src/lib/size-order/sheet.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const SHEET = SIZE_ORDER_SHEET;
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const CRAYONS: Record<OddCrayon, string> = {
  red: "oklch(0.58 0.21 27)",
  blue: "oklch(0.55 0.18 255)",
  green: "oklch(0.62 0.17 145)",
  orange: "oklch(0.7 0.18 50)",
  purple: "oklch(0.48 0.17 305)",
  yellow: "oklch(0.8 0.16 85)",
  brown: "oklch(0.42 0.07 55)",
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number): string => n.toFixed(2);

function figureSvg(figure: IconFigure, ink: string): string {
  const fill = figure.tone === "ink" ? ink : "#fff";
  switch (figure.kind) {
    case "circle":
      return `<circle cx="${figure.cx}" cy="${figure.cy}" r="${figure.r}" fill="${fill}"/>`;
    case "ellipse":
      return `<ellipse cx="${figure.cx}" cy="${figure.cy}" rx="${figure.rx}" ry="${figure.ry}" fill="${fill}"${figure.rotate === undefined ? "" : ` transform="rotate(${figure.rotate} ${figure.cx} ${figure.cy})"`}/>`;
    case "rect":
      return `<rect x="${figure.x}" y="${figure.y}" width="${figure.width}" height="${figure.height}" rx="${figure.rx ?? 0}" fill="${fill}"${figure.rotate === undefined ? "" : ` transform="rotate(${figure.rotate} ${figure.x + figure.width / 2} ${figure.y + figure.height / 2})"`}/>`;
    case "polygon":
      return `<polygon points="${figure.points.map((p) => p.join(",")).join(" ")}" fill="${fill}"/>`;
    case "line":
      return `<line x1="${figure.x1}" y1="${figure.y1}" x2="${figure.x2}" y2="${figure.y2}" stroke="${fill}" stroke-width="${figure.strokeWidth}" stroke-linecap="round"/>`;
    case "path":
      return figure.strokeWidth === undefined
        ? `<path d="${figure.d}" fill="${fill}"/>`
        : `<path d="${figure.d}" fill="none" stroke="${fill}" stroke-width="${figure.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

function sheetSvg(levelIndex: number, colors: boolean, withCharacter: boolean): string {
  const level = SIZE_ORDER_LEVELS[levelIndex];
  const card = generateSizeOrderCard(mulberry32(10 + levelIndex), level);
  if (card === null) throw new Error("no card");
  const bandHeight = withCharacter ? SPEECH_BAND.characterSize : SHEET.plainInstructionSize;
  const layout = layoutSizeOrderSheet(card, bandHeight);
  const parts: string[] = [];
  const left = SHEET.inset;
  const width = SHEET.pageWidth - 2 * SHEET.inset;

  if (withCharacter) {
    const y = SHEET.inset;
    parts.push(`<circle cx="${left + 13}" cy="${y + 13}" r="11" fill="#f3c969" stroke="#b8860b" stroke-width="0.4"/>`);
    parts.push(
      `<path d="M ${left + 30} ${y + 2} H ${left + width} V ${y + 24} H ${left + 30} V ${y + 16.5} L ${left + 26} ${y + 13} L ${left + 30} ${y + 9.5} Z" fill="#fff" stroke="#111" stroke-width="0.6" stroke-linejoin="round"/>`,
    );
    parts.push(
      `<text x="${left + 34}" y="${y + 13 + 6.2 * SHEET.baselineShift}" ${FONT} font-size="6.2" fill="#111">${SHEET.instruction}</text>`,
    );
  } else {
    parts.push(
      `<text x="${left}" y="${SHEET.inset + SHEET.plainInstructionSize / 2 + SHEET.plainInstructionSize * SHEET.baselineShift}" ${FONT} font-size="${SHEET.plainInstructionSize}" fill="#111">${SHEET.instruction}</text>`,
    );
  }

  card.rows.forEach((row, r) => {
    const rowLayout = layout.rows[r];
    const ink = colors ? CRAYONS[row.crayon] : "#111";
    if (r > 0) {
      parts.push(
        `<line x1="${left}" y1="${f(rowLayout.top)}" x2="${left + width}" y2="${f(rowLayout.top)}" stroke="#ccc" stroke-width="${SHEET.rowDividerStroke}" stroke-dasharray="1.5 1.5"/>`,
      );
    }
    rowLayout.slots.forEach((slot) => {
      if (row.picture.kind === "icon") {
        const icon = iconById(row.picture.id);
        if (icon === undefined) throw new Error("unknown icon");
        const b = iconBounds(icon);
        const k = slot.height / (b.y1 - b.y0);
        const tx = slot.cx - ((b.x0 + b.x1) / 2) * k;
        const ty = rowLayout.baseline - b.y1 * k;
        parts.push(
          `<g transform="translate(${f(tx)} ${f(ty)}) scale(${k.toFixed(4)})">${icon.figures.map((fig) => figureSvg(fig, ink)).join("")}</g>`,
        );
      } else {
        const d = sudokuShapePath(
          row.picture.id,
          slot.cx,
          rowLayout.baseline - slot.height / 2,
          slot.height - SHEET.shapeStroke,
        );
        parts.push(
          `<path d="${d}" fill="${colors ? ink : "none"}" stroke="${ink}" stroke-width="${SHEET.shapeStroke}" stroke-linejoin="round"/>`,
        );
      }
      parts.push(
        `<rect x="${f(slot.box.x)}" y="${f(slot.box.y)}" width="${f(slot.box.width)}" height="${f(slot.box.height)}" rx="${SHEET.boxRadius}" fill="#fff" stroke="#111" stroke-width="${SHEET.boxStroke}"/>`,
      );
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${SHEET.pageWidth} ${SHEET.pageHeight}"><rect width="${SHEET.pageWidth}" height="${SHEET.pageHeight}" fill="#fff"/>${parts.join("")}</svg>`;
}

const files: { file: string; title: string }[] = [];
SIZE_ORDER_LEVELS.forEach((level, index) => {
  for (const colors of [false, true]) {
    const withCharacter = index !== 1 || !colors; // jeden podgląd bez postaci: średni z kolorami
    const file = `preview-${level.id}${colors ? "-kolory" : ""}${withCharacter ? "" : "-brak"}.svg`;
    writeFileSync(resolve(OUT, file), sheetSvg(index, colors, withCharacter));
    files.push({ file, title: `${level.label}${colors ? ", kolory" : ""}${withCharacter ? "" : ", bez postaci"}` });
  }
});
const html = `<!doctype html><meta charset="utf-8"><title>S-48 podgląd</title>
<style>body{font:14px Arial;margin:16px;background:#eee}figure{display:inline-block;margin:8px;vertical-align:top}img{width:420px;background:#fff;box-shadow:0 1px 4px #0003}figcaption{margin-top:4px}</style>
${files.map((x) => `<figure><img src="${x.file}"><figcaption>${x.title}</figcaption></figure>`).join("\n")}`;
writeFileSync(resolve(OUT, "previews.html"), html);
console.log(`wrote ${files.length} SVG + previews.html`);
