import { PICTURE_BOX, type ShadowPicture, type ShadowShape } from "./picture-format.ts";

/**
 * Two shadows that may stand on one card differ in at least this share of their joint outline
 * (|A xor B| / |A or B| on the mask). Starting value, set on the catalog sheet; the print confirms it (PRD OQ 21).
 */
export const MIN_SHADOW_DIFFERENCE = 0.08;

/** Side of the mask grid used to compare shadows. */
export const MASK_SIZE = 64;

type Point = readonly [number, number];

/** Line segments a Bézier curve is cut into before testing points against it. */
const CURVE_STEPS = 12;

/** The subpaths of `d` as polylines, curves flattened. Only absolute M L H V C Q Z are understood. */
export function pathPolylines(d: string): Point[][] {
  const tokens = d.match(/[MLHVCQZ]|-?\d*\.?\d+/g) ?? [];
  const lines: Point[][] = [];
  let current: Point[] = [];
  let at: Point = [0, 0];
  let start: Point = [0, 0];
  let command = "";
  let i = 0;
  const num = (): number => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLHVCQZ]/.test(tokens[i])) {
      command = tokens[i++];
    }
    switch (command) {
      case "M":
        if (current.length > 0) lines.push(current);
        at = [num(), num()];
        start = at;
        current = [at];
        command = "L";
        break;
      case "L":
        at = [num(), num()];
        current.push(at);
        break;
      case "H":
        at = [num(), at[1]];
        current.push(at);
        break;
      case "V":
        at = [at[0], num()];
        current.push(at);
        break;
      case "C": {
        const p0 = at;
        const p1: Point = [num(), num()];
        const p2: Point = [num(), num()];
        const p3: Point = [num(), num()];
        for (let s = 1; s <= CURVE_STEPS; s++) {
          const t = s / CURVE_STEPS;
          const u = 1 - t;
          current.push([
            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
          ]);
        }
        at = p3;
        break;
      }
      case "Q": {
        const p0 = at;
        const p1: Point = [num(), num()];
        const p2: Point = [num(), num()];
        for (let s = 1; s <= CURVE_STEPS; s++) {
          const t = s / CURVE_STEPS;
          const u = 1 - t;
          current.push([
            u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
          ]);
        }
        at = p2;
        break;
      }
      case "Z":
        current.push(start);
        at = start;
        command = "";
        break;
      default:
        throw new Error(`Unsupported path data near token ${i}: ${d}`);
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function insidePolygon(x: number, y: number, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [xa, ya] = polygon[a];
    const [xb, yb] = polygon[b];
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) inside = !inside;
  }
  return inside;
}

function distanceToSegment(x: number, y: number, [xa, ya]: Point, [xb, yb]: Point): number {
  const dx = xb - xa;
  const dy = yb - ya;
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((x - xa) * dx + (y - ya) * dy) / length));
  return Math.hypot(x - (xa + t * dx), y - (ya + t * dy));
}

/** A point test for one shape; paths are flattened once. */
export function shapeContains(shape: ShadowShape): (x: number, y: number) => boolean {
  switch (shape.kind) {
    case "path": {
      const polygons = pathPolylines(shape.d);
      return (x, y) => polygons.some((polygon) => insidePolygon(x, y, polygon));
    }
    case "stroke": {
      const lines = pathPolylines(shape.d);
      const half = shape.width / 2;
      return (x, y) =>
        lines.some((line) => line.some((p, k) => k > 0 && distanceToSegment(x, y, line[k - 1], p) <= half));
    }
    case "rect":
      return (x, y) => x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
    case "circle":
      return (x, y) => Math.hypot(x - shape.cx, y - shape.cy) <= shape.r;
    case "ellipse": {
      const angle = ((shape.rotate ?? 0) * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return (x, y) => {
        const dx = x - shape.cx;
        const dy = y - shape.cy;
        const u = dx * cos + dy * sin;
        const v = -dx * sin + dy * cos;
        return (u / shape.rx) ** 2 + (v / shape.ry) ** 2 <= 1;
      };
    }
  }
}

/** Cells of an n×n grid over the drawing box covered by the given shapes, row by row (cell centers are tested). */
export function shapesMask(shapes: readonly ShadowShape[], n = MASK_SIZE): boolean[] {
  const tests = shapes.map(shapeContains);
  const mask = new Array<boolean>(n * n).fill(false);
  for (let row = 0; row < n; row++) {
    const y = ((row + 0.5) * PICTURE_BOX) / n;
    for (let col = 0; col < n; col++) {
      const x = ((col + 0.5) * PICTURE_BOX) / n;
      mask[row * n + col] = tests.some((test) => test(x, y));
    }
  }
  return mask;
}

/** The shadow of a picture on an n×n grid: every shape except the details. */
export function shadowMask(picture: ShadowPicture, n = MASK_SIZE): boolean[] {
  return shapesMask(
    picture.shapes.filter((shape) => shape.detail !== true),
    n,
  );
}

/** |a xor b| / |a or b| of two masks of one size; 0 for two empty masks. */
export function shadowDifference(a: readonly boolean[], b: readonly boolean[]): number {
  let xor = 0;
  let union = 0;
  for (let k = 0; k < a.length; k++) {
    if (a[k] !== b[k]) xor++;
    if (a[k] || b[k]) union++;
  }
  return union === 0 ? 0 : xor / union;
}
