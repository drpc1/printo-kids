/**
 * The object icons of the "Który nie pasuje" category rule: simple vector pictures in a 100 × 100 box, kept as data
 * (a list of plain figures) so the page and the thumbnail script draw them without any SVG text. A figure has a tone:
 * `ink` is the silhouette, `paper` is a detail cut out of it (a window, an eye). The page maps the tones to theme
 * colors, the thumbnail script to black and white.
 */
export type IconCategory = "zwierzeta" | "jedzenie" | "przyroda" | "kosmos" | "budowle";

export const ICON_CATEGORIES: readonly IconCategory[] = ["zwierzeta", "jedzenie", "przyroda", "kosmos", "budowle"];

export const ICON_CATEGORY_NAMES: Record<IconCategory, string> = {
  zwierzeta: "Zwierzęta",
  jedzenie: "Jedzenie",
  przyroda: "Przyroda",
  kosmos: "Kosmos i maszyny",
  budowle: "Domy i budowle",
};

export type IconTone = "ink" | "paper";

export type IconPoint = readonly [number, number];

/** Side of the box every icon is drawn in. */
export const ICON_BOX = 100;

export type IconFigure =
  | { kind: "circle"; cx: number; cy: number; r: number; tone: IconTone }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; rotate?: number; tone: IconTone }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx?: number; rotate?: number; tone: IconTone }
  | { kind: "polygon"; points: readonly IconPoint[]; tone: IconTone }
  /** Filled outline, or a stroked line set when `strokeWidth` is given. Absolute M, L, Q, C, A and Z only. */
  | { kind: "path"; d: string; strokeWidth?: number; tone: IconTone }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; strokeWidth: number; tone: IconTone };

export interface Icon {
  id: string;
  /** For tests and comments only; the card never shows a name. */
  name: string;
  category: IconCategory;
  figures: readonly IconFigure[];
}

// `rotate` turns a figure around its own center, in degrees.
const circle = (tone: IconTone, cx: number, cy: number, r: number): IconFigure => ({ kind: "circle", cx, cy, r, tone });
const ellipse = (tone: IconTone, cx: number, cy: number, rx: number, ry: number, rotate?: number): IconFigure =>
  rotate === undefined ? { kind: "ellipse", cx, cy, rx, ry, tone } : { kind: "ellipse", cx, cy, rx, ry, rotate, tone };
const rect = (
  tone: IconTone,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { rx?: number; rotate?: number } = {},
): IconFigure => ({ kind: "rect", x, y, width, height, ...options, tone });
const polygon = (tone: IconTone, ...flat: number[]): IconFigure => {
  if (flat.length % 2 !== 0 || flat.length < 6) {
    throw new Error(`A polygon needs at least three x,y pairs, got ${flat.length} numbers`);
  }
  const points: IconPoint[] = [];
  for (let index = 0; index < flat.length; index += 2) {
    points.push([flat[index], flat[index + 1]]);
  }
  return { kind: "polygon", points, tone };
};
const outline = (tone: IconTone, d: string): IconFigure => ({ kind: "path", d, tone });
const stroked = (tone: IconTone, strokeWidth: number, d: string): IconFigure => ({
  kind: "path",
  d,
  strokeWidth,
  tone,
});
const line = (tone: IconTone, strokeWidth: number, x1: number, y1: number, x2: number, y2: number): IconFigure => ({
  kind: "line",
  x1,
  y1,
  x2,
  y2,
  strokeWidth,
  tone,
});

const SKYSCRAPER_WINDOWS: IconFigure[] = [0, 1, 2, 3, 4, 5].flatMap((row) =>
  [0, 1, 2].map((column) => rect("paper", 34 + column * 12, 10 + row * 13, 8, 8)),
);

