import type {
  ObjectCategoryId,
  SymmetryCell,
  SymmetryColor,
  SymmetryObjectSizes,
  SymmetryTemplate,
} from "../template-format.ts";

// Kształty. Geometric figures sampled on the half grid from a formula per figure: a hand-drawn letter grid would be
// 24 near-identical drawings, and the formula keeps the three sizes the same figure. The figures keep their own
// proportions (a circle is as tall as it is wide), so they fill a band of the grid and not its whole height. Half sizes:
// 4 by 12 (column 3 touches the axis), 6 by 15 (column 5), 9 by 24 (column 8).

/** The inside test for a cell center: `dx` is the distance from the axis in cells, `y` the distance from the top. */
type Inside = (dx: number, y: number) => boolean;

interface FigureSpec {
  id: string;
  color: SymmetryColor;
  holeColor: SymmetryColor | null;
  /** Rows of the figure on a half of `half` columns; at most the rows of the smallest grid of that size. */
  height?: (half: number) => number;
  inside?: (half: number, height: number) => Inside;
}

const CATEGORIES: readonly ObjectCategoryId[] = ["ksztalty"];
/** How many decorations (a cell that is a hole or a filled cell) a figure of this half size gets at most. */
const SPOTS_BY_HALF: Readonly<Record<number, number>> = { 4: 2, 6: 2, 9: 3 };

function square(value: number): number {
  return value * value;
}

const FIGURES: readonly FigureSpec[] = [
  {
    id: "kolo",
    color: "blue",
    holeColor: "yellow",
    height: (half) => 2 * half,
    inside: (half, height) => (dx, y) => square(dx / half) + square((y - height / 2) / (height / 2)) <= 1,
  },
  {
    id: "romb",
    color: "orange",
    holeColor: "blue",
    height: (half) => Math.round(2.4 * half),
    inside: (half, height) => (dx, y) => dx / half + Math.abs(y - height / 2) / (height / 2) <= 1.08,
  },
  {
    id: "trojkat",
    color: "green",
    holeColor: "yellow",
    height: (half) => Math.round(2.4 * half),
    inside: (half, height) => (dx, y) => dx <= (half * (y + 1)) / height,
  },
  {
    id: "serce",
    color: "red",
    holeColor: "yellow",
    height: (half) => 2 * half,
    inside: (half, height) => (dx, y) => {
      const x = (dx / half) * 1.2;
      const up = 1.25 - (y / height) * 2.25;
      return (square(x) + square(up) - 1) ** 3 - square(x) * up ** 3 <= 0;
    },
  },
  {
    id: "gwiazda",
    color: "yellow",
    holeColor: "red",
    height: (half) => Math.ceil((half / 0.951) * 1.809),
    inside: (half) => {
      const outer = half / 0.951;
      const points = Array.from({ length: 10 }, (_, index) => {
        const angle = (-90 + 36 * index) * (Math.PI / 180);
        const radius = index % 2 === 0 ? outer : outer * 0.45;
        return { x: radius * Math.cos(angle), y: outer + radius * Math.sin(angle) };
      });
      return (dx, y) => {
        let inside = false;
        for (let a = 0, b = points.length - 1; a < points.length; b = a, a += 1) {
          const crosses =
            points[a].y > y !== points[b].y > y &&
            dx < ((points[b].x - points[a].x) * (y - points[a].y)) / (points[b].y - points[a].y) + points[a].x;
          if (crosses) {
            inside = !inside;
          }
        }
        return inside;
      };
    },
  },
  {
    id: "krzyzyk",
    color: "brown",
    holeColor: "yellow",
    height: (half) => 2 * half,
    inside: (half, height) => {
      const arm = Math.max(1, Math.floor(half / 3));
      return (dx, y) => dx <= arm || Math.abs(y - height / 2) <= arm;
    },
  },
  {
    id: "ksiezyc",
    color: "yellow",
    holeColor: null,
    height: (half) => 2 * half,
    inside: (half) => (dx, y) =>
      square(dx) + square(y - half) <= square(half) && square(dx) + square(y - 0.45 * half) > square(0.82 * half),
  },
  {
    id: "chmurka",
    color: "gray",
    holeColor: "blue",
  },
];

/**
 * Hand-drawn left halves ("#" is a filled cell) where a formula is too coarse to read as the figure: the 5-point star
 * at 4 by 12, and the cloud, whose scalloped top needs three bumps that circles blur into a hill.
 */
const DRAWN: Readonly<Partial<Record<string, Readonly<Partial<Record<number, readonly string[]>>>>>> = {
  gwiazda: { 4: ["...#", "...#", "####", ".###", "..##", ".###", ".##.", ".#.."] },
  chmurka: {
    4: ["...#", "..##", "#.##", "####", ".###"],
    6: ["...###", "...###", ".#.###", "##.###", "######", "######", ".#####"],
    9: [
      "......###",
      ".....####",
      "..##.####",
      ".###.####",
      "#########",
      "#########",
      "#########",
      "#########",
      ".########",
    ],
  },
};

