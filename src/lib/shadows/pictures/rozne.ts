// The six "rozne" families of the shadows card: different things of a similar shape (the medium level takes five of
// one family). Real, simplified colors; details inside the outline (seeds, eyes, windows) are left out of the shadow.
import { circle, ellipse, path, rect, stroke, type ShadowPicture } from "../picture-format.ts";

export const OWOCE: readonly ShadowPicture[] = [
  {
    id: "jablko",
    label: "jabłko",
    shapes: [
      rect(47.5, 10, 5, 18, "brown", 2),
      ellipse(64, 16, 11, 5.5, "leaf", -25),
      path("M50 30 C32 16 6 28 10 58 C14 86 38 96 50 88 C62 96 86 86 90 58 C94 28 68 16 50 30 Z", "red"),
    ],
  },
  {
    id: "gruszka",
    label: "gruszka",
    shapes: [
      rect(48, 6, 4, 16, "brown", 2),
      ellipse(60, 12, 9, 4.5, "leaf", -25),
      path(
        "M50 20 C40 20 38 34 36 44 C34 54 18 62 20 78 C22 94 40 97 50 96 C60 97 78 94 80 78 C82 62 66 54 64 44 C62 34 60 20 50 20 Z",
        "lime",
      ),
    ],
  },
  {
    id: "cytryna",
    label: "cytryna",
    shapes: [
      path(
        "M8 54 C8 50 12 48 16 44 C28 24 72 24 84 44 C88 48 92 50 92 54 C92 58 88 60 84 64 C72 84 28 84 16 64 C12 60 8 58 8 54 Z",
        "yellow",
      ),
    ],
  },
  {
    id: "truskawka",
    label: "truskawka",
    shapes: [
      path("M50 26 C64 22 90 28 86 50 C82 72 60 94 50 96 C40 94 18 72 14 50 C10 28 36 22 50 26 Z", "red"),
      path("M50 30 L38 18 L46 22 L50 10 L54 22 L62 18 Z M32 30 L44 26 H56 L68 30 L58 34 L50 30 L42 34 Z", "leaf"),
      circle(36, 48, 1.8, "yellow", true),
      circle(52, 46, 1.8, "yellow", true),
      circle(66, 50, 1.8, "yellow", true),
      circle(44, 64, 1.8, "yellow", true),
      circle(60, 66, 1.8, "yellow", true),
      circle(52, 80, 1.8, "yellow", true),
    ],
  },
  {
    id: "pomarancza",
    label: "pomarańcza",
    shapes: [rect(48, 10, 4, 10, "brown", 2), ellipse(39, 14, 10, 5, "leaf", 20), circle(50, 58, 38, "orange")],
  },
  {
    id: "banan",
    label: "banan",
    shapes: [
      path("M14 30 C20 72 60 88 92 64 C94 60 92 57 88 59 C60 74 34 62 26 30 Z", "yellow"),
      path("M12 30 L18 20 L28 26 L26 32 Z", "brown"),
    ],
  },
  {
    id: "wisnie",
    label: "wiśnie",
    shapes: [
      stroke("M30 62 C34 40 44 22 60 12 M70 58 C66 40 62 26 60 12", 4, "darkgreen"),
      ellipse(70, 16, 10, 5, "leaf", -20),
      circle(30, 74, 16, "darkred"),
      circle(70, 70, 16, "darkred"),
    ],
  },
];

