// Builds mockup-drawings.json (S-54 winter objects and dictation shapes) from small parametric drawings.
// Usage (from the repo root): node --experimental-strip-types context/changes/seasons-objects-characters/build-drawings.mts
// Not part of the product build. Left half of each object: the last column touches the axis.
import fs from "node:fs";
import nodePath from "node:path";

interface Size {
  w: number;
  h: number;
}
const SIZES: Record<string, Size> = { half4: { w: 4, h: 12 }, half6: { w: 6, h: 15 }, half9: { w: 9, h: 24 } };

class Canvas {
  rows: string[][];
  w: number;
  h: number;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.rows = Array.from({ length: h }, () => Array.from({ length: w }, () => "."));
  }
  set(r: number, c: number, ch: string): void {
    if (r >= 0 && r < this.h && c >= 0 && c < this.w) this.rows[r][c] = ch;
  }
  get(r: number, c: number): string {
    return r >= 0 && r < this.h && c >= 0 && c < this.w ? this.rows[r][c] : ".";
  }
  rect(r0: number, r1: number, c0: number, c1: number, ch: string): void {
    for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) this.set(r, c, ch);
  }
  /** Ellipse centred on (cx, cy) in cell units; the axis is x = w. */
  ell(cx: number, cy: number, rx: number, ry: number, ch: string): void {
    for (let r = 0; r < this.h; r += 1)
      for (let c = 0; c < this.w; c += 1) {
        const dx = (c + 0.5 - cx) / rx;
        const dy = (r + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(r, c, ch);
      }
  }
  lines(): string[] {
    return this.rows.map((row) => row.join(""));
  }
  cells(): [number, number][] {
    const out: [number, number][] = [];
    for (let r = 0; r < this.h; r += 1) for (let c = 0; c < this.w; c += 1) if (this.rows[r][c] !== ".") out.push([r, c]);
    return out;
  }
}

interface Built {
  base: Canvas;
  parts: { id: string; variants: Canvas[] }[];
}

/** Removes the cells of the regions from the base, so base and parts share no cell. */
function carve(base: Canvas, ...regions: Canvas[]): void {
  for (const region of regions) for (const [r, c] of region.cells()) base.set(r, c, ".");
}

/** A variant of a region: the cells of `region` for which `hole` is false. */
function variantOf(region: Canvas, hole: (r: number, c: number) => boolean): Canvas {
  const v = new Canvas(region.w, region.h);
  for (const [r, c] of region.cells()) if (!hole(r, c)) v.set(r, c, region.get(r, c));
  return v;
}

/** Variants of a zone: the base cells inside it plus the extra cells of each variant; the zone leaves the base. */
function zoneVariants(base: Canvas, zone: Canvas, extras: Canvas[]): Canvas[] {
  const kept = new Canvas(base.w, base.h);
  for (const [r, c] of zone.cells()) if (base.get(r, c) !== ".") kept.set(r, c, base.get(r, c));
  const out = extras.map((extra) => {
    const v = new Canvas(base.w, base.h);
    for (const [r, c] of kept.cells()) v.set(r, c, kept.get(r, c));
    for (const [r, c] of extra.cells()) v.set(r, c, extra.get(r, c));
    return v;
  });
  carve(base, zone);
  return out;
}

// ---------- iglo ----------
function iglo({ w, h }: Size): Built {
  const base = new Canvas(w, h);
  const ph = Math.round(h * 0.5);
  const top = h - ph;
  base.ell(w, h, w + 0.1, ph, "s");
  const door = Math.max(3, Math.round(ph * 0.45));
  const doorW = w >= 6 ? 2 : 1;
  for (let r = h - door; r < h; r += 1) for (let c = w - doorW; c < w; c += 1) base.set(r, c, ".");
  const r0 = top + (w < 6 ? 1 : 2);
  const r1 = h - door - (w < 6 ? 1 : 2);
  const region = new Canvas(w, h);
  for (let r = r0; r <= r1; r += 1) for (let c = 1; c <= w - 2; c += 1) if (base.get(r, c) !== ".") region.set(r, c, "s");
  const blocks = [
    variantOf(region, () => false),
    variantOf(region, (r, c) => (r - r0) % 2 === 0 && (c + (r - r0) / 2) % 2 === 0),
    variantOf(region, (r, c) => (r - r0) % 2 === 0 && c % 2 === 1),
  ];
  carve(base, region);
  const none = new Canvas(w, h);
  const stick = new Canvas(w, h);
  stick.rect(top - 2, top - 1, w - 1, w - 1, "s");
  const wide = new Canvas(w, h);
  wide.rect(top - 2, top - 1, w - 2, w - 1, "s");
  return {
    base,
    parts: [
      { id: "blocks", variants: blocks },
      { id: "top", variants: [none, stick, wide] },
    ],
  };
}

