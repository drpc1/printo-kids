/** One point of a pattern unit. x runs 0..1 (one step), y runs 0 (bottom) to 1 (top) unless a pattern says otherwise. */
export interface Pt {
  x: number;
  y: number;
  /** A corner: the pencil stops here, so the dotted path always has a dot on it. */
  corner?: boolean;
}

const N = 48;
const sample = (f: (t: number) => Pt, n = N): Pt[] => Array.from({ length: n + 1 }, (_, i) => f(i / n));
const c = (x: number, y: number): Pt => ({ x, y, corner: true });

function withCornerEnds(points: Pt[]): Pt[] {
  points[0].corner = true;
  points[points.length - 1].corner = true;
  return points;
}

// Units: one step each. Everything except the cups and the line starts and ends at y = 0, so units can be joined.
const U = {
  line: (): Pt[] => [c(0, 0.5), c(1, 0.5)],
  flat: (): Pt[] => [c(0, 0), c(1, 0)],
  wave: (): Pt[] => sample((t) => ({ x: t, y: (1 - Math.cos(t * 2 * Math.PI)) / 2 })),
  zigzag: (): Pt[] => [c(0, 0), c(0.5, 1), c(1, 0)],
  arcs: (): Pt[] => withCornerEnds(sample((t) => ({ x: t, y: Math.sin(t * Math.PI) }), 32)),
  cups: (): Pt[] => withCornerEnds(sample((t) => ({ x: t, y: 1 - Math.sin(t * Math.PI) }), 32)),
  stairs: (): Pt[] => [c(0, 0), c(0, 1), c(0.5, 1), c(0.5, 0), c(1, 0)],
  trapez: (): Pt[] => [c(0, 0), c(0.25, 1), c(0.5, 1), c(0.75, 0), c(1, 0)],
  saw: (): Pt[] => [c(0, 0), c(1, 1), c(1, 0)],
  // A block with two studs. The studs are wide enough for the dots (a dot spacing is about 3 mm).
  bricks: (): Pt[] => [
    c(0, 0),
    c(0, 0.72),
    c(0.1, 0.72),
    c(0.1, 1),
    c(0.24, 1),
    c(0.24, 0.72),
    c(0.34, 0.72),
    c(0.34, 1),
    c(0.48, 1),
    c(0.48, 0.72),
    c(0.58, 0.72),
    c(0.58, 0),
    c(1, 0),
  ],
  // A pipe with a cap.
  pipes: (): Pt[] => [
    c(0, 0),
    c(0.12, 0),
    c(0.12, 0.75),
    c(0.05, 0.75),
    c(0.05, 1),
    c(0.5, 1),
    c(0.5, 0.75),
    c(0.43, 0.75),
    c(0.43, 0),
    c(1, 0),
  ],
  // A house: a wall and a roof.
  house: (): Pt[] => [c(0, 0), c(0, 0.6), c(0.25, 1), c(0.5, 0.6), c(0.5, 0), c(1, 0)],
  // A gate: a straight leg, a half circle, a straight leg.
  tunnel: (): Pt[] => {
    const arc = Array.from({ length: 25 }, (_, i) => {
      const a = Math.PI - (i / 24) * Math.PI;
      return { x: 0.25 + 0.25 * Math.cos(a), y: 0.55 + 0.45 * Math.sin(a) };
    });
    return [
      c(0, 0),
      { ...arc[0], corner: true },
      ...arc.slice(1, -1),
      { ...arc[24], corner: true },
      c(0.5, 0),
      c(1, 0),
    ];
  },
  // Pointed arches: two arcs of a large circle meet in a sharp peak. The arcs are wide so the two arms stay far
  // enough from each other for the dots of one arm not to touch the dots of the other.
  pointed: (): Pt[] => {
    const m = (55 * Math.PI) / 180;
    const up = Array.from({ length: 17 }, (_, i) => {
      const t = (i / 16) * m;
      return { x: (0.5 * (1 - Math.cos(t))) / (1 - Math.cos(m)), y: Math.sin(t) / Math.sin(m) };
    });
    const down = up.map((p) => ({ x: 1 - p.x, y: p.y })).reverse();
    return [
      { ...up[0], corner: true },
      ...up.slice(1, -1),
      c(0.5, 1),
      ...down.slice(1, -1),
      { ...down[16], corner: true },
    ];
  },
  // Joined round letters like "oo", "aa": a connector rises from the bottom line outside the ring and meets its top,
  // the ring runs against the clock and stops short of closing (a closed ring would put two dots on one spot), and a stroke leaves over the ring and comes down to the bottom line.
  oChain: (): Pt[] => {
    const cx = 0.6;
    const rx = 0.24;
    const ring = Array.from({ length: 49 }, (_, i) => {
      const a = Math.PI / 2 + (i / 48) * 2 * Math.PI;
      return { x: cx + rx * Math.cos(a), y: 0.4 + 0.4 * Math.sin(a) };
    });
    return [
      c(0, 0),
      { x: 0.08, y: 0.28 },
      { x: 0.2, y: 0.58 },
      { x: 0.34, y: 0.79 },
      { x: 0.47, y: 0.84 },
      { ...ring[0], corner: true },
      ...ring.slice(1, 44),
      { ...ring[44], corner: true },
      { x: 0.78, y: 0.86 },
      { x: 0.9, y: 0.7 },
      { x: 0.96, y: 0.36 },
      c(1, 0),
    ];
  },
  // Sticks with a hook, like a written "i": a slanted stroke up, an almost vertical stroke down and a wide hook.
  sticks: (): Pt[] => [
    c(0, 0.15),
    c(0.42, 1),
    c(0.48, 0.22),
    { x: 0.51, y: 0.09 },
    { x: 0.57, y: 0.02 },
    { x: 0.66, y: 0 },
    { x: 0.77, y: 0.02 },
    { x: 0.89, y: 0.08 },
    c(1, 0.15),
  ],
  // A loop hanging below the start line (like a written j, g): starts and ends at the top.
  loopsBelow: (k = 0.3): Pt[] =>
    sample((t) => ({ x: t + k * Math.sin(t * 2 * Math.PI), y: -(1 - Math.cos(t * 2 * Math.PI)) / 2 }), 64),
  // A loop on top (like a written "e"): x = t + k sin, so the way turns back and curls.
  loops: (k = 0.3): Pt[] =>
    sample((t) => ({ x: t + k * Math.sin(t * 2 * Math.PI), y: (1 - Math.cos(t * 2 * Math.PI)) / 2 }), 64),
};