export const WARZYWA: readonly ShadowPicture[] = [
  {
    id: "marchewka",
    label: "marchewka",
    shapes: [path("M50 30 L38 6 L47 16 L50 2 L53 16 L62 6 Z", "leaf"), path("M34 28 H66 L53 96 H47 Z", "orange")],
  },
  {
    id: "pomidor",
    label: "pomidor",
    shapes: [
      ellipse(50, 60, 42, 30, "red"),
      path("M50 28 L36 22 L46 31 L32 36 L48 35 L50 42 L52 35 L68 36 L54 31 L64 22 Z", "green"),
    ],
  },
  {
    id: "papryka",
    label: "papryka",
    shapes: [
      rect(46, 10, 8, 20, "darkgreen", 3),
      path(
        "M30 28 C12 32 12 70 24 86 C34 98 44 90 50 94 C56 90 66 98 76 86 C88 70 88 32 70 28 C62 26 56 30 50 30 C44 30 38 26 30 28 Z",
        "yellow",
      ),
    ],
  },
  {
    id: "brokul",
    label: "brokuł",
    shapes: [
      path("M40 94 L44 58 H56 L60 94 Z", "lime"),
      circle(30, 44, 17, "darkgreen"),
      circle(70, 44, 17, "darkgreen"),
      circle(50, 30, 19, "darkgreen"),
      circle(50, 54, 15, "darkgreen"),
    ],
  },
  {
    id: "cebula",
    label: "cebula",
    shapes: [path("M50 6 C54 24 86 40 86 64 C86 84 70 94 50 94 C30 94 14 84 14 64 C14 40 46 24 50 6 Z", "sand")],
  },
  {
    id: "baklazan",
    label: "bakłażan",
    shapes: [
      rect(47, 6, 6, 14, "green", 2),
      path("M40 26 C20 40 14 70 30 88 C44 100 66 94 72 76 C78 58 70 40 58 28 Z", "purple"),
      path("M36 32 L44 18 H56 L64 32 L54 27 L50 34 L46 27 Z", "green"),
    ],
  },
];

export const ZWIERZETA: readonly ShadowPicture[] = [
  {
    id: "kot",
    label: "kot",
    shapes: [
      stroke("M74 88 C92 86 94 64 84 56", 7, "gray"),
      path(
        "M24 94 C22 70 26 58 34 50 C26 42 26 28 32 20 L30 6 L42 16 C46 15 54 15 58 16 L70 6 L68 20 C74 28 74 42 66 50 C74 58 78 70 76 94 Z",
        "gray",
      ),
      circle(42, 32, 3, "black", true),
      circle(58, 32, 3, "black", true),
    ],
  },
  {
    id: "krolik",
    label: "królik",
    shapes: [
      ellipse(40, 20, 7, 18, "cream"),
      ellipse(60, 20, 7, 18, "cream"),
      ellipse(50, 76, 24, 20, "cream"),
      circle(50, 46, 18, "cream"),
      ellipse(40, 20, 3, 11, "pink", 0, true),
      ellipse(60, 20, 3, 11, "pink", 0, true),
      circle(44, 44, 2.5, "black", true),
      circle(56, 44, 2.5, "black", true),
    ],
  },
  {
    id: "mis",
    label: "miś",
    shapes: [
      circle(30, 18, 10, "brown"),
      circle(70, 18, 10, "brown"),
      ellipse(50, 74, 30, 22, "brown"),
      circle(50, 36, 24, "brown"),
      ellipse(50, 44, 9, 7, "sand", 0, true),
      circle(41, 30, 3, "black", true),
      circle(59, 30, 3, "black", true),
    ],
  },
  {
    id: "mysz",
    label: "mysz",
    // Side view (uwaga użytkowniczki 2026-11-21: ma mieć spiczasty pyszczek i duże uszy).
    shapes: [
      stroke("M80 80 C94 82 96 68 88 62 C82 58 84 50 92 46", 3, "gray"),
      rect(30, 82, 9, 8, "gray", 3),
      rect(60, 82, 9, 8, "gray", 3),
      circle(42, 42, 12, "gray"),
      path("M4 74 L22 61 C30 52 46 48 60 50 C76 52 86 64 84 78 C82 86 74 88 64 88 H24 C16 88 9 82 4 74 Z", "gray"),
      circle(30, 46, 13, "gray"),
      circle(30, 46, 7, "pink", true),
      circle(20, 66, 2.5, "black", true),
      circle(9, 73, 2, "pink", true),
    ],
  },
  {
    id: "zolw",
    label: "żółw",
    shapes: [
      rect(22, 66, 12, 18, "leaf", 4),
      rect(64, 66, 12, 18, "leaf", 4),
      circle(88, 62, 9, "leaf"),
      path("M12 72 C12 40 30 30 50 30 C70 30 84 40 84 72 Z", "green"),
      circle(48, 52, 8, "darkgreen", true),
    ],
  },
  {
    id: "slimak",
    label: "ślimak",
    shapes: [
      stroke("M14 74 L8 56 M22 74 L24 56", 3, "sand"),
      path("M6 88 C6 76 16 72 30 72 H86 C94 72 96 80 94 88 Z", "sand"),
      circle(58, 50, 26, "orange"),
      circle(58, 50, 10, "brown", true),
    ],
  },
];