export const ICONS: readonly Icon[] = [
  // Zwierzęta
  {
    id: "kot",
    name: "kot",
    category: "zwierzeta",
    figures: [
      polygon("ink", 20, 44, 28, 6, 48, 30),
      polygon("ink", 80, 44, 72, 6, 52, 30),
      circle("ink", 50, 56, 34),
      ellipse("paper", 37, 50, 5, 7),
      ellipse("paper", 63, 50, 5, 7),
      polygon("paper", 45, 63, 55, 63, 50, 69),
    ],
  },
  {
    id: "ryba",
    name: "ryba",
    category: "zwierzeta",
    figures: [ellipse("ink", 42, 50, 34, 22), polygon("ink", 66, 50, 96, 26, 96, 74), circle("paper", 27, 44, 5)],
  },
  {
    id: "ptak",
    name: "ptak",
    category: "zwierzeta",
    figures: [
      ellipse("ink", 54, 58, 30, 22),
      circle("ink", 30, 36, 16),
      polygon("ink", 16, 32, 2, 40, 16, 44),
      polygon("ink", 78, 50, 98, 36, 94, 64),
      rect("ink", 44, 76, 5, 18),
      rect("ink", 58, 76, 5, 18),
      circle("paper", 27, 33, 4),
    ],
  },
  {
    id: "zolw",
    name: "żółw",
    category: "zwierzeta",
    figures: [
      outline("ink", "M10,66 A38,36 0 0 1 86,66 Z"),
      circle("ink", 88, 62, 10),
      rect("ink", 20, 62, 14, 18, { rx: 3 }),
      rect("ink", 62, 62, 14, 18, { rx: 3 }),
      polygon("ink", 12, 60, 2, 68, 12, 68),
      circle("paper", 91, 59, 2.5),
      stroked("paper", 3, "M30,64 L38,44 L58,44 L66,64 M48,30 L48,44"),
    ],
  },
  {
    id: "krolik",
    name: "królik",
    category: "zwierzeta",
    figures: [
      ellipse("ink", 38, 26, 9, 24),
      ellipse("ink", 62, 26, 9, 24),
      circle("ink", 50, 66, 28),
      ellipse("paper", 38, 22, 3.5, 15),
      ellipse("paper", 62, 22, 3.5, 15),
      circle("paper", 40, 60, 4.5),
      circle("paper", 60, 60, 4.5),
      ellipse("paper", 50, 73, 5, 3.5),
    ],
  },
  // Jedzenie
  {
    id: "jablko",
    name: "jabłko",
    category: "jedzenie",
    figures: [
      circle("ink", 37, 58, 28),
      circle("ink", 63, 58, 28),
      circle("ink", 50, 68, 27),
      rect("ink", 47, 12, 6, 22, { rx: 2 }),
      ellipse("ink", 67, 22, 13, 6, -25),
      ellipse("paper", 34, 52, 5, 9, 20),
    ],
  },
  {
    id: "gruszka",
    name: "gruszka",
    category: "jedzenie",
    figures: [
      circle("ink", 50, 68, 27),
      circle("ink", 50, 36, 16),
      polygon("ink", 34, 38, 66, 38, 76, 66, 24, 66),
      rect("ink", 47, 6, 6, 18, { rx: 2 }),
      ellipse("ink", 63, 14, 10, 5, -25),
    ],
  },
  {
    id: "marchewka",
    name: "marchewka",
    category: "jedzenie",
    figures: [
      polygon("ink", 34, 30, 66, 30, 50, 98),
      polygon("ink", 44, 32, 30, 4, 50, 26),
      polygon("ink", 50, 32, 50, 2, 56, 26),
      polygon("ink", 56, 32, 70, 4, 50, 26),
      stroked("paper", 3, "M38,46 L48,46 M52,60 L60,60 M42,72 L50,72"),
    ],
  },
  {
    id: "lody",
    name: "lody",
    category: "jedzenie",
    figures: [
      polygon("ink", 30, 50, 70, 50, 50, 98),
      circle("ink", 50, 38, 24),
      circle("ink", 50, 12, 6),
      stroked("paper", 2.5, "M36,56 L58,78 M64,56 L42,78 M48,56 L62,70 M52,56 L38,70"),
    ],
  },
  {
    id: "banan",
    name: "banan",
    category: "jedzenie",
    figures: [
      // The mockup's thick banana: about 21 units across in the middle.
      outline("ink", "M6,30 Q48,112 94,30 L84,20 Q50,80 18,20 Z"),
      rect("ink", 84, 16, 8, 12, { rx: 2, rotate: 30 }),
    ],
  },
  // Przyroda
  {
    id: "drzewo",
    name: "drzewo",
    category: "przyroda",
    figures: [
      circle("ink", 50, 34, 27),
      circle("ink", 30, 50, 19),
      circle("ink", 70, 50, 19),
      rect("ink", 42, 56, 16, 40),
    ],
  },
  {
    id: "choinka",
    name: "choinka",
    category: "przyroda",
    figures: [
      polygon("ink", 50, 4, 26, 38, 74, 38),
      polygon("ink", 50, 22, 16, 62, 84, 62),
      polygon("ink", 50, 42, 8, 86, 92, 86),
      rect("ink", 42, 84, 16, 13),
    ],
  },
  {
    id: "kwiat",
    name: "kwiat",
    category: "przyroda",
    figures: [
      rect("ink", 47, 50, 6, 46),
      ellipse("ink", 66, 76, 14, 6, -30),
      circle("ink", 50, 16, 13),
      circle("ink", 68, 30, 13),
      circle("ink", 61, 51, 13),
      circle("ink", 39, 51, 13),
      circle("ink", 32, 30, 13),
      circle("paper", 50, 34, 9),
    ],
  },
  {
    id: "grzyb",
    name: "grzyb",
    category: "przyroda",
    figures: [
      outline("ink", "M8,54 A42,40 0 0 1 92,54 Z"),
      rect("ink", 36, 52, 28, 42, { rx: 6 }),
      circle("paper", 32, 38, 6),
      circle("paper", 56, 26, 6),
      circle("paper", 72, 44, 5),
    ],
  },
  {
    id: "lisc",
    name: "liść",
    category: "przyroda",
    figures: [
      outline("ink", "M50,4 C92,28 88,76 50,90 C12,76 8,28 50,4 Z"),
      rect("ink", 47, 86, 6, 12),
      stroked("paper", 3, "M50,14 L50,86 M50,40 L66,30 M50,40 L34,30 M50,60 L68,50 M50,60 L32,50"),
    ],
  },
  // Kosmos i maszyny
  {
    id: "rakieta",
    name: "rakieta",
    category: "kosmos",
    figures: [
      outline("ink", "M50,2 C72,24 70,60 65,80 L35,80 C30,60 28,24 50,2 Z"),
      polygon("ink", 36, 54, 16, 88, 36, 80),
      polygon("ink", 64, 54, 84, 88, 64, 80),
      polygon("ink", 40, 80, 60, 80, 50, 98),
      circle("paper", 50, 38, 9),
    ],
  },
  {
    id: "auto",
    name: "auto",
    category: "kosmos",
    figures: [
      rect("ink", 4, 46, 92, 26, { rx: 7 }),
      polygon("ink", 22, 48, 34, 22, 66, 22, 80, 48),
      polygon("paper", 29, 45, 38, 27, 48, 27, 48, 45),
      polygon("paper", 52, 45, 52, 27, 62, 27, 73, 45),
      circle("ink", 27, 74, 13),
      circle("ink", 73, 74, 13),
      circle("paper", 27, 74, 5),
      circle("paper", 73, 74, 5),
    ],
  },
  {
    id: "samolot",
    name: "samolot",
    category: "kosmos",
    figures: [
      ellipse("ink", 50, 50, 46, 9),
      polygon("ink", 38, 50, 60, 50, 44, 8, 34, 8),
      polygon("ink", 38, 50, 60, 50, 44, 92, 34, 92),
      polygon("ink", 82, 48, 98, 26, 98, 50),
    ],
  },
  {
    id: "lodka",
    name: "łódka",
    category: "kosmos",
    figures: [
      polygon("ink", 6, 64, 94, 64, 78, 88, 22, 88),
      rect("ink", 47, 6, 6, 58),
      polygon("ink", 56, 10, 56, 58, 88, 58),
      polygon("ink", 44, 22, 44, 58, 18, 58),
    ],
  },
  {
    id: "ufo",
    name: "UFO",
    category: "kosmos",
    figures: [
      outline("ink", "M26,54 A24,26 0 0 1 74,54 Z"),
      ellipse("ink", 50, 58, 46, 14),
      stroked("ink", 5, "M30,70 L22,88 M70,70 L78,88"),
      circle("paper", 28, 58, 4),
      circle("paper", 50, 62, 4),
      circle("paper", 72, 58, 4),
    ],
  },
  // Domy i budowle
  {
    id: "domek",
    name: "domek",
    category: "budowle",
    figures: [
      polygon("ink", 50, 6, 4, 46, 96, 46),
      rect("ink", 16, 44, 68, 50),
      rect("paper", 42, 64, 16, 30),
      rect("paper", 24, 54, 12, 12),
      rect("paper", 64, 54, 12, 12),
    ],
  },
  {
    id: "wieza",
    name: "wieża zamku",
    category: "budowle",
    figures: [
      rect("ink", 22, 28, 56, 68),
      rect("ink", 22, 12, 13, 18),
      rect("ink", 43.5, 12, 13, 18),
      rect("ink", 65, 12, 13, 18),
      outline("paper", "M40,96 L40,78 A10,10 0 0 1 60,78 L60,96 Z"),
      rect("paper", 45, 42, 10, 16, { rx: 5 }),
    ],
  },
  {
    id: "namiot",
    name: "namiot",
    category: "budowle",
    figures: [
      polygon("ink", 50, 8, 4, 92, 96, 92),
      polygon("paper", 50, 44, 36, 92, 64, 92),
      line("ink", 4, 50, 8, 50, 0),
      polygon("ink", 50, 0, 66, 5, 50, 10),
    ],
  },
  {
    id: "latarnia",
    name: "latarnia morska",
    category: "budowle",
    figures: [
      polygon("ink", 50, 2, 32, 18, 68, 18),
      rect("ink", 34, 18, 32, 14),
      polygon("ink", 36, 32, 64, 32, 74, 96, 26, 96),
      rect("paper", 40, 21, 20, 8),
      polygon("paper", 34, 50, 66, 50, 67.5, 60, 32.5, 60),
      polygon("paper", 31, 74, 69, 74, 70.5, 84, 29.5, 84),
    ],
  },
  {
    id: "wiezowiec",
    name: "wieżowiec",
    category: "budowle",
    figures: [rect("ink", 28, 4, 44, 92), ...SKYSCRAPER_WINDOWS, rect("paper", 44, 84, 12, 12)],
  },
];

export function iconById(id: string): Icon | undefined {
  return ICONS.find((icon) => icon.id === id);
}

export function iconsOfCategory(category: IconCategory): readonly Icon[] {
  return ICONS.filter((icon) => icon.category === category);
}