/** Joins units into one step: each part gets a fraction `w` of the width and a height scale `h`. */
function compose(parts: { u: Pt[]; w: number; h?: number }[]): Pt[] {
  const out: Pt[] = [];
  let x0 = 0;
  const total = parts.reduce((sum, part) => sum + part.w, 0);
  for (const part of parts) {
    part.u.forEach((q, i) => {
      if (i === 0 && out.length > 0) return;
      const edge = i === 0 || i === part.u.length - 1;
      out.push({ x: (x0 + q.x * part.w) / total, y: q.y * (part.h ?? 1), corner: q.corner === true || edge });
    });
    x0 += part.w;
  }
  return out;
}

export type PatternId =
  | "line"
  | "wave"
  | "zigzag"
  | "arcs"
  | "cups"
  | "stairs"
  | "trapez"
  | "saw"
  | "loops"
  | "snails"
  | "bricks"
  | "pipes"
  | "spell"
  | "house"
  | "tunnel"
  | "pointed"
  | "waveFlat"
  | "doubleZig"
  | "loopsDown"
  | "upDown"
  | "arcFlat"
  | "zigFlat"
  | "loopArc"
  | "waveLoop"
  | "oChain"
  | "sticks"
  | "tallShort"
  | "arcZig"
  | "stairsArc"
  | "doubleArc";

export interface PatternDef {
  id: PatternId;
  /** Polish name, for tests and the preview; the card never shows it. */
  name: string;
  /** One step of the pattern. */
  unit: () => Pt[];
  /** Multiplier of the gentleness: sharp patterns get a somewhat lower height. */
  sharp?: number;
  /** Patterns of two parts get a longer step, so each part has room. */
  span?: number;
  /** A fixed height / step ratio (rings must be round) instead of the level's gentleness. */
  fixedRatio?: number;
  /** Place in the ruling on level 4: x = up to the middle line, tall = up to the top one, desc = from the middle below the bottom. */
  ling?: "x" | "tall" | "desc";
  /** A fixed number of repeats in a row instead of the number the step gives (houses: 5). */
  count?: number;
}