export const PTAKI: readonly ShadowPicture[] = [
  {
    id: "kura",
    label: "kura",
    shapes: [
      rect(40, 80, 4, 14, "orange"),
      rect(56, 80, 4, 14, "orange"),
      path("M80 50 L96 30 L92 56 Z", "white"),
      ellipse(54, 60, 30, 22, "white"),
      circle(28, 38, 13, "white"),
      path("M22 26 C22 18 28 18 28 24 C30 16 36 18 34 26 Z", "red"),
      path("M16 38 L6 42 L16 46 Z", "yellow"),
      circle(26, 36, 2, "black", true),
    ],
  },
  {
    id: "kaczka",
    label: "kaczka",
    shapes: [
      ellipse(56, 70, 38, 20, "yellow"),
      circle(32, 40, 16, "yellow"),
      path("M17 38 L3 42 L17 47 Z", "orange"),
      circle(30, 36, 2.5, "black", true),
    ],
  },
  {
    id: "sowa",
    label: "sowa",
    // Przerysowana 2026-11-21 (uwaga użytkowniczki: wyglądała strasznie): jasna twarz, dziób, błysk w oku,
    // brzuszek, skrzydła i łapki na gałęzi.
    shapes: [
      stroke("M8 90 H92", 6, "darkbrown"),
      path("M30 36 C28 28 28 22 30 16 C36 20 42 25 44 29 Z M70 36 C72 28 72 22 70 16 C64 20 58 25 56 29 Z", "brown"),
      ellipse(50, 58, 30, 32, "brown"),
      ellipse(41, 90, 6, 3, "orange"),
      ellipse(59, 90, 6, 3, "orange"),
      ellipse(32, 64, 6, 14, "darkbrown", 10, true),
      ellipse(68, 64, 6, 14, "darkbrown", -10, true),
      ellipse(50, 71, 13, 14, "sand", 0, true),
      circle(39, 44, 11, "sand", true),
      circle(61, 44, 11, "sand", true),
      circle(39, 44, 7, "white", true),
      circle(61, 44, 7, "white", true),
      circle(40, 45, 3.5, "black", true),
      circle(60, 45, 3.5, "black", true),
      circle(41.2, 43.6, 1.2, "white", true),
      circle(61.2, 43.6, 1.2, "white", true),
      path("M46 52 H54 L50 60 Z", "orange", true),
    ],
  },
  {
    id: "pingwin",
    label: "pingwin",
    shapes: [
      ellipse(40, 94, 9, 4, "orange"),
      ellipse(60, 94, 9, 4, "orange"),
      ellipse(50, 54, 28, 38, "black"),
      ellipse(50, 62, 18, 26, "white", 0, true),
      path("M44 34 H56 L50 42 Z", "orange", true),
    ],
  },
  {
    id: "ptaszek",
    label: "ptaszek",
    shapes: [
      stroke("M44 76 L42 92 M54 76 L56 92", 3, "darkgray"),
      path("M70 52 L96 40 L92 62 Z", "sand"),
      ellipse(50, 58, 28, 20, "sand"),
      circle(28, 42, 14, "sand"),
      path("M15 40 L4 44 L15 47 Z", "orange"),
      circle(26, 39, 2, "black", true),
    ],
  },
  {
    id: "labedz",
    label: "łabędź",
    shapes: [
      stroke("M40 70 C30 44 30 24 44 18", 8, "white"),
      circle(46, 17, 7, "white"),
      path("M52 14 L64 18 L52 21 Z", "orange"),
      path("M18 70 C18 86 38 92 60 92 C84 92 96 80 92 62 C80 72 60 70 44 66 Z", "white"),
    ],
  },
];

