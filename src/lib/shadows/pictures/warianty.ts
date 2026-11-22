// The seven "warianty" families of the shadows card: variants of one thing that differ in a detail of the outline
// (handle, roof, fin, wheels, crown, key bow, flower head). Details inside the outline (windows, eyes) are left out of the shadow,
// so a variant never differs by a detail alone.
import { circle, ellipse, path, rect, stroke, type ShadowPicture } from "../picture-format.ts";

export const KUBKI: readonly ShadowPicture[] = [
  {
    id: "kubek",
    label: "kubek",
    shapes: [
      stroke("M74 36 C92 36 92 70 74 70", 10, "blue"),
      rect(22, 22, 54, 70, "blue", 4),
      rect(25, 34, 48, 6, "white", 0, true),
    ],
  },
  {
    id: "kubek-stozek",
    label: "kubek zwężany",
    shapes: [stroke("M72 34 C90 36 88 66 70 68", 10, "red"), path("M18 22 H82 L72 92 H28 Z", "red")],
  },
  {
    id: "filizanka",
    label: "filiżanka na spodku",
    shapes: [
      stroke("M78 46 C94 46 94 72 74 72", 10, "cream"),
      ellipse(50, 90, 44, 6, "cream"),
      path("M16 40 H84 C84 66 72 86 50 86 C28 86 16 66 16 40 Z", "cream"),
      rect(19, 50, 62, 5, "blue", 0, true),
    ],
  },
  { id: "szklanka", label: "szklanka", shapes: [path("M24 18 H76 L70 94 H30 Z", "sky")] },
  {
    id: "kubek-dwa-uszy",
    label: "kubek z dwoma uszami",
    shapes: [
      stroke("M74 38 C90 38 90 64 74 64", 10, "green"),
      stroke("M26 38 C10 38 10 64 26 64", 10, "green"),
      rect(24, 24, 52, 68, "green", 4),
    ],
  },
  {
    id: "dzbanek",
    label: "dzbanek",
    shapes: [
      stroke("M72 34 C92 36 92 72 70 76", 10, "teal"),
      path("M30 20 H66 C70 40 76 60 72 92 H24 C20 60 28 40 26 30 L12 22 Z", "teal"),
    ],
  },
  {
    id: "garnuszek",
    label: "niski kubek",
    shapes: [stroke("M80 54 C94 54 94 80 80 80", 9, "orange"), rect(14, 44, 68, 48, "orange", 6)],
  },
  {
    id: "czajnik",
    label: "czajnik",
    shapes: [
      stroke("M30 46 C30 16 70 16 70 46", 6, "darkred"),
      path("M24 66 L6 50 L10 47 L28 58 Z", "red"),
      path("M20 92 C16 70 22 44 50 42 C78 44 84 70 80 92 Z", "red"),
      ellipse(50, 42, 16, 5, "red"),
      circle(50, 35, 4, "darkred"),
      rect(22, 78, 56, 5, "white", 0, true),
    ],
  },
];

