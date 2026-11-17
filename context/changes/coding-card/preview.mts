// Podgląd karty „Kodowanie” (S-42, faza 2): rysuje karty z prawdziwych modułów produktu (poziomy, tryby, generator,
// układ, stałe druku) w skali 1:1 (A4, 210 × 297 mm). Oba tryby na Poziomie 1 i 4, z postacią (przerywany pas na postać
// i dymek, przerywany kwadrat w polu startu) i bez niej („Brak”: samo polecenie i kółko „Start”).
// Pisze preview-*.svg i previews.html (oba w .gitignore tego folderu; commitowany jest tylko ten skrypt). Nie jest kodem
// produktu: importuje tylko src/lib/coding/* i src/lib/sheet/speech.ts i nie ma własnych wymiarów rysunku. Kolory to
// zwykła czerń, biel i szarość (strona użyje tokenów). Makieta mockup.mts zostaje jako zapis decyzji.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/coding-card/preview.mts
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { type CodingCard, type Dir, type TargetKind } from "../../../src/lib/coding/card.ts";
import { generateCodingCard } from "../../../src/lib/coding/generate.ts";
import { layoutCodingSheet } from "../../../src/lib/coding/layout.ts";
import {
  codingInstruction,
  codingLevelById,
  codingModeById,
  type CodingLevelId,
  type CodingModeId,
} from "../../../src/lib/coding/levels.ts";
import { CODING_SHEET } from "../../../src/lib/coding/sheet.ts";
import { instructionBoxHeight } from "../../../src/lib/sheet/speech.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const SHEET = CODING_SHEET;
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const OBSTACLE = "#9a9a9a";
const EXAMPLE = "#9a9a9a";

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

function text(x: number, y: number, size: number, body: string, extra = ""): string {
  return `<text x="${f(x)}" y="${f(y + size * SHEET.baselineShift)}" ${FONT} font-size="${f(size)}" text-anchor="middle"${extra}>${body}</text>`;
}

/** An arrow drawn with strokes, pointing right before the rotation. */
function arrow(cx: number, cy: number, length: number, dir: Dir, color: string): string {
  const rotation = { R: 0, D: 90, L: 180, U: 270 }[dir];
  const half = length / 2;
  const head = length * 0.32;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rotation})" stroke="${color}" stroke-width="${SHEET.arrowStroke}" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="${f(-half)}" y1="0" x2="${f(half)}" y2="0"/><polyline points="${f(half - head)},${f(-head)} ${f(half)},0 ${f(half - head)},${f(head)}"/></g>`;
}

function flag(x: number, y: number, size: number): string[] {
  const pole = x - size * 0.3;
  const top = y - size / 2;
  const width = size * 0.75;
  const height = size * 0.5;
  const out = [
    `<line x1="${f(pole)}" y1="${f(top)}" x2="${f(pole)}" y2="${f(y + size / 2)}" stroke="#000" stroke-width="${f(Math.max(0.8, size * 0.06))}" stroke-linecap="round"/>`,
  ];
  for (let i = 0; i < 4; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      out.push(
        `<rect x="${f(pole + (i * width) / 4)}" y="${f(top + (j * height) / 2)}" width="${f(width / 4)}" height="${f(height / 2)}" fill="${(i + j) % 2 ? "#fff" : "#000"}"/>`,
      );
    }
  }
  out.push(
    `<rect x="${f(pole)}" y="${f(top)}" width="${f(width)}" height="${f(height)}" fill="none" stroke="#000" stroke-width="0.4"/>`,
  );
  return out;
}

function picture(kind: TargetKind, cx: number, cy: number, r: number): string {
  const stroke = `fill="none" stroke="#000" stroke-width="${f(Math.max(0.9, r * 0.12))}" stroke-linejoin="round"`;
  if (kind === "circle") return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.8)}" ${stroke}/>`;
  if (kind === "star") {
    const points = Array.from({ length: 10 }, (_, i) => {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const radius = i % 2 ? r * 0.42 : r;
      return `${f(cx + radius * Math.cos(angle))},${f(cy + radius * Math.sin(angle))}`;
    });
    return `<polygon points="${points.join(" ")}" ${stroke}/>`;
  }
  return `<path transform="translate(${f(cx)} ${f(cy)}) scale(${f(r * 0.95)})" d="M 0 0.85 C -1.3 0 -0.7 -1 0 -0.4 C 0.7 -1 1.3 0 0 0.85 Z" fill="none" stroke="#000" stroke-width="${f(Math.max(0.9, r * 0.12) / (r * 0.95))}" stroke-linejoin="round"/>`;
}

