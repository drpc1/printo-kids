import { iconById, type Icon } from "../odd-one-out/icons.ts";
import type { SizeOrderCard, SizeOrderPicture } from "./types.ts";
import { sizeOrderLevelById, type SizeOrderLevel } from "./levels.ts";
import { SIZE_ORDER_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin. */
const EPSILON = 1e-6;

export interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The points a path passes through (the end of each segment, arcs included); enough for a bounding box. */
function pathPoints(d: string): [number, number][] {
  const tokens = d.match(/[MLQCAZ]|-?\d*\.?\d+/gi) ?? [];
  const points: [number, number][] = [];
  let command = "";
  let numbers: number[] = [];
  const flush = () => {
    if (command === "A") {
      for (let i = 0; i + 6 < numbers.length; i += 7) points.push([numbers[i + 5], numbers[i + 6]]);
    } else {
      for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
    }
    numbers = [];
  };
  for (const token of tokens) {
    if (/[A-Z]/i.test(token)) {
      flush();
      command = token.toUpperCase();
    } else numbers.push(Number(token));
  }
  flush();
  return points;
}

/** The box around the ink figures of an icon (paper figures are the white details inside it). */
export function iconBounds(icon: Icon): Bounds {
  const b: Bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const add = (x: number, y: number) => {
    b.x0 = Math.min(b.x0, x);
    b.y0 = Math.min(b.y0, y);
    b.x1 = Math.max(b.x1, x);
    b.y1 = Math.max(b.y1, y);
  };
  for (const f of icon.figures) {
    if (f.tone !== "ink") continue;
    if (f.kind === "circle") {
      add(f.cx - f.r, f.cy - f.r);
      add(f.cx + f.r, f.cy + f.r);
    } else if (f.kind === "ellipse") {
      // A rotated ellipse is bounded by the larger radius all round.
      const r = Math.max(f.rx, f.ry);
      const [rx, ry] = f.rotate ? [r, r] : [f.rx, f.ry];
      add(f.cx - rx, f.cy - ry);
      add(f.cx + rx, f.cy + ry);
    } else if (f.kind === "rect") {
      add(f.x, f.y);
      add(f.x + f.width, f.y + f.height);
    } else if (f.kind === "polygon") {
      for (const [x, y] of f.points) add(x, y);
    } else if (f.kind === "line") {
      add(f.x1, f.y1);
      add(f.x2, f.y2);
    } else {
      const half = (f.strokeWidth ?? 0) / 2;
      pathPoints(f.d).forEach(([x, y]) => {
        add(x - half, y - half);
        add(x + half, y + half);
      });
    }
  }
  return b;
}

/** Width over height of a picture: a shape is square, an icon is as wide as its ink figures. Null for an unknown icon. */
export function pictureAspect(picture: SizeOrderPicture): number | null {
  if (picture.kind === "shape") return 1;
  const icon = iconById(picture.id);
  if (icon === undefined) return null;
  const b = iconBounds(icon);
  return (b.x1 - b.x0) / (b.y1 - b.y0);
}

export interface SizeOrderGeometry {
  /** Top of the area under the instruction. */
  areaTop: number;
  rowHeight: number;
  slotWidth: number;
  /** Height of the tallest picture before a wide icon shrinks the row. */
  tallest: number;
}

export function sizeOrderGeometry(level: SizeOrderLevel, instructionBoxHeight: number): SizeOrderGeometry {
  const sheet = SIZE_ORDER_SHEET;
  const areaTop = sheet.inset + instructionBoxHeight + sheet.bandGap;
  const rowHeight = (sheet.pageHeight - sheet.inset - areaTop) / level.rowCount;
  const slotWidth = (sheet.pageWidth - 2 * sheet.inset) / level.itemCount;
  const tallest = rowHeight - sheet.answerBox.height - sheet.baselineToBox - 2 * sheet.rowPad;
  return { areaTop, rowHeight, slotWidth, tallest };
}

/** The tallest picture of a row: a wide icon shrinks the whole row so its largest copy fits the slot. */
export function rowTallestMm(picture: SizeOrderPicture, geometry: SizeOrderGeometry): number | null {
  const aspect = pictureAspect(picture);
  if (aspect === null) return null;
  return Math.min(geometry.tallest, (geometry.slotWidth * SIZE_ORDER_SHEET.slotShare) / aspect);
}

/** Smallest gap between two neighbouring heights of a level, as a share of the tallest picture. */
export function smallestGapShare(level: SizeOrderLevel): number {
  let gap = Infinity;
  for (let i = 1; i < level.heights.length; i++) gap = Math.min(gap, level.heights[i] - level.heights[i - 1]);
  return gap;
}

export interface SizeOrderSlot {
  /** Centre of the picture and of its answer box. */
  cx: number;
  /** Height and width of the picture, mm. */
  height: number;
  width: number;
  /** The answer box under the picture. */
  box: { x: number; y: number; width: number; height: number };
}

export interface SizeOrderRowLayout {
  top: number;
  /** The line the pictures stand on. */
  baseline: number;
  slots: SizeOrderSlot[];
}

export interface SizeOrderSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  rows: SizeOrderRowLayout[];
}

/**
 * Places the instruction and the rows. Pictures stand on a common baseline, centred in equal slots, each with an
 * answer box under it. Throws when something would cross the 10 mm margin or stand above its row.
 */
export function layoutSizeOrderSheet(card: SizeOrderCard, instructionBoxHeight: number): SizeOrderSheetLayout {
  const sheet = SIZE_ORDER_SHEET;
  const level = sizeOrderLevelById(card.levelId);
  const geometry = sizeOrderGeometry(level, instructionBoxHeight);
  const boxWidth = Math.min(sheet.answerBox.maxWidth, geometry.slotWidth - sheet.answerBox.slotMargin);
  const left = sheet.inset;
  const right = sheet.pageWidth - sheet.inset;

  const rows = card.rows.map((row, index): SizeOrderRowLayout => {
    const top = geometry.areaTop + index * geometry.rowHeight;
    const boxY = top + geometry.rowHeight - sheet.answerBox.height - sheet.rowPad;
    const baseline = boxY - sheet.baselineToBox;
    const rowTallest = rowTallestMm(row.picture, geometry);
    const aspect = pictureAspect(row.picture);
    if (rowTallest === null || aspect === null) {
      throw new Error(`size-order row ${index}: unknown picture ${row.picture.id}`);
    }
    const slots = row.heights.map((share, slot): SizeOrderSlot => {
      const cx = left + geometry.slotWidth * (slot + 0.5);
      const height = share * rowTallest;
      const width = height * aspect;
      if (cx - width / 2 < left - EPSILON || cx + width / 2 > right + EPSILON) {
        throw new Error(`size-order row ${index}: picture ${slot + 1} crosses the margin`);
      }
      if (baseline - height < top + sheet.rowPad - EPSILON) {
        throw new Error(`size-order row ${index}: picture ${slot + 1} stands above its row`);
      }
      return {
        cx,
        height,
        width,
        box: { x: cx - boxWidth / 2, y: boxY, width: boxWidth, height: sheet.answerBox.height },
      };
    });
    return { top, baseline, slots };
  });

  const last = rows.at(-1);
  if (last !== undefined && last.top + geometry.rowHeight > sheet.pageHeight - sheet.inset + EPSILON) {
    throw new Error("size-order rows cross the bottom margin");
  }
  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    rows,
  };
}