export const DOMKI: readonly ShadowPicture[] = [
  {
    id: "domek-komin",
    label: "domek z kominem",
    shapes: [
      rect(64, 14, 9, 22, "darkred"),
      rect(18, 46, 64, 48, "wall"),
      path("M8 50 L50 12 L92 50 Z", "red"),
      rect(43, 66, 14, 26, "brown", 1, true),
      rect(24, 56, 13, 12, "sky", 0, true),
      rect(63, 56, 13, 12, "sky", 0, true),
    ],
  },
  {
    id: "domek-plaski",
    label: "dom z płaskim dachem",
    shapes: [
      rect(14, 30, 72, 64, "sand"),
      rect(8, 22, 84, 9, "darkgray"),
      rect(22, 40, 16, 14, "sky", 0, true),
      rect(62, 40, 16, 14, "sky", 0, true),
      rect(42, 66, 16, 26, "brown", 0, true),
    ],
  },
  {
    id: "kamienica",
    label: "wąska kamienica",
    shapes: [
      rect(30, 30, 40, 64, "wall"),
      path("M24 32 L50 6 L76 32 Z", "darkred"),
      rect(36, 40, 10, 12, "sky", 0, true),
      rect(54, 40, 10, 12, "sky", 0, true),
      rect(36, 60, 10, 12, "sky", 0, true),
      rect(54, 60, 10, 12, "sky", 0, true),
    ],
  },
  {
    id: "stodola",
    label: "stodoła",
    shapes: [
      path("M10 94 V52 L22 30 L50 18 L78 30 L90 52 V94 Z", "red"),
      rect(36, 60, 28, 32, "white", 0, true),
      rect(44, 34, 12, 12, "white", 0, true),
    ],
  },
  {
    id: "domek-wieza",
    label: "dom z wieżą",
    shapes: [
      rect(10, 50, 54, 44, "wall"),
      path("M4 54 L36 24 L66 54 Z", "red"),
      rect(62, 32, 26, 62, "wall"),
      path("M58 34 L75 6 L92 34 Z", "blue"),
      rect(68, 44, 14, 14, "sky", 0, true),
      rect(28, 66, 14, 26, "brown", 0, true),
    ],
  },
  {
    id: "chatka",
    label: "chatka z dachem do ziemi",
    shapes: [path("M6 94 L50 8 L94 94 Z", "brown"), path("M40 94 V72 C40 62 60 62 60 72 V94 Z", "darkbrown", true)],
  },
  {
    id: "igloo",
    label: "igloo",
    shapes: [
      path("M8 86 C8 40 30 22 50 22 C70 22 92 40 92 86 Z", "white"),
      path("M38 86 V68 C38 58 62 58 62 68 V86 Z", "sky", true),
      stroke("M14 66 H38 M62 66 H86 M24 46 H76 M50 22 V46 M30 46 V66 M70 46 V66", 1.4, "sky", true),
    ],
  },
  {
    id: "zamek",
    label: "zamek",
    shapes: [
      rect(6, 16, 6, 10, "gray"),
      rect(14, 16, 6, 10, "gray"),
      rect(22, 16, 6, 10, "gray"),
      rect(72, 16, 6, 10, "gray"),
      rect(80, 16, 6, 10, "gray"),
      rect(88, 16, 6, 10, "gray"),
      rect(32, 36, 6, 10, "gray"),
      rect(42, 36, 6, 10, "gray"),
      rect(52, 36, 6, 10, "gray"),
      rect(62, 36, 6, 10, "gray"),
      rect(14, 44, 72, 50, "gray"),
      rect(6, 24, 22, 70, "gray"),
      rect(72, 24, 22, 70, "gray"),
      path("M40 94 V74 C40 62 60 62 60 74 V94 Z", "brown", true),
      rect(13, 40, 8, 12, "darkgray", 2, true),
      rect(79, 40, 8, 12, "darkgray", 2, true),
    ],
  },
];

