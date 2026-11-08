// Writes a mockup of the colored coins and notes of the "Kto ma więcej?" card to context/changes/coins-colors/:
// the five nominals (1, 2, 5, 10, 20 zł) enlarged and at print size, and a sample row of two piles. Colors here are
// literals because this is a mockup; the page will take them from theme tokens. Print at 100% in color and in black and
// white to judge: is the number readable on every fill, and is it clearly a drawing, not real money.
// Run: node scripts/money-colors-mockup.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MONEY_SHEET as S } from "../src/lib/money/sheet.ts";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/coins-colors");
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const INK = "#1a1a1a";

// Coins: rim (outer ring) and face (middle). Notes: field, border and a band on the left (a plain stripe, no emblem).
const COINS = {
  1: { rim: "#9aa0a6", face: "#d3d7db", text: INK },
  2: { rim: "#b8892b", face: "#e3b84f", text: INK },
  5: { rim: "#b8892b", face: "#d3d7db", text: INK },
};
const NOTES = {
  10: { field: "#f3c9bf", border: "#b4443a", band: "#e08a7d", text: INK },
  20: { field: "#cfe3c4", border: "#4f8a3c", band: "#9cc88a", text: INK },
};

function coin(value, cx, cy, d) {
  const c = COINS[value];
  const r = d / 2;
  const sw = d * 0.07;
  const inner = r * 0.68;
  return `<g><circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" fill="${c.rim}" stroke="${INK}" stroke-width="${sw}"/>
<circle cx="${cx}" cy="${cy}" r="${inner}" fill="${c.face}" stroke="${INK}" stroke-width="${sw * 0.4}"/>
<text x="${cx}" y="${cy}" ${FONT} font-size="${d * 0.46}" font-weight="700" fill="${c.text}" text-anchor="middle" dominant-baseline="central">${value}</text></g>`;
}

function note(value, x, y, w, h) {
  const n = NOTES[value];
  const sw = h * 0.06;
  const band = w * 0.2;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.1}" fill="${n.field}" stroke="${n.border}" stroke-width="${sw}"/>
<rect x="${x + sw}" y="${y + sw}" width="${band}" height="${h - 2 * sw}" fill="${n.band}"/>
<rect x="${x + h * 0.1}" y="${y + h * 0.1}" width="${w - h * 0.2}" height="${h - h * 0.2}" rx="${h * 0.06}" fill="none" stroke="${n.border}" stroke-width="${sw * 0.5}"/>
<text x="${x + w * 0.6}" y="${y + h / 2}" ${FONT} font-size="${h * 0.6}" font-weight="700" fill="${n.text}" text-anchor="middle" dominant-baseline="central">${value}</text></g>`;
}

const parts = [];
// Enlarged (x4) nominals.
const k = 4;
[1, 2, 5].forEach((v, i) => parts.push(coin(v, 20 + i * 50, 30, S.coinDiameter * k)));
[10, 20].forEach((v, i) => parts.push(note(v, 25 + i * 90, 70, S.noteWidth * k, S.noteHeight * k)));
// Print size (x1), one row.
parts.push(`<text x="10" y="140" ${FONT} font-size="5" fill="${INK}">Rozmiar wydruku</text>`);
[1, 2, 5].forEach((v, i) => parts.push(coin(v, 20 + i * 13, 152, S.coinDiameter)));
[10, 20].forEach((v, i) => parts.push(note(v, 62 + i * 20, 147, S.noteWidth, S.noteHeight)));
// Sample row: two piles with the empty square between them.
const pileW = 80;
parts.push(`<rect x="10" y="170" width="${pileW}" height="26" rx="3" fill="none" stroke="${INK}" stroke-width="0.3"/>`);
parts.push(
  `<rect x="120" y="170" width="${pileW}" height="26" rx="3" fill="none" stroke="${INK}" stroke-width="0.3"/>`,
);
parts.push(`<rect x="95" y="173" width="20" height="20" rx="2" fill="none" stroke="${INK}" stroke-width="0.5"/>`);
[5, 2, 2, 1].forEach((v, i) => parts.push(coin(v, 19 + i * 12.5, 183, S.coinDiameter)));
parts.push(note(20, 125, 178, S.noteWidth, S.noteHeight));
parts.push(coin(5, 150, 183, S.coinDiameter));

mkdirSync(OUT, { recursive: true });
writeFileSync(
  resolve(OUT, "mockup-kolory.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="210mm" viewBox="0 0 210 210"><rect width="210" height="210" fill="#fff"/>
${parts.join("\n")}</svg>\n`,
);
console.log("written mockup-kolory.svg");