// ---------- platek sniegu ----------
function platek({ w, h }: Size): Built {
  const base = new Canvas(w, h);
  const mid = Math.floor(h / 2);
  const arm = Math.floor((h - 2) / 2);
  const thick = w >= 6 ? 2 : 1;
  for (let r = mid - arm; r <= mid + arm - 1; r += 1) base.rect(r, r, w - thick, w - 1, "b");
  base.rect(mid - 1, mid, 0, w - 1, "b");
  const rows = [Math.round(arm * 0.4), Math.round(arm * 0.75)];
  const ribs = (l1: number, l2: number): Canvas => {
    const v = new Canvas(w, h);
    [l1, l2].forEach((len, i) => {
      for (const r of [mid - 1 - rows[i], mid + rows[i]]) {
        for (let c = w - thick - len; c < w - thick; c += 1) if (c >= 0 && base.get(r, c) === ".") v.set(r, c, "b");
      }
    });
    return v;
  };
  const L = w - thick;
  const sets: [number, number][] = [
    [Math.min(2, L), Math.min(1, L)],
    [Math.min(3, L), Math.min(2, L)],
    [Math.min(1, L), Math.min(2, L)],
    [L, Math.min(2, L)],
  ];
  return { base, parts: [{ id: "ribs", variants: sets.map(([x, y]) => ribs(x, y)) }] };
}

// ---------- czapka zimowa ----------
function czapka({ w, h }: Size): Built {
  const base = new Canvas(w, h);
  const pomp = Math.max(2, Math.round(h * 0.17));
  const cuff = Math.max(2, Math.round(h * 0.2));
  const gapBottom = Math.max(1, Math.round(h * 0.08));
  const cuffTop = h - cuff - gapBottom;
  base.ell(w, cuffTop, w - 0.8, cuffTop - pomp, "r");
  const cuffR1 = cuffTop + cuff - 1;
  base.rect(cuffTop, cuffR1, 0, w - 1, "s");
  const pompon = (kind: number): Canvas => {
    const v = new Canvas(w, h);
    if (kind === 0) v.ell(w, pomp / 2 + 0.2, Math.min(w - 1, pomp * 0.9), pomp / 2 + 0.3, "s");
    if (kind === 1) v.ell(w, pomp / 2 + 0.2, Math.min(w - 1, pomp * 0.6), pomp / 2 + 0.3, "s");
    if (kind === 2) v.rect(0, pomp - 1, Math.max(1, w - 1 - pomp), w - 1, "s");
    return v;
  };
  const rowMid = cuffTop + Math.floor(cuff / 2);
  const bandRegion = new Canvas(w, h);
  for (let c = 1; c < w - 1; c += 1) bandRegion.set(rowMid, c, "s");
  carve(base, bandRegion);
  const bands = [
    variantOf(bandRegion, () => false),
    variantOf(bandRegion, (_r, c) => c % 2 === 1),
    variantOf(bandRegion, (_r, c) => c % 3 !== 0),
  ];
  const dr = Math.floor((pomp + cuffTop) / 2) + 1;
  const dotRegion = new Canvas(w, h);
  for (let c = 1; c < w - 1; c += 1) if (base.get(dr, c) !== ".") dotRegion.set(dr, c, "r");
  carve(base, dotRegion);
  return {
    base,
    parts: [
      { id: "pompon", variants: [pompon(0), pompon(1), pompon(2)] },
      { id: "cuff", variants: bands },
      { id: "dots", variants: [variantOf(dotRegion, () => false), variantOf(dotRegion, (_r, c) => c % 2 === 1)] },
    ],
  };
}

// ---------- szalik ----------
function szalik({ w, h }: Size): Built {
  const base = new Canvas(w, h);
  const wrap = Math.max(3, Math.round(h * 0.22));
  const top = Math.max(1, Math.round(h * 0.08));
  base.rect(top, top + wrap - 1, 0, w - 1, "r");
  const endR0 = top + wrap;
  const endR1 = h - Math.max(2, Math.round(h * 0.12)) - 1;
  const cL = Math.max(1, Math.floor(w / 2));
  base.rect(endR0, endR1, cL, w - 2, "g");
  const fringe = (kind: number): Canvas => {
    const v = new Canvas(w, h);
    if (kind === 0) v.rect(endR1 + 1, endR1 + 1, cL, w - 2, "g");
    else for (let c = cL; c <= w - 2; c += kind === 1 ? 2 : 1) v.rect(endR1 + 1, endR1 + 1 + (kind === 2 ? 1 : 0), c, c, "g");
    return v;
  };
  const wrapRow = top + Math.floor(wrap / 2);
  const region = new Canvas(w, h);
  for (let c = 1; c < w - 1; c += 1) region.set(wrapRow, c, "r");
  carve(base, region);
  const endRegion = new Canvas(w, h);
  const er = Math.floor((endR0 + endR1) / 2);
  for (let c = cL + 1; c <= w - 2; c += 1) endRegion.set(er, c, "g");
  carve(base, endRegion);
  const knotZone = new Canvas(w, h);
  knotZone.rect(endR0, endR0 + 1, w - 1, w - 1, "r");
  const knotLen = (n: number): Canvas => {
    const v = new Canvas(w, h);
    v.rect(endR0, endR0 + n - 1, w - 1, w - 1, "r");
    return v;
  };
  return {
    base,
    parts: [
      { id: "knot", variants: [new Canvas(w, h), knotLen(1), knotLen(2)] },
      { id: "fringe", variants: [fringe(0), fringe(1), fringe(2)] },
      {
        id: "wrap",
        variants: [variantOf(region, () => false), variantOf(region, (_r, c) => c % 2 === 1), variantOf(region, (_r, c) => c % 3 === 1)],
      },
      { id: "stripe", variants: [variantOf(endRegion, () => false), variantOf(endRegion, (_r, c) => (c - cL) % 2 === 1)] },
    ],
  };
}

