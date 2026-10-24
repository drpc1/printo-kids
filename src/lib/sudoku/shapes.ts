/**
 * The shapes a sudoku card is drawn with. Each path is built straight in page units (mm) for a given center and
 * size, never through a scale transform, so a stroke of 1.2 mm stays 1.2 mm on a 40 mm cell and on an 18 mm one.
 * Only absolute M, L, C and Z commands are used. The paths are outlines with no fill, so a later color slice can
 * fill the inside.
 */
export type SudokuShapeId = "circle" | "square" | "triangle" | "heart" | "cross" | "star" | "diamond" | "moon" | "drop";

export const SUDOKU_SHAPES: readonly SudokuShapeId[] = [
  "circle",
  "square",
  "triangle",
  "heart",
  "cross",
  "star",
  "diamond",
  "moon",
  "drop",
];

/** The five simplest shapes. The 4×4 card draws four of them. */
export const SUDOKU_SHAPES_4: readonly SudokuShapeId[] = ["circle", "square", "triangle", "heart", "cross"];

export const SUDOKU_SHAPE_NAMES: Record<SudokuShapeId, string> = {
  circle: "koło",
  square: "kwadrat",
  triangle: "trójkąt",
  heart: "serce",
  cross: "krzyżyk",
  star: "gwiazdka",
  diamond: "romb",
  moon: "księżyc",
  drop: "kropla",
};

type Point = readonly [number, number];
type Segment = { line: Point } | { curve: readonly [Point, Point, Point] };

/** A shape in a unit box: every coordinate is within -1..1, the box side is 2. */
interface UnitShape {
  start: Point;
  segments: readonly Segment[];
}

const KAPPA = 0.5523;

function polygon(points: readonly Point[]): UnitShape {
  const [start, ...rest] = points;
  return { start, segments: rest.map((point) => ({ line: point })) };
}

function crossShape(): UnitShape {
  const arm = 0.22;
  const reach = 1.194;
  const plus: readonly Point[] = [
    [arm, -reach],
    [arm, -arm],
    [reach, -arm],
    [reach, arm],
    [arm, arm],
    [arm, reach],
    [-arm, reach],
    [-arm, arm],
    [-reach, arm],
    [-reach, -arm],
    [-arm, -arm],
    [-arm, -reach],
  ];
  const turn = Math.SQRT1_2;
  return polygon(plus.map(([x, y]) => [(x - y) * turn, (x + y) * turn] as const));
}

function starShape(): UnitShape {
  const points: Point[] = [];
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? 1 : 0.45;
    const angle = (-90 + index * 36) * (Math.PI / 180);
    points.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
  }
  return polygon(points);
}

const UNIT_SHAPES: Record<SudokuShapeId, UnitShape> = {
  circle: {
    start: [0, -1],
    segments: [
      {
        curve: [
          [KAPPA, -1],
          [1, -KAPPA],
          [1, 0],
        ],
      },
      {
        curve: [
          [1, KAPPA],
          [KAPPA, 1],
          [0, 1],
        ],
      },
      {
        curve: [
          [-KAPPA, 1],
          [-1, KAPPA],
          [-1, 0],
        ],
      },
      {
        curve: [
          [-1, -KAPPA],
          [-KAPPA, -1],
          [0, -1],
        ],
      },
    ],
  },
  square: polygon([
    [-0.88, -0.88],
    [0.88, -0.88],
    [0.88, 0.88],
    [-0.88, 0.88],
  ]),
  triangle: polygon([
    [0, -0.95],
    [1, 0.85],
    [-1, 0.85],
  ]),
  heart: {
    start: [0, 0.95],
    segments: [
      {
        curve: [
          [-0.4, 0.6],
          [-1, 0.15],
          [-1, -0.4],
        ],
      },
      {
        curve: [
          [-1, -0.75],
          [-0.75, -0.95],
          [-0.5, -0.95],
        ],
      },
      {
        curve: [
          [-0.25, -0.95],
          [-0.08, -0.8],
          [0, -0.6],
        ],
      },
      {
        curve: [
          [0.08, -0.8],
          [0.25, -0.95],
          [0.5, -0.95],
        ],
      },
      {
        curve: [
          [0.75, -0.95],
          [1, -0.75],
          [1, -0.4],
        ],
      },
      {
        curve: [
          [1, 0.15],
          [0.4, 0.6],
          [0, 0.95],
        ],
      },
    ],
  },
  cross: crossShape(),
  star: starShape(),
  diamond: polygon([
    [0, -1],
    [0.7, 0],
    [0, 1],
    [-0.7, 0],
  ]),
  moon: {
    start: [0.45, -1],
    segments: [
      {
        curve: [
          [-0.75, -0.95],
          [-0.75, 0.95],
          [0.45, 1],
        ],
      },
      {
        curve: [
          [-0.25, 0.6],
          [-0.25, -0.6],
          [0.45, -1],
        ],
      },
    ],
  },
  drop: {
    start: [0, -1],
    segments: [
      {
        curve: [
          [0.25, -0.55],
          [0.8, -0.1],
          [0.8, 0.35],
        ],
      },
      {
        curve: [
          [0.8, 0.75],
          [0.45, 1],
          [0, 1],
        ],
      },
      {
        curve: [
          [-0.45, 1],
          [-0.8, 0.75],
          [-0.8, 0.35],
        ],
      },
      {
        curve: [
          [-0.8, -0.1],
          [-0.25, -0.55],
          [0, -1],
        ],
      },
    ],
  },
};

function format(value: number): string {
  return String(Number(value.toFixed(3)));
}

/**
 * The SVG path `d` of a shape centered on (cx, cy), fitting a square of side `size`, in page units. The stroke is
 * drawn around the path, so it reaches half a stroke width past that square.
 */
export function sudokuShapePath(id: SudokuShapeId, cx: number, cy: number, size: number): string {
  const half = size / 2;
  const at = ([x, y]: Point): string => `${format(cx + x * half)} ${format(cy + y * half)}`;
  const shape = UNIT_SHAPES[id];
  const parts = [`M${at(shape.start)}`];
  for (const segment of shape.segments) {
    parts.push("line" in segment ? `L${at(segment.line)}` : `C${segment.curve.map(at).join(" ")}`);
  }
  parts.push("Z");
  return parts.join(" ");
}
