/**
 * The drawing format of the shadows card ("Cienie"). A picture is a list of shapes in a 100×100 box, each painted in
 * one color of the palette; the outline is `--picture-line`. A shape marked `detail` lies inside the outline (a
 * window, a seed, an eye): the picture shows it, its shadow does not. The shadow is every other shape, all black.
 */

/** Names of the palette; each is the CSS token `--picture-<name>` in src/styles/global.css. */
export const PICTURE_COLORS = [
  "green",
  "darkgreen",
  "leaf",
  "lime",
  "brown",
  "darkbrown",
  "red",
  "darkred",
  "pink",
  "yellow",
  "orange",
  "sky",
  "blue",
  "navy",
  "teal",
  "purple",
  "wall",
  "sand",
  "cream",
  "white",
  "gray",
  "darkgray",
  "black",
] as const;

export type PictureColor = (typeof PICTURE_COLORS)[number];

/** Side of the drawing box; every coordinate of a shape lies in 0…PICTURE_BOX. */
export const PICTURE_BOX = 100;

/** Outline width of a filled shape, in box units. */
export const PICTURE_LINE_WIDTH = 1.6;

interface ShapeBase {
  paint: PictureColor;
  /** Inside the outline; drawn on the picture, left out of the shadow. */
  detail?: boolean;
}

export type ShadowShape = ShapeBase &
  (
    | {
        kind: "path";
        /** Absolute commands only: M L H V C Q Z (checked by the catalog test). */
        d: string;
      }
    | { kind: "rect"; x: number; y: number; width: number; height: number; rx?: number }
    | { kind: "circle"; cx: number; cy: number; r: number }
    | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; rotate?: number }
    | {
        /** A thick open line, e.g. a mug handle or a balloon string: `width` wide, outlined like the other shapes. */
        kind: "stroke";
        d: string;
        width: number;
      }
  );

export interface ShadowPicture {
  /** Unique in the whole catalog. */
  id: string;
  /** Polish name; only the catalog sheet and tests show it, the card never does. */
  label: string;
  shapes: readonly ShadowShape[];
}

export type ShadowFamilyKind = "warianty" | "rozne";

export interface ShadowFamily {
  id: string;
  label: string;
  /** "warianty": variants of one thing (the hard level); "rozne": different things of a similar shape (the medium level). */
  kind: ShadowFamilyKind;
  pictures: readonly ShadowPicture[];
}

// Small builders so the drawings stay short. Each returns one shape.
export const path = (d: string, paint: PictureColor, detail = false): ShadowShape => ({
  kind: "path",
  d,
  paint,
  detail,
});
export const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  paint: PictureColor,
  rx = 0,
  detail = false,
): ShadowShape => ({ kind: "rect", x, y, width, height, rx, paint, detail });
export const circle = (cx: number, cy: number, r: number, paint: PictureColor, detail = false): ShadowShape => ({
  kind: "circle",
  cx,
  cy,
  r,
  paint,
  detail,
});
export const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  paint: PictureColor,
  rotate = 0,
  detail = false,
): ShadowShape => ({ kind: "ellipse", cx, cy, rx, ry, rotate, paint, detail });
export const stroke = (d: string, width: number, paint: PictureColor): ShadowShape => ({
  kind: "stroke",
  d,
  width,
  paint,
});
