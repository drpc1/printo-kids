export type SequenceShape = "kolo" | "kwadrat" | "trojkat" | "gwiazdka";

export const SEQUENCE_SHAPES: readonly SequenceShape[] = ["kolo", "kwadrat", "trojkat", "gwiazdka"];

export type SequenceShapeOutline =
  { kind: "circle"; cx: number; cy: number; r: number } | { kind: "polygon"; points: string };

/**
 * The SVG primitive of a shape centered on (cx, cy) and inscribed in a square of side `size`. The page component and
 * the catalog thumbnail script both read this, so the thumbnail cannot drift from the printed card. The proportions
 * are tuned so that no shape looks larger than the others.
 */
export function sequenceShapeOutline(shape: SequenceShape, cx: number, cy: number, size: number): SequenceShapeOutline {
  const half = size / 2;
  switch (shape) {
    case "kolo":
      return { kind: "circle", cx, cy, r: half };
    case "kwadrat": {
      const side = half * 0.88;
      return {
        kind: "polygon",
        points: polygonPoints([
          [cx - side, cy - side],
          [cx + side, cy - side],
          [cx + side, cy + side],
          [cx - side, cy + side],
        ]),
      };
    }
    case "trojkat": {
      const height = size * 0.9;
      return {
        kind: "polygon",
        points: polygonPoints([
          [cx, cy - height / 2],
          [cx + half, cy + height / 2],
          [cx - half, cy + height / 2],
        ]),
      };
    }
    case "gwiazdka": {
      // The bounding box of a five-point star runs from -R to R * cos(36 deg); shifting it centers it on cy.
      const shift = (half - half * Math.cos(Math.PI / 5)) / 2;
      const points: [number, number][] = [];
      for (let index = 0; index < 10; index += 1) {
        const radius = index % 2 === 0 ? half : half * 0.42;
        const angle = -Math.PI / 2 + (index * Math.PI) / 5;
        points.push([cx + radius * Math.cos(angle), cy + shift + radius * Math.sin(angle)]);
      }
      return { kind: "polygon", points: polygonPoints(points) };
    }
  }
}

function polygonPoints(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
