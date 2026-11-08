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

// Coins: rim and face as light-to-dark gradients, a reeded edge and a raised inner ring.
// Notes: a gradient field, soft wavy lines, a plain oval where a portrait would be (left empty on purpose), the value
// large in the middle and small in two corners. No emblem, no portrait, no security features: it must not pass for money.
const COINS = {
  1: { rim: ["#c9ced3", "#7d848b"], face: ["#eef0f2", "#b4bac0"] },
  2: { rim: ["#e0b64a", "#8e6a1c"], face: ["#f6dc86", "#cfa43a"] },
  5: { rim: ["#e0b64a", "#8e6a1c"], face: ["#eef0f2", "#b4bac0"] },
};
const NOTES = {
  10: { a: "#f8d9d1", b: "#e79a8c", line: "#c5574a", border: "#a63a30" },
  20: { a: "#dcecd2", b: "#a6cf92", line: "#5f9a4a", border: "#437a31" },
};

function defs() {
  const grad = (id, [light, dark]) =>
    `<radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;
  const lin = (id, n) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${n.a}"/><stop offset="1" stop-color="${n.b}"/></linearGradient>`;
  const coins = Object.entries(COINS).map(([v, c]) => grad(`rim${v}`, c.rim) + grad(`face${v}`, c.face));
  const notes = Object.entries(NOTES).map(([v, n]) => lin(`note${v}`, n));
  return `<defs>${[...coins, ...notes].join("")}</defs>`;
}

function coin(value, cx, cy, d) {
  const r = d / 2;
  const sw = d * 0.05;
  const inner = r * 0.7;
  return `<g><circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" fill="url(#rim${value})" stroke="${INK}" stroke-width="${sw}"/>
<circle cx="${cx}" cy="${cy}" r="${r - d * 0.045}" fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="${d * 0.05}" stroke-dasharray="${d * 0.012} ${d * 0.035}"/>
<circle cx="${cx}" cy="${cy}" r="${inner}" fill="url(#face${value})" stroke="${INK}" stroke-opacity="0.7" stroke-width="${sw * 0.5}"/>
<path d="M ${cx - inner * 0.75} ${cy - inner * 0.35} A ${inner * 0.85} ${inner * 0.85} 0 0 1 ${cx + inner * 0.2} ${cy - inner * 0.82}" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="${d * 0.03}" stroke-linecap="round"/>
<text x="${cx}" y="${cy}" ${FONT} font-size="${d * 0.46}" font-weight="700" fill="${INK}" text-anchor="middle" dominant-baseline="central">${value}</text></g>`;
}

function note(value, x, y, w, h) {
  const n = NOTES[value];
  const sw = h * 0.05;
  const inset = h * 0.09;
  const waves = [0.28, 0.5, 0.72]
    .map((f) => {
      const step = w / 8;
      let d = `M ${x + inset} ${y + h * f}`;
      for (let i = 0; i < 8; i++) {
        d += ` q ${step / 2} ${i % 2 === 0 ? -h * 0.07 : h * 0.07} ${step} 0`;
      }
      return `<path d="${d}" fill="none" stroke="${n.line}" stroke-opacity="0.45" stroke-width="${sw * 0.5}"/>`;
    })
    .join("");
  const corner = `${FONT} font-size="${h * 0.17}" font-weight="700" fill="${n.border}" dominant-baseline="central"`;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.1}" fill="url(#note${value})" stroke="${n.border}" stroke-width="${sw}"/>
<rect x="${x + inset}" y="${y + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${h * 0.06}" fill="none" stroke="${n.border}" stroke-width="${sw * 0.5}"/>
${waves}
<ellipse cx="${x + w * 0.24}" cy="${y + h / 2}" rx="${w * 0.11}" ry="${h * 0.3}" fill="#fff" fill-opacity="0.35" stroke="${n.border}" stroke-opacity="0.6" stroke-width="${sw * 0.5}"/>
<text x="${x + w * 0.62}" y="${y + h / 2}" ${FONT} font-size="${h * 0.58}" font-weight="700" fill="${INK}" text-anchor="middle" dominant-baseline="central">${value}</text>
<text x="${x + inset * 1.5}" y="${y + inset * 2}" ${corner}>${value}</text>
<text x="${x + w - inset * 1.5}" y="${y + h - inset * 2}" ${corner} text-anchor="end">${value}</text></g>`;
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
  `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="210mm" viewBox="0 0 210 210"><rect width="210" height="210" fill="#fff"/>${defs()}
${parts.join("\n")}</svg>\n`,
);
console.log("written mockup-kolory.svg");