export const RYBY: readonly ShadowPicture[] = [
  {
    id: "ryba",
    label: "ryba",
    shapes: [
      path("M68 50 L94 28 L88 50 L94 72 Z", "orange"),
      ellipse(40, 50, 32, 20, "orange"),
      circle(22, 46, 3.5, "black", true),
    ],
  },
  {
    id: "ryba-dluga",
    label: "długa ryba",
    shapes: [
      path("M80 50 L97 36 L97 64 Z", "gray"),
      ellipse(44, 50, 40, 10, "gray"),
      circle(12, 48, 2.5, "black", true),
    ],
  },
  {
    id: "ryba-zagiel",
    label: "ryba z wysoką płetwą",
    shapes: [
      path("M28 54 C32 12 62 12 72 56 Z", "blue"),
      path("M70 62 L94 44 L94 80 Z", "blue"),
      ellipse(44, 62, 30, 16, "blue"),
      circle(24, 58, 3, "black", true),
    ],
  },
  {
    id: "ryba-okragla",
    label: "okrągła ryba",
    shapes: [
      path("M70 50 L90 36 L90 64 Z", "yellow"),
      circle(42, 50, 30, "yellow"),
      circle(26, 44, 3.5, "black", true),
      rect(44, 26, 6, 48, "orange", 2, true),
    ],
  },
  {
    id: "ryba-miecznik",
    label: "ryba z długim nosem",
    shapes: [
      path("M26 47 L3 50 L26 56 Z", "navy"),
      path("M76 52 L96 32 L90 52 L96 72 Z", "navy"),
      ellipse(52, 52, 28, 14, "navy"),
      circle(34, 49, 2.5, "white", true),
    ],
  },
  {
    id: "ryba-welon",
    label: "ryba z dużym ogonem",
    shapes: [
      path("M54 50 C68 18 98 16 96 40 C92 50 92 50 96 60 C98 84 68 82 54 50 Z", "red"),
      ellipse(34, 50, 24, 18, "red"),
      circle(20, 46, 3, "black", true),
    ],
  },
  {
    id: "rekin",
    label: "rekin",
    shapes: [
      path("M38 42 L52 16 L62 42 Z", "gray"),
      path("M36 62 L26 80 L48 64 Z", "gray"),
      path("M4 54 C20 36 60 34 78 46 L94 28 L90 54 L96 76 L78 62 C60 72 24 72 4 54 Z", "gray"),
      path("M10 57 C28 67 56 67 74 59 C56 63 28 63 10 57 Z", "white", true),
      circle(18, 50, 2.5, "black", true),
      stroke("M28 48 V56 M33 48 V56", 1.4, "darkgray", true),
    ],
  },
  {
    id: "rozdymka",
    label: "rozdymka",
    shapes: [
      path("M70 50 L94 34 L90 66 Z", "yellow"),
      path(star(44, 50, 14, 36, 28), "yellow"),
      circle(34, 42, 6, "white", true),
      circle(33, 43, 3, "black", true),
      ellipse(20, 56, 3, 2, "darkred", 0, true),
    ],
  },
];

