// Writes a print-ready mockup of the simple (preschool) nonogram to context/changes/nonogram-sizes/: an 8×12 grid where
// every row is described in full by chips left to right, "2 white, 3 gray, 5 black", with no column clues. The picture
// is a real small-size template drawn in three tones (white, gray, black) by an outline rule (edge cells black, inside gray). Print on A4 at
// 100%. Literal colors are allowed here: the output is a static file, not a page or component.
// Run: node --experimental-strip-types scripts/nonogram-simple-mockup.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { symmetryTemplatesFor } from "../src/lib/symmetry/templates.ts";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/nonogram-sizes");
const COLUMNS = 8;
const ROWS = 12;
const CELL = 14;
const CHIP = 10;
const TONE_FILL = { white: "#fff", gray: "#b9b9b9", black: "#111" };

function toneImage(template, variantOf) {
  const half = COLUMNS / 2;
  const cells = [...template.base];
  template.parts.forEach((part, index) => cells.push(...part.variants[variantOf(index)]));
  const image = Array.from({ length: ROWS }, () => new Array(COLUMNS).fill("white"));
  const shift = half - template.width;
  for (const cell of cells) {
    const col = cell.col + shift;
    image[cell.row][col] = "gray";
    image[cell.row][COLUMNS - 1 - col] = "gray";
  }
  // Outline rule: a filled cell with an empty (or outside) neighbour is black, the inside stays gray.
  const filled = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && image[r][c] !== "white";
  return image.map((row, r) =>
    row.map((tone, c) =>
      tone === "white"
        ? tone
        : [
              [0, 1],
              [0, -1],
              [1, 0],
              [-1, 0],
            ].every(([dr, dc]) => filled(r + dr, c + dc))
          ? "gray"
          : "black",
    ),
  );
}

function runs(row) {
  const out = [];
  for (const tone of row) {
    if (out.length > 0 && out[out.length - 1].tone === tone) out[out.length - 1].count += 1;
    else out.push({ tone, count: 1 });
  }
  return out;
}

function sheetSvg(template, solved) {
  const image = toneImage(template, () => 0);
  const clueRuns = image.map(runs);
  const maxRuns = Math.max(...clueRuns.map((r) => r.length));
  const bandWidth = maxRuns * (CHIP + 1.5) + 2;
  const gridW = COLUMNS * CELL;
  const gridH = ROWS * CELL;
  const startX = (210 - (bandWidth + gridW)) / 2 + bandWidth;
  const gridX = startX;
  const gridY = 297 / 2 - gridH / 2 + 8;
  const parts = [];
  parts.push(`<rect width="210" height="297" fill="#fff"/>`);
  parts.push(
    `<text x="105" y="${gridY - 14}" font-family="sans-serif" font-size="7" text-anchor="middle" dominant-baseline="middle">Pokoloruj każdy rząd według znaczków.</text>`,
  );
  if (solved) {
    image.forEach((row, r) =>
      row.forEach((tone, c) => {
        if (tone !== "white")
          parts.push(
            `<rect x="${gridX + c * CELL}" y="${gridY + r * CELL}" width="${CELL}" height="${CELL}" fill="${TONE_FILL[tone]}"/>`,
          );
      }),
    );
  }
  for (let i = 0; i <= COLUMNS; i += 1) {
    const thick = i === 0 || i === COLUMNS;
    parts.push(
      `<line x1="${gridX + i * CELL}" y1="${gridY}" x2="${gridX + i * CELL}" y2="${gridY + gridH}" stroke="#000" stroke-width="${thick ? 0.8 : 0.3}"/>`,
    );
  }
  for (let i = 0; i <= ROWS; i += 1) {
    const thick = i === 0 || i === ROWS;
    parts.push(
      `<line x1="${gridX}" y1="${gridY + i * CELL}" x2="${gridX + gridW}" y2="${gridY + i * CELL}" stroke="#000" stroke-width="${thick ? 0.8 : 0.3}"/>`,
    );
  }
  clueRuns.forEach((row, r) => {
    row.forEach((run, p) => {
      const x = gridX - 2 - (row.length - p) * (CHIP + 1.5) + 1.5;
      const y = gridY + r * CELL + (CELL - CHIP) / 2;
      parts.push(
        `<rect x="${x}" y="${y}" width="${CHIP}" height="${CHIP}" rx="1.2" fill="${TONE_FILL[run.tone]}" stroke="#000" stroke-width="0.5"/>`,
      );
      parts.push(
        `<text x="${x + CHIP / 2}" y="${y + CHIP / 2}" font-family="sans-serif" font-size="6.5" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${run.tone === "black" ? "#fff" : "#000"}">${run.count}</text>`,
      );
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm">${parts.join("")}</svg>`;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const template = symmetryTemplatesFor("lat4")[0];
for (const [name, solved] of [
  ["mockup-prosty", false],
  ["mockup-prosty-rozwiazanie", true],
]) {
  writeFileSync(
    resolve(OUTPUT_DIR, `${name}.html`),
    `<!doctype html><meta charset="utf-8"><title>Nonogram prosty 8×12</title><style>@page{size:A4;margin:0}body{margin:0}svg{display:block}</style>${sheetSvg(template, solved)}`,
  );
  console.log("wrote", name);
}
