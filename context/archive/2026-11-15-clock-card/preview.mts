// Podgląd karty „Zegar” (S-41, faza 2): rysuje karty z prawdziwych modułów produktu (poziomy, tryby, generator, układ,
// rysunek tarczy, stałe druku) w skali 1:1 (A4, 210 × 297 mm), z przerywanym pasem na postać i dymek. Każdy tryb na
// Poziomie 1, na Poziomie 4 (kreski minut) i na Poziomie 2 z „24 h” (pora dnia pod tarczą), jak w makiecie.
// Pisze preview-*.svg i previews.html (oba w .gitignore tego folderu; commitowany jest tylko ten skrypt). Nie jest kodem
// produktu: importuje tylko src/lib/clock/* i src/lib/sheet/speech.ts i nie ma własnych wymiarów rysunku. Kolory to zwykła
// czerń i biel (strona użyje tokenów). Makieta mockup.mts zostaje jako zapis decyzji.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/clock-card/preview.mts
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { formatClockTime, partOfDay, type ClockCard } from "../../../src/lib/clock/card.ts";
import { generateClockCard } from "../../../src/lib/clock/generate.ts";
import { drawDial, layoutClockSheet, type ClockLine, type ClockRect } from "../../../src/lib/clock/layout.ts";
import { clockLevelById, clockModeById, type ClockLevelId, type ClockModeId } from "../../../src/lib/clock/levels.ts";
import { CLOCK_SHEET } from "../../../src/lib/clock/sheet.ts";
import { instructionBoxHeight } from "../../../src/lib/sheet/speech.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const SHEET = CLOCK_SHEET;
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const BAND = instructionBoxHeight(true, SHEET.plainInstructionSize);

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

function line(l: ClockLine, cap = ""): string {
  return `<line x1="${f(l.x1)}" y1="${f(l.y1)}" x2="${f(l.x2)}" y2="${f(l.y2)}" stroke="#000" stroke-width="${f(l.stroke)}"${cap}/>`;
}

function rect(r: ClockRect, stroke: number, radius = 0): string {
  return `<rect x="${f(r.x)}" y="${f(r.y)}" width="${f(r.width)}" height="${f(r.height)}"${radius ? ` rx="${radius}"` : ""} fill="#fff" stroke="#000" stroke-width="${stroke}"/>`;
}

function digital(frame: ClockRect, body: string): string[] {
  const d = SHEET.digital;
  return [
    rect(frame, d.stroke, d.radius),
    text(frame.x + frame.width / 2, frame.y + frame.height / 2, d.textSize, body, ' font-weight="bold"'),
  ];
}