export const AUTA: readonly ShadowPicture[] = [
  {
    id: "auto-osobowe",
    label: "samochód osobowy",
    shapes: [
      path("M24 52 L34 32 H66 L78 52 Z", "blue"),
      rect(6, 50, 88, 26, "blue", 7),
      path("M30 50 L37 36 H48 V50 Z", "sky", true),
      path("M53 50 V36 H64 L72 50 Z", "sky", true),
      circle(26, 78, 11, "black"),
      circle(74, 78, 11, "black"),
      circle(26, 78, 4, "gray", true),
      circle(74, 78, 4, "gray", true),
    ],
  },
  {
    id: "terenowe",
    label: "samochód terenowy",
    shapes: [
      rect(8, 28, 84, 46, "darkgreen", 4),
      rect(16, 36, 22, 16, "sky", 0, true),
      rect(46, 36, 22, 16, "sky", 0, true),
      circle(26, 78, 13, "black"),
      circle(74, 78, 13, "black"),
      circle(26, 78, 5, "gray", true),
      circle(74, 78, 5, "gray", true),
    ],
  },
  {
    id: "autobus",
    label: "autobus",
    shapes: [
      rect(4, 26, 92, 52, "yellow", 6),
      rect(10, 34, 16, 16, "sky", 0, true),
      rect(32, 34, 16, 16, "sky", 0, true),
      rect(54, 34, 16, 16, "sky", 0, true),
      rect(76, 34, 14, 30, "sky", 0, true),
      circle(22, 80, 9, "black"),
      circle(76, 80, 9, "black"),
    ],
  },
  {
    id: "ciezarowka",
    label: "ciężarówka",
    shapes: [
      rect(4, 18, 58, 56, "gray", 2),
      rect(62, 34, 32, 40, "red", 4),
      rect(70, 40, 18, 14, "sky", 0, true),
      circle(18, 80, 9, "black"),
      circle(46, 80, 9, "black"),
      circle(80, 80, 9, "black"),
    ],
  },
  {
    id: "wyscigowe",
    label: "wyścigówka",
    shapes: [
      path("M4 72 L4 44 H14 L16 56 L40 52 L52 40 H66 L74 52 L92 56 L96 72 Z", "red"),
      path("M54 50 L58 44 H64 L68 50 Z", "sky", true),
      circle(24, 74, 10, "black"),
      circle(78, 74, 10, "black"),
    ],
  },
  {
    id: "garbus",
    label: "mały okrągły samochód",
    shapes: [
      path("M6 74 C6 42 28 26 50 26 C72 26 94 42 94 74 Z", "lime"),
      path("M30 50 C32 40 40 34 48 34 V50 Z", "sky", true),
      path("M54 34 C62 34 70 40 72 50 H54 Z", "sky", true),
      circle(26, 78, 10, "black"),
      circle(74, 78, 10, "black"),
    ],
  },
  {
    id: "traktor",
    label: "traktor",
    shapes: [
      rect(46, 50, 46, 22, "green", 3),
      rect(18, 18, 30, 52, "green", 3),
      rect(24, 24, 18, 18, "sky", 0, true),
      rect(76, 36, 5, 14, "darkgray"),
      circle(30, 74, 19, "black"),
      circle(80, 82, 11, "black"),
      circle(30, 74, 7, "gray", true),
    ],
  },
  {
    id: "motocykl",
    label: "motocykl",
    // Przerysowany 2026-11-21 (uwaga użytkowniczki): bak, siodełko, silnik, widelec z kierownicą, błotnik i duże koła.
    shapes: [
      stroke("M80 70 L69 32", 5, "darkgray"),
      stroke("M71 34 L64 24 H56", 4, "black"),
      stroke("M24 70 L44 62", 4, "darkgray"),
      circle(22, 70, 17, "black"),
      circle(80, 70, 17, "black"),
      path("M4 64 C6 46 32 42 40 56 L33 59 C28 51 14 52 11 64 Z", "red"),
      path("M14 46 C18 40 34 39 40 43 V50 H16 Z", "black"),
      path("M36 44 C42 34 60 32 70 40 L66 51 H38 Z", "red"),
      rect(38, 50, 24, 18, "gray", 3),
      circle(76, 42, 5, "yellow"),
      circle(22, 70, 7, "gray", true),
      circle(80, 70, 7, "gray", true),
      stroke("M42 56 H58 M42 62 H58", 1.4, "darkgray", true),
    ],
  },
];

