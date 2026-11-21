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
      // Przerysowany 2026-11-21 (uwaga użytkowniczki): pełny łuk, grubszy w środku, zwężony do ogonka i czubka.
      path("M23 10 L29 9 L31 26 L25 26 Z", "brown"),
      path("M25 24 C12 56 30 86 62 86 C76 86 88 82 95 72 C84 76 70 76 58 72 C42 66 31 50 31 24 Z", "yellow"),
      circle(94, 73, 2.6, "darkbrown"),
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
  {
    id: "arbuz",
    label: "arbuz",
    shapes: [
      path("M6 30 C6 76 94 76 94 30 Z", "green"),
      path("M13 32 C15 66 85 66 87 32 Z", "red", true),
      ellipse(32, 42, 2, 3, "black", 0, true),
      ellipse(50, 48, 2, 3, "black", 0, true),
      ellipse(68, 42, 2, 3, "black", 0, true),
      ellipse(41, 54, 2, 3, "black", 0, true),
      ellipse(59, 54, 2, 3, "black", 0, true),
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
    // Przerysowana 2026-11-21 (uwaga użytkowniczki): bulwa z suchym czubkiem, korzonkami i liniami łusek.
    shapes: [
      stroke("M42 90 L37 98 M50 91 V99 M58 90 L63 98", 3, "darkbrown"),
      path("M46 4 H54 L53 22 H47 Z", "brown"),
      path("M47 18 C46 30 22 38 16 60 C12 80 30 92 50 92 C70 92 88 80 84 60 C78 38 54 30 53 18 Z", "sand"),
      stroke("M48 26 C32 40 28 70 42 88 M52 26 C68 40 72 70 58 88 M50 28 V88", 1.6, "brown", true),
    ],
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
  {
    id: "kukurydza",
    label: "kukurydza",
    shapes: [
      ellipse(50, 46, 14, 34, "yellow"),
      path("M50 94 C30 80 26 56 34 40 C38 60 44 74 52 82 Z", "leaf"),
      path("M50 94 C70 80 74 56 66 40 C62 60 56 74 48 82 Z", "leaf"),
      stroke("M40 30 H60 M39 40 H61 M40 50 H60 M44 20 V60 M50 14 V62 M56 20 V60", 1.2, "orange", true),
    ],
  },
  {
    id: "rzodkiewka",
    label: "rzodkiewka",
    shapes: [
      stroke("M50 80 C50 88 53 93 50 98", 3.4, "white"),
      ellipse(38, 26, 8, 16, "leaf", -25),
      ellipse(62, 26, 8, 16, "leaf", 25),
      ellipse(50, 20, 7, 17, "leaf"),
      circle(50, 60, 22, "red"),
      path("M36 70 C40 80 60 80 64 70 C58 76 42 76 36 70 Z", "white", true),
    ],
  },
];

export const ZWIERZETA: readonly ShadowPicture[] = [
  {
    id: "kot",
    label: "kot",
    // Przerysowany 2026-11-21 (uwaga użytkowniczki): rudy kot siedzący, z ogonem, uszami, pyszczkiem i wąsami.
    shapes: [
      stroke("M68 88 C88 88 94 70 86 58", 8, "orange"),
      path("M30 94 C26 76 32 60 42 54 H58 C68 60 74 76 70 94 Z", "orange"),
      ellipse(42, 93, 7, 4, "orange"),
      ellipse(58, 93, 7, 4, "orange"),
      path("M32 32 L30 10 L46 22 Z M68 32 L70 10 L54 22 Z", "orange"),
      circle(50, 38, 20, "orange"),
      path("M34 27 L33 15 L42 22 Z M66 27 L67 15 L58 22 Z", "pink", true),
      ellipse(50, 77, 9, 13, "cream", 0, true),
      ellipse(42, 36, 3, 4, "black", 0, true),
      ellipse(58, 36, 3, 4, "black", 0, true),
      path("M47 43 H53 L50 47 Z", "pink", true),
      stroke("M35 45 L44 47 M35 51 L44 49 M65 45 L56 47 M65 51 L56 49", 1.2, "black", true),
    ],
  },
  {
    id: "krolik",
    label: "królik",
    // Przerysowany 2026-11-21 (uwaga użytkowniczki): długie uszy, okrągła głowa, pulchny brzuch i duże łapy.
    shapes: [
      ellipse(41, 22, 7, 19, "white", -10),
      ellipse(59, 22, 7, 19, "white", 10),
      ellipse(50, 74, 22, 19, "white"),
      ellipse(37, 92, 10, 5, "white"),
      ellipse(63, 92, 10, 5, "white"),
      circle(50, 48, 17, "white"),
      ellipse(41, 23, 3.2, 13, "pink", -10, true),
      ellipse(59, 23, 3.2, 13, "pink", 10, true),
      ellipse(50, 78, 11, 11, "cream", 0, true),
      circle(43, 46, 2.6, "black", true),
      circle(57, 46, 2.6, "black", true),
      path("M47 52 H53 L50 55 Z", "pink", true),
      stroke("M38 54 L45 55 M62 54 L55 55", 1.2, "black", true),
    ],
  },
  {
    id: "mis",
    label: "miś",
    // Przerysowany 2026-11-21 (uwaga użytkowniczki): pluszowy miś z łapkami, pyszczkiem i podeszwami.
    shapes: [
      circle(32, 20, 9, "brown"),
      circle(68, 20, 9, "brown"),
      ellipse(26, 60, 8, 14, "brown", 30),
      ellipse(74, 60, 8, 14, "brown", -30),
      ellipse(36, 86, 11, 9, "brown"),
      ellipse(64, 86, 11, 9, "brown"),
      ellipse(50, 66, 22, 24, "brown"),
      circle(50, 36, 20, "brown"),
      circle(32, 20, 4.5, "sand", true),
      circle(68, 20, 4.5, "sand", true),
      ellipse(50, 71, 11, 12, "sand", 0, true),
      ellipse(36, 88, 5.5, 4.5, "sand", 0, true),
      ellipse(64, 88, 5.5, 4.5, "sand", 0, true),
      ellipse(50, 44, 9, 7, "sand", 0, true),
      ellipse(50, 41.5, 3.5, 2.5, "black", 0, true),
      stroke("M46 47 C48 49 52 49 54 47", 1.2, "black", true),
      circle(42, 32, 2.6, "black", true),
      circle(58, 32, 2.6, "black", true),
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
  {
    id: "pies",
    label: "pies",
    shapes: [
      stroke("M32 88 C14 86 10 72 16 62", 7, "sand"),
      path("M30 94 C26 76 32 60 42 54 H58 C68 60 74 76 70 94 Z", "sand"),
      ellipse(42, 93, 7, 4, "sand"),
      ellipse(58, 93, 7, 4, "sand"),
      circle(50, 38, 18, "sand"),
      ellipse(31, 40, 7, 15, "brown", 15),
      ellipse(69, 40, 7, 15, "brown", -15),
      ellipse(60, 75, 6, 8, "brown", 0, true),
      ellipse(50, 46, 8, 6, "cream", 0, true),
      ellipse(50, 43, 3.5, 2.5, "black", 0, true),
      circle(43, 34, 2.6, "black", true),
      circle(57, 34, 2.6, "black", true),
    ],
  },
  {
    id: "swinka",
    label: "świnka",
    shapes: [
      stroke("M17 50 C8 48 9 39 15 41 C20 43 15 50 10 48", 3.4, "pink"),
      rect(26, 66, 8, 24, "pink", 2),
      rect(38, 68, 8, 22, "pink", 2),
      rect(54, 68, 8, 22, "pink", 2),
      rect(64, 66, 8, 24, "pink", 2),
      ellipse(46, 56, 32, 20, "pink"),
      path("M73 36 L76 23 L86 33 Z", "pink"),
      circle(80, 46, 15, "pink"),
      ellipse(93, 50, 5, 7, "pink"),
      circle(82, 41, 2.2, "black", true),
      circle(93, 48, 1.2, "darkred", true),
      circle(93, 53, 1.2, "darkred", true),
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
    // brzuszek, skrzydła i łapki (bez gałęzi, jak inne ptaki).
    shapes: [
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
      circle(41, 27, 6, "white", true),
      circle(59, 27, 6, "white", true),
      circle(42, 28, 2.8, "black", true),
      circle(58, 28, 2.8, "black", true),
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
  {
    id: "flaming",
    label: "flaming",
    shapes: [
      stroke("M58 50 V96 M58 68 L68 62 L62 56", 3.4, "pink"),
      stroke("M40 40 C26 36 24 20 32 14", 6, "pink"),
      circle(34, 13, 6, "pink"),
      path("M39 10 L48 15 L45 23 L39 17 Z", "black"),
      ellipse(58, 40, 22, 13, "pink", -10),
      path("M52 36 C62 30 74 32 78 40 C68 45 58 44 52 36 Z", "red", true),
      circle(33, 12, 1.5, "black", true),
    ],
  },
  {
    id: "papuga",
    label: "papuga",
    shapes: [
      path("M44 70 L40 98 H60 L56 70 Z", "blue"),
      ellipse(50, 54, 18, 26, "green"),
      circle(50, 28, 14, "red"),
      path("M38 24 C27 24 26 38 34 40 L40 32 Z", "yellow"),
      ellipse(57, 56, 8, 17, "blue", 10, true),
      circle(47, 25, 2.4, "black", true),
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
  {
    id: "sukienka",
    label: "sukienka",
    // Przerysowana 2026-11-21 (uwaga użytkowniczki): krótkie rękawki, wcięta talia z paskiem, rozkloszowany dół w groszki.
    shapes: [
      path(
        "M34 8 L20 14 L14 28 L26 32 L33 25 L36 44 L14 90 C30 96 70 96 86 90 L64 44 L67 25 L74 32 L86 28 L80 14 L66 8 C60 16 40 16 34 8 Z",
        "pink",
      ),
      rect(36, 39, 28, 6, "red", 1, true),
      circle(36, 66, 2.6, "white", true),
      circle(50, 60, 2.6, "white", true),
      circle(64, 66, 2.6, "white", true),
      circle(28, 82, 2.6, "white", true),
      circle(44, 78, 2.6, "white", true),
      circle(58, 80, 2.6, "white", true),
      circle(72, 82, 2.6, "white", true),
    ],
  },
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
    // Przerysowana 2026-11-21 (uwaga użytkowniczki): ściągacz, paski, pięta i palce w innym kolorze.
    shapes: [
      path(
        "M30 16 H60 V56 C60 60 64 62 68 63 L82 66 C95 69 96 92 80 93 H40 C25 93 22 80 28 70 C30 66 30 62 30 58 Z",
        "red",
      ),
      rect(27, 6, 36, 12, "white", 2),
      stroke("M33 9 V15 M39 9 V15 M45 9 V15 M51 9 V15 M57 9 V15", 1.2, "gray", true),
      rect(31, 28, 28, 6, "white", 0, true),
      rect(31, 42, 28, 6, "white", 0, true),
      path("M29 73 C26 82 30 90 40 92 C40 84 38 77 30 71 Z", "white", true),
      path("M81 67 C92 70 95 89 81 92 C85 85 85 74 81 67 Z", "white", true),
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
  {
    id: "kapelusz",
    label: "kapelusz",
    shapes: [
      ellipse(50, 72, 46, 10, "sand"),
      path("M28 72 C28 40 34 30 50 30 C66 30 72 40 72 72 Z", "sand"),
      rect(30, 58, 40, 8, "red", 0, true),
    ],
  },
  {
    id: "szalik",
    label: "szalik",
    shapes: [
      stroke("M30 88 V96 M35 88 V96 M40 88 V96 M60 78 V86 M65 78 V86 M70 78 V86", 3.4, "red"),
      rect(26, 28, 18, 60, "red", 2),
      rect(56, 28, 18, 50, "red", 2),
      path("M22 34 C22 6 78 6 78 34 L66 36 C66 20 34 20 34 36 Z", "red"),
      rect(27, 50, 16, 6, "white", 0, true),
      rect(27, 66, 16, 6, "white", 0, true),
      rect(57, 48, 16, 6, "white", 0, true),
      rect(57, 62, 16, 6, "white", 0, true),
    ],
  },
];

export const ZABAWKI: readonly ShadowPicture[] = [
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
    id: "pilka",
    label: "piłka plażowa",
    shapes: [
      circle(50, 54, 38, "white"),
      path("M50 16 C28 28 28 80 50 92 C40 78 40 30 50 16 Z", "red", true),
      path("M50 16 C72 28 72 80 50 92 C60 78 60 30 50 16 Z", "blue", true),
      path("M44 18 C24 22 14 40 13 54 C18 40 30 28 44 18 Z", "yellow", true),
      path("M56 18 C76 22 86 40 87 54 C82 40 70 28 56 18 Z", "green", true),
    ],
  },
  {
    id: "konik",
    label: "konik na biegunach",
    shapes: [
      stroke("M6 78 C28 96 72 96 94 78", 6, "red"),
      path(
        "M28 52 L18 86 H25 L34 56 Z M38 54 L32 90 H39 L44 56 Z M60 54 L64 90 H71 L66 54 Z M68 52 L80 86 H87 L74 50 Z",
        "white",
      ),
      stroke("M26 46 C14 46 10 56 12 66", 6, "brown"),
      ellipse(48, 48, 26, 11, "white"),
      path("M58 46 L66 22 C68 12 78 10 86 16 L94 26 C96 30 92 34 88 32 L80 30 L76 50 Z", "white"),
      path("M73 14 L75 4 L80 13 Z", "white"),
      path("M62 22 C64 12 70 8 76 10 L70 28 L66 46 L58 46 Z", "brown"),
      path("M38 38 H58 L56 50 C50 54 44 54 40 50 Z", "red", true),
      circle(82, 21, 2.2, "black", true),
    ],
  },
  {
    id: "bebenek",
    label: "bębenek",
    shapes: [
      stroke("M26 8 L52 36 M74 8 L48 36", 4, "sand"),
      circle(26, 8, 4.5, "red"),
      circle(74, 8, 4.5, "red"),
      path("M14 44 V80 C14 94 86 94 86 80 V44 Z", "red"),
      ellipse(50, 44, 36, 9, "white"),
      stroke("M18 58 L28 84 L38 58 L50 88 L62 58 L72 84 L82 58", 2.4, "yellow", true),
      path("M15 76 C30 86 70 86 85 76 V80 C70 90 30 90 15 80 Z", "white", true),
    ],
  },
  {
    id: "wiatraczek",
    label: "wiatraczek",
    shapes: [
      stroke("M50 40 V98", 4, "sand"),
      path("M50 36 L50 6 L72 16 Z", "red"),
      path("M50 36 L80 36 L70 58 Z", "yellow"),
      path("M50 36 L50 66 L28 56 Z", "blue"),
      path("M50 36 L20 36 L30 14 Z", "green"),
      circle(50, 36, 3.5, "white"),
    ],
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
  {
    id: "klocki",
    label: "klocki",
    shapes: [
      rect(12, 58, 36, 36, "red", 3),
      rect(52, 58, 36, 36, "blue", 3),
      rect(32, 20, 36, 36, "yellow", 3),
      circle(30, 76, 9, "white", true),
      rect(61, 67, 18, 18, "white", 1, true),
      path("M50 28 L60 46 H40 Z", "white", true),
    ],
  },
];
