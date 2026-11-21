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
    shapes: [
      stroke("M80 54 C94 54 94 80 80 80", 9, "orange"),
      rect(14, 44, 68, 48, "orange", 6),
      circle(48, 68, 8, "white", true),
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
];