/** The cells of the left half that are inside the figure, as rows of booleans, without empty rows above or below. */
function sample(spec: FigureSpec, half: number): boolean[][] {
  const drawn = DRAWN[spec.id]?.[half];
  if (drawn !== undefined) {
    return drawn.map((line) => line.split("").map((letter) => letter === "#"));
  }
  if (spec.height === undefined || spec.inside === undefined) {
    throw new Error(`Figure ${spec.id} has no drawing for a half of ${half} columns`);
  }
  const height = spec.height(half);
  const inside = spec.inside(half, height);
  const rows = Array.from({ length: height }, (_, row) =>
    Array.from({ length: half }, (_, col) => inside(half - (col + 0.5), row + 0.5)),
  );
  const first = rows.findIndex((line) => line.some(Boolean));
  const last = rows.map((line) => line.some(Boolean)).lastIndexOf(true);
  return rows.slice(first, last + 1);
}

/**
 * Cells that can become a hole without touching the edge of the figure: all eight neighbors are filled, in the whole
 * silhouette (the half and its mirror), and the cell is not on the axis column.
 */
function interiorCells(grid: boolean[][], half: number, diagonals: boolean): { col: number; row: number }[] {
  const filled = (col: number, row: number): boolean => {
    const mirrored = col >= half ? 2 * half - 1 - col : col;
    return row >= 0 && row < grid.length && mirrored >= 0 && mirrored < half && grid[row][mirrored];
  };
  const neighbors = diagonals
    ? [-1, 0, 1].flatMap((dRow) => [-1, 0, 1].map((dCol) => ({ dRow, dCol })))
    : [
        { dRow: -1, dCol: 0 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 },
        { dRow: 0, dCol: 1 },
      ];
  const cells: { col: number; row: number }[] = [];
  grid.forEach((line, row) => {
    for (let col = 0; col < half - 1; col += 1) {
      if (line[col] && neighbors.every(({ dRow, dCol }) => filled(col + dCol, row + dRow))) {
        cells.push({ col, row });
      }
    }
  });
  return cells;
}

/**
 * Picks cells far from each other (at least two apart) until `count`, starting near the middle of the figure, after
 * the cells already `chosen`.
 */
function pickSpots(
  cells: { col: number; row: number }[],
  count: number,
  half: number,
  height: number,
  chosen: { col: number; row: number }[] = [],
): typeof cells {
  const distance = (a: (typeof cells)[number], b: (typeof cells)[number]): number =>
    Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
  while (chosen.length < count) {
    let best: (typeof cells)[number] | null = null;
    let bestScore = -Infinity;
    for (const cell of cells) {
      if (chosen.some((other) => distance(cell, other) < 2)) {
        continue;
      }
      const score =
        chosen.length === 0
          ? -(Math.abs(cell.row - height / 2) + Math.abs(cell.col - (half - 1.5)))
          : Math.min(...chosen.map((other) => distance(cell, other)));
      if (score > bestScore) {
        best = cell;
        bestScore = score;
      }
    }
    if (best === null) {
      break;
    }
    chosen.push(best);
  }
  return chosen;
}

function figureTemplate(spec: FigureSpec, half: number): SymmetryTemplate {
  const grid = sample(spec, half);
  const count = SPOTS_BY_HALF[half];
  // Cells with all eight neighbors filled first; a thin figure (the moon) falls back to cells with four.
  const spots = pickSpots(interiorCells(grid, half, true), count, half, grid.length);
  if (spots.length < Math.min(count, 2)) {
    pickSpots(interiorCells(grid, half, false), count, half, grid.length, spots);
  }
  const isSpot = (col: number, row: number): boolean => spots.some((spot) => spot.col === col && spot.row === row);
  const base: SymmetryCell[] = [];
  grid.forEach((line, row) => {
    line.forEach((on, col) => {
      if (on && !isSpot(col, row)) {
        base.push({ col, row, color: spec.color });
      }
    });
  });
  return {
    id: spec.id,
    width: half,
    height: grid.length,
    holeColor: spec.holeColor,
    categories: CATEGORIES,
    base,
    // A spot is a hole in one variant and a filled cell in the other, so every variant set draws a different picture.
    parts: spots.map((spot, index) => ({
      id: `spot-${index}`,
      variants: [[], [{ col: spot.col, row: spot.row, color: spec.color }]],
    })),
  };
}

export const KSZTALTY: SymmetryObjectSizes = {
  half4: FIGURES.map((spec) => figureTemplate(spec, 4)),
  half6: FIGURES.map((spec) => figureTemplate(spec, 6)),
  half9: FIGURES.map((spec) => figureTemplate(spec, 9)),
};
