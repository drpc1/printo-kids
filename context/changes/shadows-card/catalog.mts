// Arkusz katalogu karty „Cienie” (S-47, faza 1) do akceptacji: każda rodzina w rzędzie, przy każdym obrazku jego
// cień i nazwa, a na osobnym arkuszu najbliższe pary cieni (najmniejsza różnica), żeby ocenić próg.
// Bierze prawdziwy katalog (src/lib/shadows/) i barwy z src/styles/global.css (--picture-*); nie jest kodem produktu.
// Uruchom z katalogu repo:
//   node --experimental-strip-types context/changes/shadows-card/catalog.mts
// Pisze catalog-warianty.svg, catalog-rozne.svg, catalog-pary.svg i catalog.html (PNG robi się z nich osobno).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SHADOW_FAMILIES, SHADOW_PICTURES } from "../../../src/lib/shadows/families.ts";
import { PICTURE_LINE_WIDTH, type ShadowPicture, type ShadowShape } from "../../../src/lib/shadows/picture-format.ts";
import { MIN_SHADOW_DIFFERENCE, shadowDifference, shadowMask } from "../../../src/lib/shadows/raster.ts";

const OUT = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(OUT, "../../..");
const FONT = 'font-family="Arial, Helvetica, sans-serif"';
const css = readFileSync(resolve(ROOT, "src/styles/global.css"), "utf8");
const COLOR = Object.fromEntries([...css.matchAll(/--picture-(\w+): (#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
const LINE = COLOR.line;
const SHADOW = "#111111";

/** One shape as SVG in one color; `pad` thickens it by a stroke of that width (the outline pass), 0 is the fill. */
function shapeSvg(shape: ShadowShape, color: string, pad: number): string {
  const edge = pad > 0 ? ` stroke="${color}" stroke-width="${pad}" stroke-linejoin="round"` : "";
  switch (shape.kind) {
    case "path":
      return `<path d="${shape.d}" fill="${color}"${edge}/>`;
    case "rect":
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${shape.rx ?? 0}" fill="${color}"${edge}/>`;
    case "circle":
      return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" fill="${color}"${edge}/>`;
    case "ellipse":
      return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" transform="rotate(${shape.rotate ?? 0} ${shape.cx} ${shape.cy})" fill="${color}"${edge}/>`;
    case "stroke":
      return `<path d="${shape.d}" fill="none" stroke="${color}" stroke-width="${shape.width - 2 * PICTURE_LINE_WIDTH + pad}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

/**
 * The picture or its shadow. Outlines of all body shapes go first and the fills on top, so two parts of one color
 * that overlap (broccoli florets, ears on a head) show no line inside the shape (decyzja 2026-11-20 o choince).
 * Details are drawn last with their own outline. The shadow is the body shapes in black.
 */
function pictureAt(picture: ShadowPicture, x: number, y: number, size: number, shadow: boolean): string {
  const body = picture.shapes.filter((shape) => shape.detail !== true);
  const details = picture.shapes.filter((shape) => shape.detail === true);
  const parts = shadow
    ? body.map((shape) => shapeSvg(shape, SHADOW, 2 * PICTURE_LINE_WIDTH))
    : [
        ...body.map((shape) => shapeSvg(shape, LINE, 2 * PICTURE_LINE_WIDTH)),
        ...body.map((shape) => shapeSvg(shape, COLOR[shape.paint], 0)),
        ...details.flatMap((shape) => [shapeSvg(shape, LINE, 2 * PICTURE_LINE_WIDTH), shapeSvg(shape, COLOR[shape.paint], 0)]),
      ];
  return `<g transform="translate(${x} ${y}) scale(${size / 100})">${parts.join("")}</g>`;
}

const CELL_W = 170;
const PIC = 72;

function familiesSheet(kind: "warianty" | "rozne", title: string): string {
  const families = SHADOW_FAMILIES.filter((family) => family.kind === kind);
  const rowH = PIC + 50;
  const width = 30 + 8 * CELL_W;
  const height = 60 + families.length * rowH;
  const parts: string[] = [`<text x="20" y="34" ${FONT} font-size="22" font-weight="bold">${title}</text>`];
  families.forEach((family, r) => {
    const top = 60 + r * rowH;
    parts.push(`<text x="20" y="${top + 14}" ${FONT} font-size="15" font-weight="bold" fill="#555">${family.label}</text>`);
    family.pictures.forEach((picture, c) => {
      const x = 20 + c * CELL_W;
      parts.push(pictureAt(picture, x, top + 20, PIC, false), pictureAt(picture, x + PIC + 6, top + 20, PIC, true));
      parts.push(`<text x="${x + PIC + 3}" y="${top + PIC + 36}" ${FONT} font-size="12" text-anchor="middle">${picture.label}</text>`);
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/>${parts.join("")}</svg>`;
}

function pairsSheet(): { svg: string; lines: string[] } {
  const masks = SHADOW_PICTURES.map((picture) => shadowMask(picture));
  const pairs: { d: number; a: ShadowPicture; b: ShadowPicture }[] = [];
  for (let i = 0; i < masks.length; i++) {
    for (let j = i + 1; j < masks.length; j++) {
      pairs.push({ d: shadowDifference(masks[i], masks[j]), a: SHADOW_PICTURES[i], b: SHADOW_PICTURES[j] });
    }
  }
  pairs.sort((p, q) => p.d - q.d);
  const top = pairs.slice(0, 12);
  const colW = 260;
  const rowH = PIC + 40;
  const width = 30 + 4 * colW;
  const height = 70 + 3 * rowH;
  const parts: string[] = [
    `<text x="20" y="34" ${FONT} font-size="20" font-weight="bold">Najbliższe pary cieni (próg ${Math.round(MIN_SHADOW_DIFFERENCE * 100)}%)</text>`,
  ];
  top.forEach((pair, k) => {
    const x = 20 + (k % 4) * colW;
    const y = 60 + Math.floor(k / 4) * rowH;
    parts.push(pictureAt(pair.a, x, y, PIC, true), pictureAt(pair.b, x + PIC + 10, y, PIC, true));
    parts.push(
      `<text x="${x}" y="${y + PIC + 18}" ${FONT} font-size="12">${pair.a.label} / ${pair.b.label}: ${(pair.d * 100).toFixed(1)}%</text>`,
    );
  });
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/>${parts.join("")}</svg>`,
    lines: top.map((pair) => `${pair.a.label} / ${pair.b.label}: ${(pair.d * 100).toFixed(1)}%`),
  };
}

writeFileSync(resolve(OUT, "catalog-warianty.svg"), familiesSheet("warianty", "Rodziny wariantów jednej rzeczy (trudny)"));
writeFileSync(resolve(OUT, "catalog-rozne.svg"), familiesSheet("rozne", "Rodziny różnych rzeczy o podobnym kształcie (średni)"));
const pairs = pairsSheet();
writeFileSync(resolve(OUT, "catalog-pary.svg"), pairs.svg);
writeFileSync(
  resolve(OUT, "catalog.html"),
  `<!doctype html><meta charset="utf-8"><title>S-47 katalog cieni</title>
<style>body{font:14px Arial;margin:16px;background:#eee}img{max-width:100%;background:#fff;box-shadow:0 1px 4px #0003;margin:8px 0;display:block}</style>
<p>${SHADOW_PICTURES.length} obrazków w ${SHADOW_FAMILIES.length} rodzinach. Przy każdym obrazku jego cień.</p>
<img src="catalog-warianty.svg"><img src="catalog-rozne.svg"><img src="catalog-pary.svg">`,
);
console.log(`wrote 3 SVG + catalog.html; closest pairs:\n${pairs.lines.slice(0, 5).join("\n")}`);