export const UBRANIA: readonly ShadowPicture[] = [
  {
    id: "koszulka",
    label: "koszulka",
    shapes: [path("M30 12 L8 28 L20 46 L28 40 V92 H72 V40 L80 46 L92 28 L70 12 C64 22 36 22 30 12 Z", "blue")],
  },
  { id: "spodnie", label: "spodnie", shapes: [path("M26 6 H74 L82 94 H58 L50 40 L42 94 H18 Z", "navy")] },
  { id: "sukienka", label: "sukienka", shapes: [path("M38 6 H62 L64 30 L90 92 H10 L36 30 Z", "pink")] },
  {
    id: "czapka",
    label: "czapka z pomponem",
    shapes: [
      circle(50, 18, 11, "white"),
      path("M16 76 C16 42 30 28 50 28 C70 28 84 42 84 76 Z", "red"),
      rect(12, 70, 76, 18, "white", 3),
    ],
  },
  {
    id: "skarpeta",
    label: "skarpetka",
    shapes: [
      path("M30 6 H60 V54 L84 68 C94 74 90 94 76 94 H38 C26 94 26 80 30 72 Z", "teal"),
      rect(30, 6, 30, 10, "white", 0, true),
    ],
  },
  {
    id: "rekawiczka",
    label: "rękawiczka",
    shapes: [
      path("M26 94 V44 C26 28 34 18 46 18 C58 18 64 28 64 44 V56 L74 40 C78 32 90 36 86 46 L72 80 V94 Z", "purple"),
      rect(30, 82, 38, 8, "white", 0, true),
    ],
  },
];

export const ZABAWKI: readonly ShadowPicture[] = [
  {
    id: "grzechotka",
    label: "grzechotka",
    shapes: [
      rect(44, 52, 12, 34, "red", 4),
      circle(50, 88, 8, "red"),
      circle(50, 30, 24, "yellow"),
      circle(42, 24, 4, "white", true),
    ],
  },
  {
    id: "balon",
    label: "balon",
    shapes: [
      stroke("M50 72 C40 80 60 88 50 97", 3, "darkgray"),
      path("M45 66 H55 L50 74 Z", "red"),
      ellipse(50, 36, 26, 32, "red"),
    ],
  },
  {
    id: "latawiec",
    label: "latawiec",
    shapes: [
      stroke("M50 74 C40 84 60 88 52 97", 3, "blue"),
      path("M50 4 L80 40 L50 76 L20 40 Z", "orange"),
      rect(49, 8, 2, 64, "yellow", 0, true),
    ],
  },
  {
    id: "baczek",
    label: "bączek",
    shapes: [rect(45, 14, 10, 26, "red", 2), path("M50 96 L14 54 C14 34 86 34 86 54 Z", "purple")],
  },
  {
    id: "wiaderko",
    label: "wiaderko",
    shapes: [stroke("M24 32 C24 4 76 4 76 32", 4, "darkgray"), path("M20 30 H80 L70 94 H30 Z", "blue")],
  },
  {
    id: "samolocik",
    label: "samolocik",
    shapes: [
      path("M44 48 L60 12 H68 L60 48 Z M44 52 L60 88 H68 L60 52 Z", "sky"),
      path("M84 48 L94 34 H98 L94 50 Z", "sky"),
      ellipse(50, 50, 46, 9, "sky"),
    ],
  },
];