export const DRZEWA: readonly ShadowPicture[] = [
  {
    id: "choinka",
    label: "choinka",
    shapes: [
      rect(44, 80, 12, 15, "brown"),
      path("M50 6 L70 32 L62 32 L80 56 L70 56 L90 82 L10 82 L30 56 L20 56 L38 32 L30 32 Z", "green"),
      circle(40, 52, 3.2, "red", true),
      circle(60, 70, 3.2, "yellow", true),
      circle(36, 74, 3.2, "yellow", true),
    ],
  },
  {
    id: "drzewo-okragle",
    label: "drzewo z okrągłą koroną",
    shapes: [rect(44, 60, 12, 34, "brown"), circle(50, 38, 32, "leaf")],
  },
  {
    id: "palma",
    label: "palma",
    shapes: [
      path("M48 94 C46 70 50 52 54 34 H60 C56 52 54 72 56 94 Z", "brown"),
      path(
        "M56 34 C40 16 20 20 8 32 C24 28 40 30 54 38 Z M56 34 C70 14 88 18 96 30 C80 26 66 30 58 38 Z M56 36 C46 40 30 52 26 66 C38 54 48 46 58 40 Z M58 36 C70 42 84 54 86 68 C76 56 66 48 56 40 Z",
        "green",
      ),
    ],
  },
  {
    id: "topola",
    label: "wysokie wąskie drzewo",
    shapes: [rect(46, 76, 8, 18, "brown"), ellipse(50, 42, 16, 38, "darkgreen")],
  },
  {
    id: "sosna-parasol",
    label: "sosna z płaską koroną",
    shapes: [path("M45 94 L47 40 H53 L55 94 Z", "brown"), ellipse(50, 30, 44, 17, "darkgreen")],
  },
  {
    id: "jablonka",
    label: "szeroka jabłonka",
    shapes: [
      rect(44, 62, 12, 32, "brown"),
      path("M20 58 C4 56 4 30 22 30 C22 12 44 8 52 18 C62 8 84 12 82 30 C96 30 96 56 80 58 Z", "leaf"),
      circle(32, 42, 4, "red", true),
      circle(56, 30, 4, "red", true),
      circle(70, 46, 4, "red", true),
    ],
  },
  {
    id: "dab",
    label: "dąb",
    shapes: [
      rect(42, 62, 16, 32, "brown"),
      circle(28, 46, 18, "green"),
      circle(50, 30, 21, "green"),
      circle(72, 46, 18, "green"),
      circle(40, 58, 15, "green"),
      circle(60, 58, 15, "green"),
    ],
  },
  {
    id: "wierzba",
    label: "wierzba płacząca",
    shapes: [
      rect(44, 56, 12, 38, "brown"),
      path(
        "M12 72 C8 30 30 10 50 10 C70 10 92 30 88 72 L82 62 L77 76 L71 62 L65 78 L58 62 L50 80 L42 62 L35 78 L29 62 L23 76 L18 62 Z",
        "leaf",
      ),
    ],
  },
];

export const KLUCZE: readonly ShadowPicture[] = [
  {
    id: "klucz-okragly",
    label: "klucz z okrągłą główką",
    shapes: [
      rect(36, 46, 58, 8, "yellow"),
      path("M78 54 H92 V66 H86 V60 H78 Z", "yellow"),
      circle(22, 50, 18, "yellow"),
      circle(22, 50, 7, "white", true),
    ],
  },
  {
    id: "klucz-kwadratowy",
    label: "klucz z kwadratową główką",
    shapes: [
      rect(38, 46, 56, 8, "gray"),
      path("M66 54 H74 V68 H66 Z M84 54 H92 V62 H84 Z", "gray"),
      rect(4, 30, 36, 40, "gray", 4),
      rect(14, 42, 16, 16, "white", 2, true),
    ],
  },
  {
    id: "klucz-serce",
    label: "klucz z główką w serce",
    shapes: [
      rect(40, 46, 54, 8, "red"),
      path("M72 54 H94 V60 H88 V68 H80 V60 H72 Z", "red"),
      path("M24 74 C6 60 2 42 12 33 C18 27 24 31 24 37 C24 31 30 27 36 33 C46 42 42 60 24 74 Z", "red"),
    ],
  },
  {
    id: "klucz-koniczyna",
    label: "klucz z główką w koniczynę",
    shapes: [
      rect(40, 46, 54, 8, "green"),
      path("M62 54 H70 V64 H62 Z M80 54 H94 V68 H80 Z", "green"),
      circle(24, 34, 12, "green"),
      circle(12, 58, 12, "green"),
      circle(36, 58, 12, "green"),
    ],
  },
  {
    id: "klucz-dlugi",
    label: "długi klucz",
    shapes: [
      rect(24, 47, 72, 6, "blue"),
      path("M58 53 H64 V64 H58 Z M72 53 H78 V59 H72 Z M86 53 H92 V66 H86 Z", "blue"),
      circle(14, 50, 12, "blue"),
      circle(14, 50, 5, "white", true),
    ],
  },
  {
    id: "klucz-staromodny",
    label: "stary klucz",
    shapes: [
      rect(38, 46, 46, 8, "brown"),
      rect(70, 54, 16, 24, "brown"),
      ellipse(22, 50, 17, 26, "brown"),
      ellipse(22, 50, 7, 14, "white", 0, true),
    ],
  },
  {
    id: "klucz-trojkat",
    label: "klucz z trójkątną główką",
    shapes: [
      rect(38, 46, 56, 8, "orange"),
      path("M70 54 H78 V64 H70 Z M84 54 H92 V70 H84 Z", "orange"),
      path("M6 26 L46 50 L6 74 Z", "orange"),
      circle(19, 50, 6, "white", true),
    ],
  },
  {
    id: "klucz-brelok",
    label: "klucz z brelokiem",
    shapes: [
      path("M8 50 L24 44 L34 70 L18 76 Z", "red"),
      rect(40, 36, 54, 8, "gray"),
      path("M80 44 H92 V58 H86 V50 H80 Z", "gray"),
      circle(30, 40, 14, "gray"),
      circle(30, 40, 5.5, "white", true),
      circle(21, 62, 2.5, "white", true),
    ],
  },
];

