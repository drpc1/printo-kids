// Writes print-ready mockups of the "Kto ma więcej?" card to context/changes/coins-who-has-more/: one A4 sheet per level
// (łatwy, średni, trudny), five rows of two piles with an empty square between them. The rows are real cards from the
// generator (fixed seed), drawn from the same constants and layout as the page. Print each file on A4 at 100%, in black
// and white, to judge: is the number on every coin and note readable, is the square big enough to write <, > or =.
// Run: node --experimental-strip-types scripts/money-mockup.mjs
// The dashed rectangle in the band marks where the character and the speech bubble will stand.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateMoneyCard } from "../src/lib/money/generate.ts";
import { MONEY_LEVELS } from "../src/lib/money/levels.ts";
import { layoutMoneySheet, layoutPile } from "../src/lib/money/layout.ts";
import { MONEY_SHEET } from "../src/lib/money/sheet.ts";

const OUTPUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/coins-who-has-more");
const FONT = 'font-family="Arial, Helvetica, sans-serif"';

const SEEDS = { latwy: 11, sredni: 22, trudny: 33 };

function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Real cards from the generator, one per level (fixed seed).
const LEVELS = Object.fromEntries(
  MONEY_LEVELS.map((level) => {
    const card = generateMoneyCard(mulberry32(SEEDS[level.id]), null, level);
    if (card === null) {
      throw new Error(`No ${level.id} card for seed ${SEEDS[level.id]}`);
    }
    return [level.id, card.rows.map((row) => [row.left, row.right])];
  }),
);

const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function piece(kind, value, x, y, width, height) {
  if (kind === "coin") {
    const r = width / 2;
    return (
      `<circle cx="${x + r}" cy="${y + r}" r="${r - MONEY_SHEET.coinStroke / 2}" fill="#fff" stroke="#000" stroke-width="${MONEY_SHEET.coinStroke}"/>` +
      `<text x="${x + r}" y="${y + r}" text-anchor="middle" dominant-baseline="central" ${FONT} font-weight="${MONEY_SHEET.fontWeight}" font-size="${MONEY_SHEET.coinFontSize}" fill="#000">${value}</text>`
    );
  }
  const inner = MONEY_SHEET.noteInnerInset;
  return (
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1" fill="#fff" stroke="#000" stroke-width="${MONEY_SHEET.noteStroke}"/>` +
    `<rect x="${x + inner}" y="${y + inner}" width="${width - 2 * inner}" height="${height - 2 * inner}" rx="0.6" fill="none" stroke="#000" stroke-width="${MONEY_SHEET.noteInnerStroke}"/>` +
    `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="central" ${FONT} font-weight="${MONEY_SHEET.fontWeight}" font-size="${MONEY_SHEET.noteFontSize}" fill="#000">${value}</text>`
  );
}

function pile(values, area) {
  const frame = `<rect x="${area.x}" y="${area.y}" width="${area.width}" height="${area.height}" rx="${MONEY_SHEET.pileFrameRadius}" fill="none" stroke="#000" stroke-width="${MONEY_SHEET.pileFrameStroke}"/>`;
  const laid = layoutPile(values, area.innerWidth);
  const left = area.x + MONEY_SHEET.pilePadding;
  const top = area.y + MONEY_SHEET.pilePadding + (area.innerHeight - laid.height) / 2;
  const pieces = laid.pieces.map((p) => piece(p.kind, p.value, left + p.x, top + p.y, p.width, p.height));
  return [frame, ...pieces].join("\n");
}

const sheet = layoutMoneySheet({
  pageWidth: MONEY_SHEET.pageWidth,
  pageHeight: MONEY_SHEET.pageHeight,
  inset: MONEY_SHEET.inset,
  rowCount: MONEY_SHEET.rowCount,
  bandHeight: MONEY_SHEET.bandHeight,
  bandGap: MONEY_SHEET.bandGap,
  rowGap: MONEY_SHEET.rowGap,
  signSize: MONEY_SHEET.signSize,
  signGap: MONEY_SHEET.signGap,
  pilePadding: MONEY_SHEET.pilePadding,
});

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [level, rows] of Object.entries(LEVELS)) {
  const parts = [`<rect width="${MONEY_SHEET.pageWidth}" height="${MONEY_SHEET.pageHeight}" fill="#fff"/>`];
  const band = sheet.band;
  parts.push(
    `<rect x="${MONEY_SHEET.inset}" y="${band.y}" width="${MONEY_SHEET.pageWidth - 2 * MONEY_SHEET.inset}" height="${band.height}" rx="5" fill="none" stroke="#000" stroke-width="0.3" stroke-dasharray="2 2"/>`,
  );
  MONEY_SHEET.instructionLines.forEach((text, index) => {
    const y = band.y + band.height / 2 + (index - 0.5) * 8;
    parts.push(
      `<text x="${MONEY_SHEET.pageWidth / 2}" y="${y}" text-anchor="middle" dominant-baseline="central" ${FONT} font-size="${MONEY_SHEET.plainInstructionSize}" fill="#000">${escape(text)}</text>`,
    );
  });
  rows.forEach(([left, right], index) => {
    const row = sheet.rows[index];
    parts.push(pile(left, row.left), pile(right, row.right));
    parts.push(
      `<rect x="${row.sign.x}" y="${row.sign.y}" width="${row.sign.size}" height="${row.sign.size}" rx="2" fill="none" stroke="#000" stroke-width="${MONEY_SHEET.signStroke}"/>`,
    );
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 ${MONEY_SHEET.pageWidth} ${MONEY_SHEET.pageHeight}">${parts.join("\n")}</svg>\n`;
  const output = resolve(OUTPUT_DIR, `mockup-${level}.svg`);
  writeFileSync(output, svg);
  console.log(`Wrote ${output}`);
}