function render(card: ClockCard): string {
  const level = clockLevelById(card.level);
  const mode = clockModeById(card.mode);
  const layout = layoutClockSheet(card, BAND);
  const out: string[] = [
    `<rect width="210" height="297" fill="#fff"/>`,
    `<rect x="${SHEET.inset}" y="${SHEET.inset}" width="${SHEET.pageWidth - 2 * SHEET.inset}" height="${BAND}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="2 2"/>`,
    `<text x="${SHEET.inset + 4}" y="${SHEET.inset + 6}" ${FONT} font-size="3.5" fill="#777">miejsce na postać i dymek</text>`,
    text(105, SHEET.inset + BAND / 2 + 2, 6, mode.instruction, ' font-weight="bold"'),
  ];
  for (const place of layout.dials) {
    const time = card.times[place.time];
    const drawing = drawDial(
      place.cx,
      place.cy,
      layout.radius,
      level.minuteTicks,
      card.mode === "dorysuj" ? null : time,
    );
    out.push(
      `<circle cx="${f(place.cx)}" cy="${f(place.cy)}" r="${f(layout.radius)}" fill="#fff" stroke="#000" stroke-width="${drawing.rimStroke}"/>`,
    );
    for (const tick of drawing.ticks) out.push(line(tick));
    if (drawing.hands) {
      out.push(
        line(drawing.hands.hour, ' stroke-linecap="round"'),
        line(drawing.hands.minute, ' stroke-linecap="round"'),
      );
    }
    for (const n of drawing.numbers) {
      out.push(
        text(
          n.x,
          n.y,
          n.size,
          n.text,
          ` font-weight="bold" stroke="#fff" stroke-width="${f(n.halo)}" stroke-linejoin="round" paint-order="stroke"`,
        ),
      );
    }
    out.push(`<circle cx="${f(place.cx)}" cy="${f(place.cy)}" r="${f(drawing.centreDot)}" fill="#000"/>`);
    if (place.partOfDay)
      out.push(text(place.partOfDay.x, place.partOfDay.y, SHEET.partOfDaySize, place.partOfDay.text));
    if (place.answer) {
      out.push(rect(place.answer.hours, SHEET.answerBox.stroke), rect(place.answer.minutes, SHEET.answerBox.stroke));
      out.push(text(place.answer.colon.x, place.answer.colon.y, SHEET.answerBox.colonSize, ":", ' font-weight="bold"'));
    }
    if (place.digital) out.push(...digital(place.digital, formatClockTime(time)));
    if (place.dot)
      out.push(`<circle cx="${f(place.dot.x)}" cy="${f(place.dot.y)}" r="${SHEET.dotRadius}" fill="#000"/>`);
  }
  for (const clock of layout.digitals) {
    out.push(...digital(clock.frame, formatClockTime(card.times[clock.time])));
    out.push(`<circle cx="${f(clock.dot.x)}" cy="${f(clock.dot.y)}" r="${SHEET.dotRadius}" fill="#000"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">\n${out.join("\n")}\n</svg>\n`;
}

const specs: { level: ClockLevelId; mode: ClockModeId; h24: boolean }[] = [];
for (const [level, h24] of [
  ["poziom1", false],
  ["poziom4", false],
  ["poziom2", true],
] as const) {
  for (const mode of ["odczytaj", "dorysuj", "polacz"] as const) specs.push({ level, mode, h24 });
}

const blocks: string[] = [];
for (const [i, spec] of specs.entries()) {
  const level = clockLevelById(spec.level);
  const mode = clockModeById(spec.mode);
  const card = generateClockCard(mulberry32(2026 + i * 13), null, level, mode, spec.h24);
  if (card === null) throw new Error(`no card for ${spec.level} ${spec.mode}`);
  const svg = render(card);
  const file = `preview-${spec.mode}-${spec.level}${spec.h24 ? "-24h" : ""}.svg`;
  writeFileSync(`${OUT}/${file}`, svg);
  const radius = layoutClockSheet(card, BAND).radius;
  const answers = card.times
    .map((time, dial) => {
      const word = spec.h24 ? ` (${partOfDay(time.h)})` : "";
      const row = spec.mode === "polacz" ? ` → ${card.order.indexOf(dial) + 1}.` : "";
      return `${formatClockTime(time)}${word}${row}`;
    })
    .join(", ");
  const info = `tarcza ⌀ ${(radius * 2).toFixed(1)} mm, liczby ${(radius * SHEET.numberSize).toFixed(1)} mm; odpowiedzi: ${answers}`;
  console.log(file, "|", info);
  const title = `${mode.label} · ${level.label}${spec.h24 ? " · 24 h" : ""}`;
  blocks.push(
    `<figure><figcaption><b>${title}</b> (${level.description})<br><small>${info}</small></figcaption>${svg.replace(/width="210mm" height="297mm"/, "")}</figure>`,
  );
}
writeFileSync(
  `${OUT}/previews.html`,
  `<!doctype html><meta charset="utf-8"><title>Zegar – podgląd z kodu</title>
<style>body{font-family:Arial;margin:16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;border:1px solid #ccc;padding:8px}svg{width:100%;height:auto;border:1px solid #eee}figcaption{font-size:14px;margin-bottom:6px;min-height:4.5em}</style>
<h1>Zegar – podgląd z kodu (A4, drukuj w 100%)</h1>
<p>Rzędy: Poziom 1 · Poziom 4 (kreski minut) · Poziom 2 z „24 h” (pora dnia pod tarczą). Pas postaci jest tylko zaznaczony.</p>
<div class="g">${blocks.join("")}</div>`,
);