/** Petals in a ring around (cx, cy): `n` ellipses `dist` from the centre, the long side pointing outwards. */
function petals(cx: number, cy: number, n: number, dist: number, rx: number, ry: number, paint: "white" | "yellow") {
  return Array.from({ length: n }, (_, k) => {
    const angle = (360 / n) * k;
    const rad = (angle * Math.PI) / 180;
    const x = Math.round((cx + dist * Math.cos(rad)) * 10) / 10;
    const y = Math.round((cy + dist * Math.sin(rad)) * 10) / 10;
    return ellipse(x, y, rx, ry, paint, angle);
  });
}

/** A star with `n` points around (cx, cy): outer radius `outer`, inner radius `inner`. */
function star(cx: number, cy: number, n: number, outer: number, inner: number): string {
  const points = Array.from({ length: 2 * n }, (_, k) => {
    const r = k % 2 === 0 ? outer : inner;
    const rad = ((180 / n) * k - 90) * (Math.PI / 180);
    return `${Math.round((cx + r * Math.cos(rad)) * 10) / 10} ${Math.round((cy + r * Math.sin(rad)) * 10) / 10}`;
  });
  return `M${points.join(" L")} Z`;
}

/** A lavender spike: `n` small buds stacked down from (x, top). */
function spike(x: number, top: number, n: number) {
  return Array.from({ length: n }, (_, k) => ellipse(x, top + 4 * k, 4, 3, "purple"));
}

/** A hanging bell flower whose top is at (x, y). */
function bell(x: number, y: number): string {
  return `M${x - 5} ${y} C${x - 6} ${y + 8} ${x - 8} ${y + 12} ${x - 10} ${y + 17} L${x - 6} ${y + 15} L${x - 3} ${y + 18} L${x} ${y + 16} L${x + 3} ${y + 18} L${x + 6} ${y + 15} L${x + 10} ${y + 17} C${x + 8} ${y + 12} ${x + 6} ${y + 8} ${x + 5} ${y} Z`;
}