function render(card: CodingCard, withCharacter: boolean): string {
  const level = codingLevelById(card.level);
  const mode = codingModeById(card.mode);
  const band = instructionBoxHeight(withCharacter, SHEET.plainInstructionSize);
  const layout = layoutCodingSheet(card, band);
  const instruction = codingInstruction(level, mode);
  const out: string[] = [`<rect width="210" height="297" fill="#fff"/>`];
  if (withCharacter) {
    out.push(
      `<rect x="${SHEET.inset}" y="${SHEET.inset}" width="${SHEET.pageWidth - 2 * SHEET.inset}" height="${band}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 2"/>`,
      `<text x="${SHEET.inset + 4}" y="${SHEET.inset + 6}" ${FONT} font-size="3.5" fill="#777">miejsce na postać i dymek</text>`,
      text(105, SHEET.inset + band / 2 + 2, 5, instruction, ' font-weight="bold"'),
    );
  } else {
    out.push(text(105, SHEET.inset + band / 2, SHEET.plainInstructionSize, instruction));
  }
  const g = layout.grid;
  for (let row = 0; row < g.rows; row += 1) {
    for (let col = 0; col < g.cols; col += 1) {
      out.push(
        `<rect x="${f(g.x + col * g.cell)}" y="${f(g.y + row * g.cell)}" width="${g.cell}" height="${g.cell}" fill="${card.blocked[row][col] ? OBSTACLE : "#fff"}" stroke="#000" stroke-width="${SHEET.gridStroke}"/>`,
      );
    }
  }
  out.push(
    `<rect x="${f(g.x)}" y="${f(g.y)}" width="${f(g.width)}" height="${f(g.height)}" fill="none" stroke="#000" stroke-width="${SHEET.frameStroke}"/>`,
  );
  const s = layout.start;
  if (withCharacter) {
    out.push(
      `<rect x="${f(s.x - s.characterSize / 2)}" y="${f(s.y - s.characterSize / 2)}" width="${f(s.characterSize)}" height="${f(s.characterSize)}" fill="none" stroke="#777" stroke-width="0.3" stroke-dasharray="1.5 1.5"/>`,
      text(s.x, s.y, s.textSize, "postać"),
    );
  } else {
    out.push(
      `<circle cx="${f(s.x)}" cy="${f(s.y)}" r="${f(s.circleRadius)}" fill="none" stroke="#000" stroke-width="1"/>`,
      text(s.x, s.y, s.textSize, "Start", ' font-weight="bold"'),
    );
  }
  if (card.mode === "zapisz") out.push(...flag(layout.goal.x, layout.goal.y, layout.goal.flagSize));
  for (const t of layout.targets) out.push(picture(t.kind, t.cx, t.cy, t.radius));
  for (const answer of layout.answers) {
    const r = answer.rect;
    out.push(
      `<rect x="${f(r.x)}" y="${f(r.y)}" width="${r.width}" height="${r.height}" rx="${SHEET.boxRadius}" fill="#fff" stroke="#000" stroke-width="${SHEET.boxStroke}"/>`,
    );
    if (!answer.filled) continue;
    const color = answer.example ? EXAMPLE : "#000";
    if (level.grouped) {
      out.push(
        text(
          r.x + r.width * 0.3,
          r.y + r.height / 2,
          r.height * 0.55,
          String(answer.count),
          ` font-weight="bold" fill="${color}"`,
        ),
        arrow(r.x + r.width * 0.68, r.y + r.height / 2, r.height * 0.55, answer.dir, color),
      );
    } else {
      out.push(arrow(r.x + r.width / 2, r.y + r.height / 2, r.width * 0.6, answer.dir, color));
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">\n${out.join("\n")}\n</svg>\n`;
}

const specs: { level: CodingLevelId; mode: CodingModeId; withCharacter: boolean }[] = [];
for (const withCharacter of [true, false]) {
  for (const level of ["poziom1", "poziom4"] as const) {
    for (const mode of ["zapisz", "wykonaj"] as const) specs.push({ level, mode, withCharacter });
  }
}

const blocks: string[] = [];
for (const [i, spec] of specs.entries()) {
  const level = codingLevelById(spec.level);
  const mode = codingModeById(spec.mode);
  const card = generateCodingCard(mulberry32(2026 + i * 13), null, level, mode);
  if (card === null) throw new Error(`no card for ${spec.level} ${spec.mode}`);
  const svg = render(card, spec.withCharacter);
  const file = `preview-${spec.mode}-${spec.level}${spec.withCharacter ? "" : "-brak"}.svg`;
  writeFileSync(`${OUT}/${file}`, svg);
  const info = `${card.path.length} kroków; odpowiedź: ${card.path.join("")}`;
  console.log(file, "|", info);
  const title = `${mode.label} · ${level.label}${spec.withCharacter ? "" : " · postać „Brak”"}`;
  blocks.push(
    `<figure><figcaption><b>${title}</b> (${level.description})<br><small>${info}</small></figcaption>${svg.replace(/width="210mm" height="297mm"/, "")}</figure>`,
  );
}
writeFileSync(
  `${OUT}/previews.html`,
  `<!doctype html><meta charset="utf-8"><title>Kodowanie – podgląd z kodu</title>
<style>body{font-family:Arial;margin:16px}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;border:1px solid #ccc;padding:8px}svg{width:100%;height:auto;border:1px solid #eee}figcaption{font-size:14px;margin-bottom:6px;min-height:4.5em}</style>
<h1>Kodowanie – podgląd z kodu (A4, drukuj w 100%)</h1>
<p>Rząd 1: z postacią (pas i pole startu tylko zaznaczone). Rząd 2: postać „Brak” (kółko „Start”). Zapisz: szare pola przykładu to pierwsze pola odpowiedzi.</p>
<div class="g">${blocks.join("")}</div>`,
);
