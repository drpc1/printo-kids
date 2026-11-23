// The five "pozy" families of the shadows card (level 4): one thing in eight poses. Every family has three details of
// the outline, each in two states (2 × 2 × 2 = 8 poses); each detail moves on one side of the thing only, so no pose is
// the mirror image of another. Details inside the outline (eyes, pads) are left out of the shadow.
import {
  circle,
  ellipse,
  path,
  stroke,
  type ShadowFamily,
  type ShadowPicture,
  type ShadowShape,
} from "../picture-format.ts";

interface PoseDefinition {
  id: string;
  label: string;
  /** Names of the three details, each [state false, state true]. */
  details: readonly [string, string, string];
  states: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  draw: (a: boolean, b: boolean, c: boolean) => ShadowShape[];
}

const POSE_DEFINITIONS: readonly PoseDefinition[] = [
  {
    id: "kot",
    label: "kot",
    details: ["ogon", "prawe ucho", "lewa łapka"],
    states: [
      ["w górze", "przy ziemi"],
      ["postawione", "zgięte"],
      ["na dole", "w górze"],
    ],
    draw: (tailLow, earFolded, pawUp) => [
      tailLow ? stroke("M66 90 C80 93 90 92 96 84", 8, "orange") : stroke("M68 88 C88 88 94 70 86 58", 8, "orange"),
      ...(pawUp ? [stroke("M42 62 C32 56 26 48 22 36", 9, "orange"), circle(22, 34, 6.5, "cream")] : []),
      ellipse(29, 92, 8, 4.5, "orange"),
      ellipse(71, 92, 8, 4.5, "orange"),
      path("M30 94 C26 76 32 60 42 54 H58 C68 60 74 76 70 94 Z", "orange"),
      ...(pawUp
        ? []
        : [ellipse(41, 92, 8.5, 6, "cream"), stroke("M38.5 91.5 L38.5 96 M43.5 91.5 L43.5 96", 1.2, "black", true)]),
      ellipse(59, 92, 8.5, 6, "cream"),
      stroke("M56.5 91.5 L56.5 96 M61.5 91.5 L61.5 96", 1.2, "black", true),
      path("M32 32 L30 10 L46 22 Z", "orange"),
      earFolded ? path("M66 33 L84 30 L58 22 Z", "orange") : path("M68 32 L70 10 L54 22 Z", "orange"),
      circle(50, 38, 20, "orange"),
      path("M34 27 L33 15 L42 22 Z", "pink", true),
      ...(earFolded ? [] : [path("M66 27 L67 15 L58 22 Z", "pink", true)]),
      ellipse(50, 74, 5, 9, "cream", 0, true),
      ellipse(42, 36, 3, 4, "black", 0, true),
      ellipse(58, 36, 3, 4, "black", 0, true),
      path("M47 43 H53 L50 47 Z", "pink", true),
      stroke("M35 45 L44 47 M35 51 L44 49 M65 45 L56 47 M65 51 L56 49", 1.2, "black", true),
    ],
  },
  {
    id: "pies",
    label: "pies",
    details: ["ogon", "prawe ucho", "prawa łapka"],
    states: [
      ["w górze", "w dół"],
      ["oklapnięte", "uniesione"],
      ["na dole", "w górze"],
    ],
    draw: (tailDown, earUp, pawUp) => [
      tailDown ? stroke("M32 90 C20 92 10 92 4 86", 7, "sand") : stroke("M32 88 C14 86 10 72 16 62", 7, "sand"),
      ...(pawUp ? [stroke("M58 62 C68 56 74 48 78 36", 8, "sand"), circle(78, 34, 6.5, "cream")] : []),
      ellipse(29, 92, 8, 4.5, "sand"),
      ellipse(71, 92, 8, 4.5, "sand"),
      path("M30 94 C26 76 32 60 42 54 H58 C68 60 74 76 70 94 Z", "sand"),
      ellipse(41, 92, 8.5, 6, "cream"),
      stroke("M38.5 91.5 L38.5 96 M43.5 91.5 L43.5 96", 1.2, "black", true),
      ...(pawUp
        ? []
        : [ellipse(59, 92, 8.5, 6, "cream"), stroke("M56.5 91.5 L56.5 96 M61.5 91.5 L61.5 96", 1.2, "black", true)]),
      circle(50, 38, 18, "sand"),
      ellipse(31, 40, 7, 15, "brown", 15),
      earUp ? ellipse(74, 22, 6.5, 14, "brown", 55) : ellipse(69, 40, 7, 15, "brown", -15),
      ellipse(33.5, 72, 3.5, 5.5, "brown", 0, true),
      ellipse(50, 46, 8, 6, "cream", 0, true),
      ellipse(50, 43, 3.5, 2.5, "black", 0, true),
      circle(43, 34, 2.6, "black", true),
      circle(57, 34, 2.6, "black", true),
    ],
  },
  {
    id: "krolik",
    label: "królik",
    details: ["prawe ucho", "lewe ucho", "lewa stopa"],
    states: [
      ["prosto", "oklapnięte"],
      ["prosto", "zgięty czubek"],
      ["pod spodem", "w bok"],
    ],
    draw: (earFlop, tipBent, footOut) => [
      ...(tipBent
        ? [ellipse(43, 31, 7, 11, "white", -10), ellipse(36, 18, 6, 10, "white", -60)]
        : [ellipse(41, 22, 7, 19, "white", -10)]),
      earFlop ? ellipse(70, 30, 7, 19, "white", 65) : ellipse(59, 22, 7, 19, "white", 10),
      ellipse(50, 74, 22, 19, "white"),
      footOut ? ellipse(22, 86, 10, 5, "white", -25) : ellipse(37, 92, 10, 5, "white"),
      ellipse(63, 92, 10, 5, "white"),
      circle(50, 48, 17, "white"),
      tipBent ? ellipse(43, 32, 3.2, 7, "pink", -10, true) : ellipse(41, 23, 3.2, 13, "pink", -10, true),
      earFlop ? ellipse(70, 30, 3.2, 13, "pink", 65, true) : ellipse(59, 23, 3.2, 13, "pink", 10, true),
      ellipse(50, 80, 10, 9, "cream", 0, true),
      stroke("M37 68 A5 7 0 1 0 47 68 A5 7 0 1 0 37 68 M53 68 A5 7 0 1 0 63 68 A5 7 0 1 0 53 68", 1.4, "black", true),
      circle(43, 46, 2.6, "black", true),
      circle(57, 46, 2.6, "black", true),
      path("M47 52 H53 L50 55 Z", "pink", true),
      stroke("M38 54 L45 55 M62 54 L55 55", 1.2, "black", true),
    ],
  },
  {
    id: "ptak",
    label: "ptak",
    details: ["dziób", "skrzydło", "ogon"],
    states: [
      ["zamknięty", "otwarty"],
      ["złożone", "uniesione"],
      ["w górę", "w dół"],
    ],
    draw: (beakOpen, wingUp, tailDown) => [
      stroke("M44 76 L42 92 M54 76 L56 92", 3, "darkgray"),
      tailDown ? path("M70 60 L90 86 L97 66 Z", "sand") : path("M70 52 L96 36 L92 60 Z", "sand"),
      ...(wingUp
        ? [path("M44 50 C40 34 50 20 66 14 C66 22 72 22 74 28 C70 34 72 40 66 46 C60 52 50 54 44 50 Z", "brown")]
        : []),
      ellipse(50, 58, 28, 20, "sand"),
      circle(28, 42, 14, "sand"),
      beakOpen
        ? path("M15 37 L2 31 L15 43 Z M15 45 L3 54 L15 49 Z", "orange")
        : path("M15 40 L4 44 L15 47 Z", "orange"),
      ...(wingUp ? [] : [path("M44 56 C52 46 66 48 74 58 C64 66 52 66 44 56 Z", "brown", true)]),
      circle(26, 39, 2, "black", true),
    ],
  },
  {
    id: "mis",
    label: "miś",
    details: ["prawa łapa", "lewa łapa", "prawa noga"],
    states: [
      ["na dole", "w górze"],
      ["na dole", "w bok"],
      ["stoi", "uniesiona"],
    ],
    draw: (rightUp, leftOut, legUp) => [
      circle(32, 20, 9, "brown"),
      circle(68, 20, 9, "brown"),
      leftOut ? ellipse(21, 55, 13, 7, "brown", -10) : ellipse(26, 60, 8, 14, "brown", 30),
      rightUp ? ellipse(78, 38, 7, 15, "brown", 25) : ellipse(74, 60, 8, 14, "brown", -30),
      ellipse(36, 86, 11, 9, "brown"),
      legUp ? ellipse(73, 78, 11, 9, "brown", -35) : ellipse(64, 86, 11, 9, "brown"),
      ellipse(50, 66, 22, 24, "brown"),
      circle(50, 36, 20, "brown"),
      circle(32, 20, 4.5, "sand", true),
      circle(68, 20, 4.5, "sand", true),
      ellipse(50, 71, 11, 12, "sand", 0, true),
      ellipse(36, 88, 5.5, 4.5, "sand", 0, true),
      legUp ? ellipse(75, 79, 5.5, 4.5, "sand", -35, true) : ellipse(64, 88, 5.5, 4.5, "sand", 0, true),
      ellipse(50, 44, 9, 7, "sand", 0, true),
      ellipse(50, 41.5, 3.5, 2.5, "black", 0, true),
      stroke("M46 47 C48 49 52 49 54 47", 1.2, "black", true),
      circle(42, 32, 2.6, "black", true),
      circle(58, 32, 2.6, "black", true),
    ],
  },
];

/** The eight poses of a definition: the bits are the states of the three details, in the order of `details`. */
function poses(definition: PoseDefinition): ShadowPicture[] {
  return [0, 1, 2, 3, 4, 5, 6, 7].map((n) => {
    const [a, b, c] = [(n & 4) > 0, (n & 2) > 0, (n & 1) > 0] as const;
    return {
      id: `${definition.id}-${+a}${+b}${+c}`,
      label: [a, b, c].map((bit, k) => definition.states[k][+bit]).join(", "),
      shapes: definition.draw(a, b, c),
    };
  });
}

export const POSE_FAMILIES: readonly ShadowFamily[] = POSE_DEFINITIONS.map((definition) => ({
  id: definition.id,
  label: definition.label,
  kind: "pozy",
  pictures: poses(definition),
}));
