// Writes a mockup of the colored coins and notes of the "Kto ma więcej?" card to context/changes/coins-colors/:
// the five nominals (1, 2, 5, 10, 20 zł) enlarged and at print size, and a sample row of two piles. Colors here are
// literals because this is a mockup; the page will take them from theme tokens. Style: Montessori, realistic but
// simplified: true-to-life colors and proportions, flat fills, few clear shapes, no fine detail. Our own drawings, no
// security features, no copy of any real design (PRD Open Questions 14).
// Run: node scripts/money-colors-mockup.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MONEY_SHEET as S } from "../src/lib/money/sheet.ts";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../context/changes/coins-colors");
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const INK = "#1a1a1a";

// Coins: silver, gold, and a two-tone coin (gold ring, silver middle), like the real ones.
const COINS = {
  1: { rim: "#c3c8cd", face: "#c3c8cd", edge: "#7d848b", eagle: "#8a9199" },
  2: { rim: "#d9ae3d", face: "#d9ae3d", edge: "#8e6a1c", eagle: "#a87f1d" },
  5: { rim: "#d9ae3d", face: "#c3c8cd", edge: "#8e6a1c", eagle: "#8a9199" },
};
// Notes: 10 zł red-pink, 20 zł orange-brown, like the real ones.
const NOTES = {
  10: { field: "#f1b9ae", border: "#a8362c", panel: "#f8d8d0" },
  20: { field: "#f0c88a", border: "#a85f16", panel: "#f8e2bd" },
};

// A simplified crowned eagle: wings, body, head with a beak, a three-point crown, a short tail.
function eagle(cx, cy, size, fill) {
  const wing = (m) => {
    const pts = [
      [0.12, -0.1],
      [0.5, -0.6],
      [0.52, -0.3],
      [0.95, -0.45],
      [0.75, 0.05],
      [0.95, 0.3],
      [0.5, 0.25],
      [0.15, 0.35],
    ];
    return `<polygon points="${pts.map(([x, y]) => `${m * x},${y}`).join(" ")}"/>`;
  };
  return `<g transform="translate(${cx} ${cy}) scale(${size / 2})" fill="${fill}">${wing(1)}${wing(-1)}<ellipse cx="0" cy="0.05" rx="0.22" ry="0.4"/><circle cx="0.02" cy="-0.5" r="0.15"/><path d="M 0.12 -0.54 L 0.3 -0.47 L 0.12 -0.42 Z"/><path d="M -0.16 -0.62 L -0.16 -0.84 L -0.08 -0.74 L 0 -0.9 L 0.08 -0.74 L 0.16 -0.84 L 0.16 -0.62 Z"/><path d="M -0.2 0.4 L 0.2 0.4 L 0.3 0.8 L 0 0.7 L -0.3 0.8 Z"/></g>`;
}

// A simple ruler bust, facing front: a bearded ruler in a round cap (10 zł) or a crowned bearded one (20 zł).
function king(cx, cy, size, crowned) {
  const hat = crowned
    ? '<path d="M -0.38 -0.1 L -0.42 -0.62 L -0.2 -0.38 L 0 -0.78 L 0.2 -0.38 L 0.42 -0.62 L 0.38 -0.1 Z" fill="#d9ae3d" stroke="#8e6a1c" stroke-width="0.04"/>'
    : '<path d="M -0.38 -0.08 Q -0.4 -0.6 0 -0.62 Q 0.4 -0.6 0.38 -0.08 Z" fill="#6b4a2b" stroke="#3a2614" stroke-width="0.04"/>';
  return `<g transform="translate(${cx} ${cy}) scale(${size / 2})"><path d="M -0.55 0.95 Q -0.5 0.55 0 0.5 Q 0.5 0.55 0.55 0.95 Z" fill="#7a2f2f"/><circle cx="0" cy="0.1" r="0.38" fill="#f3d4b5" stroke="#5a3a1e" stroke-width="0.04"/>${hat}<circle cx="-0.14" cy="0.04" r="0.04" fill="#222"/><circle cx="0.14" cy="0.04" r="0.04" fill="#222"/><path d="M -0.32 0.2 Q 0 0.72 0.32 0.2 Q 0.16 0.34 0 0.3 Q -0.16 0.34 -0.32 0.2 Z" fill="#8a8a8a"/></g>`;
}

function coin(value, cx, cy, d) {
  const c = COINS[value];
  const r = d / 2;
  const sw = d * 0.05;
  const inner = r * 0.74;
  return `<g><circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" fill="${c.rim}" stroke="${c.edge}" stroke-width="${sw}"/>
<circle cx="${cx}" cy="${cy}" r="${inner}" fill="${c.face}" stroke="${c.edge}" stroke-width="${sw * 0.6}"/>
${eagle(cx, cy - d * 0.1, inner * 1.5, c.eagle)}
<text x="${cx}" y="${cy + d * 0.26}" ${FONT} font-size="${d * 0.3}" font-weight="700" fill="${INK}" text-anchor="middle" dominant-baseline="central">${value} zł</text></g>`;
}

function note(value, x, y, w, h) {
  const n = NOTES[value];
  const sw = h * 0.05;
  const inset = h * 0.1;
  const px = x + w * 0.74;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.08}" fill="${n.field}" stroke="${n.border}" stroke-width="${sw}"/>
<rect x="${x + inset}" y="${y + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${h * 0.05}" fill="none" stroke="${n.border}" stroke-width="${sw * 0.5}"/>
<circle cx="${px}" cy="${y + h / 2}" r="${h * 0.33}" fill="${n.panel}" stroke="${n.border}" stroke-width="${sw * 0.6}"/>
${king(px, y + h * 0.46, h * 0.46, value === 20)}
<text x="${px}" y="${y + h * 0.88}" ${FONT} font-size="${h * 0.085}" font-weight="700" fill="${n.border}" text-anchor="middle" dominant-baseline="central">${value === 20 ? "BOLESŁAW CHROBRY" : "MIESZKO I"}</text>
<text x="${x + w * 0.1}" y="${y + h * 0.5}" ${FONT} font-size="${h * 0.58}" font-weight="700" fill="${INK}" dominant-baseline="central">${value}</text>
<text x="${x + w * 0.1}" y="${y + h * 0.84}" ${FONT} font-size="${h * 0.13}" font-weight="700" fill="${n.border}" dominant-baseline="central">ZŁ</text></g>`;
}

const parts = [];
// Enlarged (x4) nominals.
const k = 4;
[1, 2, 5].forEach((v, i) => parts.push(coin(v, 25 + i * 50, 30, S.coinDiameter * k)));
[10, 20].forEach((v, i) => parts.push(note(v, 10 + i * 100, 70, S.noteWidth * k, S.noteHeight * k)));
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