export const PATTERNS: readonly PatternDef[] = [
  { id: "line", name: "linia prosta", unit: U.line },
  { id: "wave", name: "fala", unit: U.wave },
  { id: "zigzag", name: "zygzak", unit: U.zigzag, sharp: 0.85 },
  { id: "arcs", name: "górki", unit: U.arcs },
  { id: "cups", name: "miseczki", unit: U.cups },
  { id: "stairs", name: "schodki (meander)", unit: U.stairs, sharp: 0.8 },
  { id: "trapez", name: "kopce (trapezy)", unit: U.trapez, sharp: 0.85 },
  { id: "saw", name: "zęby smoka (piłka)", unit: U.saw, sharp: 0.8 },
  { id: "loops", name: "pętle (jak pisane e)", unit: () => U.loops(0.32) },
  { id: "snails", name: "spirale (ciasne pętle)", unit: () => U.loops(0.5), fixedRatio: 0.9 },
  { id: "bricks", name: "klocki", unit: U.bricks, sharp: 0.8, span: 1.2 },
  { id: "pipes", name: "rury", unit: U.pipes, span: 1.2 },
  {
    id: "spell",
    ling: "tall",
    name: "czary: mała i duża pętla",
    unit: () =>
      compose([
        { u: U.loops(0.4), w: 0.7, h: 0.5 },
        { u: U.loops(0.4), w: 1, h: 1 },
      ]),
    fixedRatio: 0.6,
    span: 1.5,
  },
  { id: "house", name: "domki", unit: U.house, fixedRatio: 0.6, count: 5 },
  { id: "tunnel", name: "bramy", unit: U.tunnel, span: 1.2 },
  { id: "pointed", name: "czubki (ostrołuki)", unit: U.pointed },
  {
    id: "waveFlat",
    name: "fala i kreska",
    unit: () =>
      compose([
        { u: U.wave(), w: 2 },
        { u: U.flat(), w: 1 },
      ]),
    span: 1.3,
  },
  {
    id: "doubleZig",
    name: "duży i mały ząbek",
    unit: () =>
      compose([
        { u: U.zigzag(), w: 1, h: 1 },
        { u: U.zigzag(), w: 0.6, h: 0.5 },
      ]),
    span: 1.4,
  },
  {
    id: "loopsDown",
    ling: "desc",
    name: "pętle w dół (j g)",
    unit: () => U.loopsBelow(0.3).map((p) => ({ ...p, y: p.y + 1 })),
  },
  {
    id: "upDown",
    ling: "desc",
    name: "pętla w górę i w dół",
    unit: () =>
      compose([
        { u: U.loops(0.3), w: 1 },
        { u: U.loopsBelow(0.3), w: 1 },
      ]).map((p) => ({ ...p, y: (p.y + 1) / 2 })),
    span: 1.6,
  },
  {
    id: "arcFlat",
    name: "górka i kreska",
    unit: () =>
      compose([
        { u: U.arcs(), w: 2 },
        { u: U.flat(), w: 1 },
      ]),
  },
  {
    id: "zigFlat",
    name: "ząbek i kreska",
    unit: () =>
      compose([
        { u: U.zigzag(), w: 2 },
        { u: U.flat(), w: 1 },
      ]),
  },
  {
    id: "loopArc",
    name: "pętla i górka",
    unit: () =>
      compose([
        { u: U.loops(0.25), w: 1.2 },
        { u: U.arcs(), w: 1, h: 0.7 },
      ]),
    span: 1.7,
  },
  {
    id: "waveLoop",
    name: "fala i pętla",
    unit: () =>
      compose([
        { u: U.wave(), w: 1.2, h: 0.6 },
        { u: U.loops(0.25), w: 1.2 },
      ]),
    span: 1.8,
  },
  { id: "oChain", name: "kółeczka (o a)", unit: U.oChain, fixedRatio: 0.6, span: 1.4 },
  { id: "sticks", name: "laseczki z haczykiem (i)", unit: U.sticks },
  {
    id: "tallShort",
    ling: "tall",
    name: "pętla wysoka i niska (l e)",
    unit: () =>
      compose([
        { u: U.loops(0.28), w: 1, h: 1 },
        { u: U.loops(0.28), w: 0.8, h: 0.5 },
      ]),
    span: 1.5,
  },
  {
    id: "arcZig",
    name: "górka i ząbek",
    unit: () =>
      compose([
        { u: U.arcs(), w: 1 },
        { u: U.zigzag(), w: 1 },
      ]),
    span: 1.6,
  },
  {
    id: "stairsArc",
    name: "schodek i górka",
    unit: () =>
      compose([
        { u: U.stairs(), w: 1 },
        { u: U.arcs(), w: 1 },
      ]),
    span: 1.6,
  },
  {
    id: "doubleArc",
    name: "górka duża i mała (m n)",
    unit: () =>
      compose([
        { u: U.arcs(), w: 1, h: 1 },
        { u: U.arcs(), w: 0.7, h: 0.55 },
      ]),
    span: 1.5,
  },
];

export function patternById(id: string): PatternDef {
  const pattern = PATTERNS.find((candidate) => candidate.id === id);
  if (pattern === undefined) {
    throw new Error(`Unknown pattern ${id}`);
  }
  return pattern;
}
