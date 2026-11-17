// Mockup of the app for S-39: Mikołaj beside an instruction, renifer at the Level 6 maze start, the phone list.
// Run from the repo root: node context/changes/christmas-characters/mockup-app.mts
import { readFileSync } from "node:fs";
import sharp from "sharp";

const dir = "context/changes/christmas-characters/";
const chars = "public/characters/";

const pngs: Record<string, string> = {};
for (const id of ["balwanek","mikolaj","renifer","dinozaur","jednorozec","kot","pies","rakieta","robot","samochodzik","smok","strazak","syrenka","wrozka"]) {
  const png = await sharp(`${chars}${id}.webp`).png().toBuffer();
  pngs[id] = "data:image/png;base64," + png.toString("base64");
}

function uri(id: string): string {
  return pngs[id] ?? "";
}

const BROWN = "#3B2A20";
const BORDER = "#d8d2c8";
const font = "font-family=\"Arial, sans-serif\"";

// Panel 1: card top with the speech band (character left, bubble right).
const card = `
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="300">
  <rect width="420" height="300" fill="#fff" stroke="${BORDER}"/>
  <image href="${uri("mikolaj")}" x="20" y="20" width="170" height="170"/>
  <rect x="190" y="50" width="210" height="80" rx="14" fill="#fff" stroke="${BROWN}" stroke-width="2"/>
  <path d="M190 80 L172 92 L190 104" fill="#fff" stroke="${BROWN}" stroke-width="2"/>
  <line x1="191" y1="82" x2="191" y2="102" stroke="#fff" stroke-width="5"/>
  <text x="295" y="84" text-anchor="middle" font-size="15" ${font}>Zamaluj kratki według</text>
  <text x="295" y="106" text-anchor="middle" font-size="15" ${font}>liczb. Co się ukryło?</text>
  <rect x="40" y="215" width="340" height="60" fill="none" stroke="${BORDER}" stroke-dasharray="6 4"/>
  <text x="210" y="251" text-anchor="middle" font-size="13" fill="#999" ${font}>zadanie karty</text>
</svg>`;

// Panel 2: Level 6 maze top-left corner: character above the corner start, left edge flush with the maze.
const mazeLeft = 40;
const contentLeft = (258 / 1024) * 150; // character drawn 150 px wide, margin of the file
const charX = mazeLeft - contentLeft;
const walls: string[] = [];
for (let i = 0; i < 18; i++) {
  walls.push(`<line x1="${mazeLeft + i * 16}" y1="160" x2="${mazeLeft + i * 16}" y2="${160 + (i % 3) * 14 + 20}" stroke="${BROWN}" stroke-width="2"/>`);
  walls.push(`<line x1="${mazeLeft + i * 16}" y1="${200 + (i % 4) * 14}" x2="${mazeLeft + i * 16 + 16}" y2="${200 + (i % 4) * 14}" stroke="${BROWN}" stroke-width="2"/>`);
}
const maze = `
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="300">
  <rect width="420" height="300" fill="#fff" stroke="${BORDER}"/>
  <image href="${uri("renifer")}" x="${charX}" y="20" width="150" height="150"/>
  <rect x="${mazeLeft}" y="160" width="340" height="120" fill="none" stroke="${BROWN}" stroke-width="3"/>
  ${walls.join("")}
  <text x="${mazeLeft + 6}" y="150" font-size="12" fill="#999" ${font}>Start</text>
  <line x1="${mazeLeft}" y1="10" x2="${mazeLeft}" y2="290" stroke="#d33" stroke-dasharray="3 3"/>
</svg>`;

// Panel 3: the pick list in a 375 px phone dialog, scrolled content shown whole.
const rows: { id: string | null; label: string }[] = [
  { id: null, label: "Brak" },
  { id: "balwanek", label: "Bałwanek" },
  { id: "mikolaj", label: "Mikołaj" },
  { id: "renifer", label: "Renifer" },
  { id: "dinozaur", label: "Dinozaur" },
  { id: "jednorozec", label: "Jednorożec" },
  { id: "kot", label: "Kot" },
  { id: "pies", label: "Pies" },
  { id: "rakieta", label: "Rakieta" },
  { id: "robot", label: "Robot" },
  { id: "samochodzik", label: "Samochodzik" },
  { id: "smok", label: "Smok" },
  { id: "strazak", label: "Strażak" },
  { id: "syrenka", label: "Syrenka" },
  { id: "wrozka", label: "Wróżka" },
];
const rowH = 48;
let y = 12;
const items: string[] = [];
rows.forEach((row, i) => {
  if (row.id !== null) {
    items.push(`<image href="${uri(row.id)}" x="16" y="${y}" width="40" height="40"/>`);
  }
  items.push(`<text x="68" y="${y + 26}" font-size="16" ${font}>${row.label}</text>`);
  y += rowH;
  if (row.id === "renifer") {
    items.push(`<line x1="8" y1="${y + 3}" x2="359" y2="${y + 3}" stroke="#999" stroke-width="2"/>`);
    y += 8;
  }
  void i;
});
items.push(`<text x="68" y="${y + 26}" font-size="16" ${font}>Własny obrazek</text>`);
y += rowH + 12;
const listH = y;
const list = `
<svg xmlns="http://www.w3.org/2000/svg" width="375" height="${listH}">
  <rect width="375" height="${listH}" fill="#fff" stroke="${BORDER}"/>
  ${items.join("")}
</svg>`;

const W = 420 + 40 + 375 + 40;
const H = Math.max(listH, 620) + 40;
const out = await sharp({ create: { width: W, height: H, channels: 4, background: "#f1efe9" } })
  .composite([
    { input: Buffer.from(card), left: 20, top: 20 },
    { input: Buffer.from(maze), left: 20, top: 340 },
    { input: Buffer.from(list), left: 480, top: 20 },
  ])
  .png()
  .toBuffer();
await sharp(out).toFile(`${dir}mockup-app.png`);
console.log("mockup-app.png", W, H);
