// Wspólny rysownik obrazków karty „Cienie” dla skryptów tej zmiany (catalog.mts, preview.mts); nie jest kodem produktu.
// Barwy z src/styles/global.css (--picture-*), bo poza stroną nie ma tokenów.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PICTURE_LINE_WIDTH, type ShadowPicture, type ShadowShape } from "../../../src/lib/shadows/picture-format.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const css = readFileSync(resolve(ROOT, "src/styles/global.css"), "utf8");
const COLOR = Object.fromEntries([...css.matchAll(/--picture-(\w+): (#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
const LINE = COLOR.line;
export const SHADOW = "#111111";

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
export function pictureAt(picture: ShadowPicture, x: number, y: number, size: number, shadow: boolean): string {
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