// ---------- niedzwiedz polarny ----------
/** Hand-drawn on 4 by 12, scaled to the other sizes by nearest neighbour. */
function niedzwiedz({ w, h }: Size): Built {
  const draw = (rows: string[]): Canvas => {
    const c = new Canvas(w, h);
    for (let r = 0; r < h; r += 1) for (let x = 0; x < w; x += 1) c.set(r, x, rows[Math.floor((r * 12) / h)].charAt(Math.floor((x * 4) / w)));
    return c;
  };
  const base = draw(["....", "..ss", "ssss", "s.ss", "ssss", "sss.", ".sss", "..ss", ".sss", "ss.s", "ss.s", "ss.."]);
  const frame = (rows: Record<number, string>): string[] => Array.from({ length: 12 }, (_v, r) => rows[r] ?? "....");
  const ears = [
    draw(frame({ 0: "ss..", 1: ".s.." })),
    draw(frame({ 0: ".s..", 1: "ss.." })),
    draw(frame({ 0: "s...", 1: "ss.." })),
  ];
  const belly = [
    draw(frame({ 9: "..s.", 10: "..s." })),
    draw(frame({ 10: "..s." })),
    draw(frame({ 9: "..s." })),
  ];
  const feet = [draw(frame({ 11: "..s." })), draw(frame({}))];
  const face = [draw(frame({ 5: "...k", 6: "...s" })), draw(frame({ 5: "...k" }))];
  // the nose cell is part of the face zone
  base.set(Math.floor((5 * h) / 12), w - 1, ".");
  return {
    base: fixZones(base, [ears, belly, feet, face]),
    parts: [
      { id: "ears", variants: ears },
      { id: "belly", variants: belly },
      { id: "feet", variants: feet },
      { id: "face", variants: face },
    ],
  };
}

/** Removes from the base every cell that any part variant uses, so base and parts share no cell. */
function fixZones(base: Canvas, groups: Canvas[][]): Canvas {
  for (const group of groups) for (const v of group) carve(base, v);
  return base;
}

const OBJECTS = [
  { id: "iglo", name: "iglo", categories: ["zima"], holeColor: null, build: iglo },
  { id: "platek", name: "płatek śniegu", categories: ["zima"], holeColor: null, build: platek },
  { id: "czapka", name: "czapka zimowa", categories: ["zima"], holeColor: null, build: czapka },
  { id: "szalik", name: "szalik", categories: ["zima"], holeColor: null, build: szalik },
  { id: "niedzwiedz", name: "niedźwiedź polarny", categories: ["zima", "zwierzeta"], holeColor: "black", build: niedzwiedz },
];

const here = import.meta.dirname;
const objects = OBJECTS.map((o) => ({
  id: o.id,
  name: o.name,
  categories: o.categories,
  holeColor: o.holeColor,
  sizes: Object.fromEntries(
    Object.entries(SIZES).map(([key, size]) => {
      const built = o.build(size);
      return [
        key,
        {
          width: size.w,
          height: size.h,
          base: built.base.lines(),
          parts: built.parts
            .map((p) => ({ id: p.id, variants: [...new Map(p.variants.map((v) => [v.lines().join("/"), v])).values()] }))
            .filter((p) => p.variants.length > 1)
            .map((p) => ({ id: p.id, variants: p.variants.map((v) => ({ lines: v.lines() })) })),
        },
      ];
    }),
  ),
}));

const shapesPath = nodePath.join(here, "shapes.json");
const shapes = fs.existsSync(shapesPath) ? (JSON.parse(fs.readFileSync(shapesPath, "utf8")) as object) : {};
fs.writeFileSync(
  nodePath.join(here, "mockup-drawings.json"),
  JSON.stringify({ approved: false, note: "S-54 winter mockup, generated by build-drawings.mts", objects, shapes }, null, 1),
);
console.log("written", objects.length, "objects");