// Dodane 2026-11-21 (prośba użytkowniczki): różne kwiaty na łodydze; różnią się kształtem kwiatu i liści.
export const KWIATY: readonly ShadowPicture[] = [
  {
    id: "tulipan",
    label: "tulipan",
    shapes: [
      stroke("M50 48 V96", 4, "green"),
      path("M49 94 C36 86 28 70 30 54 C40 64 46 76 50 86 Z", "leaf"),
      path("M51 94 C62 88 70 76 70 64 C62 72 56 80 50 88 Z", "leaf"),
      path("M32 18 L41 28 L50 14 L59 28 L68 18 C71 38 63 52 50 52 C37 52 29 38 32 18 Z", "red"),
    ],
  },
  {
    id: "stokrotka",
    label: "stokrotka",
    shapes: [
      stroke("M50 40 V96", 4, "green"),
      ellipse(40, 78, 11, 4.5, "leaf", -30),
      ...petals(50, 30, 12, 14, 7, 3.6, "white"),
      circle(50, 30, 7, "yellow"),
    ],
  },
  {
    id: "slonecznik",
    label: "słonecznik",
    shapes: [
      stroke("M50 50 V96", 6, "green"),
      path("M48 76 C38 64 22 66 18 74 C26 84 40 84 48 76 Z", "leaf"),
      path("M52 70 C62 58 78 60 82 68 C74 78 60 78 52 70 Z", "leaf"),
      ...petals(50, 30, 16, 18, 9, 3.4, "yellow"),
      circle(50, 30, 12, "brown"),
      circle(46, 27, 1.6, "darkbrown", true),
      circle(54, 27, 1.6, "darkbrown", true),
      circle(50, 33, 1.6, "darkbrown", true),
      circle(44, 34, 1.6, "darkbrown", true),
      circle(56, 34, 1.6, "darkbrown", true),
    ],
  },
  {
    id: "roza",
    label: "róża",
    shapes: [
      stroke("M50 50 V96", 4, "green"),
      path("M52 60 L58 57 L52 65 Z M48 86 L42 83 L48 91 Z", "green"),
      path("M50 70 C40 62 30 64 24 70 C30 77 42 77 50 70 Z", "leaf"),
      path("M50 80 C60 72 70 74 76 80 C70 87 58 87 50 80 Z", "leaf"),
      path("M41 41 L50 53 L59 41 Z", "green"),
      path(
        "M32 26 C30 14 38 9 44 14 C46 7 54 7 56 14 C62 9 70 14 68 26 C66 38 58 44 50 44 C42 44 34 38 32 26 Z",
        "red",
      ),
      stroke("M37 22 C41 33 59 33 63 22 M44 17 C46 25 54 25 56 17 M42 36 C46 40 54 40 58 36", 1.6, "darkred", true),
    ],
  },
  {
    id: "dzwonek",
    label: "dzwonek",
    shapes: [
      stroke("M36 96 C36 58 46 30 72 18 L84 22 M55 30 L65 36 M44 47 L54 54", 3.5, "green"),
      path("M37 94 C26 86 22 74 24 64 C30 72 34 82 38 90 Z", "leaf"),
      path(bell(84, 21), "purple"),
      path(bell(65, 35), "purple"),
      path(bell(54, 53), "purple"),
    ],
  },
  {
    id: "mak",
    label: "mak",
    shapes: [
      stroke("M50 44 C46 62 54 78 50 96", 3.5, "green"),
      path("M50 82 L40 78 L43 73 L33 71 L37 66 L27 62 C38 59 47 66 51 76 Z", "leaf"),
      path(
        "M22 30 C18 16 34 10 44 18 C46 12 54 12 56 18 C66 10 82 16 78 30 C76 40 64 46 50 46 C36 46 24 40 22 30 Z",
        "red",
      ),
      circle(50, 29, 6, "black", true),
    ],
  },
  {
    id: "zonkil",
    label: "żonkil",
    shapes: [
      stroke("M50 44 V96", 4, "green"),
      path("M49 96 C40 80 37 64 39 50 C44 64 48 80 51 92 Z", "leaf"),
      path("M51 96 C60 80 63 64 61 50 C56 64 52 80 49 92 Z", "leaf"),
      path(star(50, 28, 6, 22, 10), "yellow"),
      circle(50, 28, 8, "orange"),
      circle(50, 28, 4, "darkred", true),
    ],
  },
  {
    id: "lawenda",
    label: "lawenda",
    shapes: [
      stroke("M50 96 V34 M50 96 C46 76 36 60 30 46 M50 96 C54 76 64 60 70 46", 3.4, "green"),
      ...spike(50, 8, 7),
      ...spike(30, 22, 6),
      ...spike(70, 22, 6),
    ],
  },
];
