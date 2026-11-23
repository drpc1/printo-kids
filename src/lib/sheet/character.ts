import { inWindow, type DateWindow } from "../date-window.ts";

/** The Christmas characters are offered on the pick list from 15 November to 6 January, like the category of S-38. */
const CHRISTMAS_WINDOW: DateWindow = { from: { month: 11, day: 15 }, to: { month: 1, day: 6 } };

/** The winter characters are offered from 1 December to the end of February, like the category Zima (S-54). */
const WINTER_WINDOW: DateWindow = { from: { month: 12, day: 1 }, to: { month: 2, day: 29 } };

const noneChoice = { id: "none", label: "Brak", src: null } as const;

export const CHARACTER_CHOICES = [
  noneChoice,
  {
    id: "balwanek",
    label: "Bałwanek",
    src: "/characters/balwanek.webp",
    contentLeft: 298 / 1024,
    contentRight: 296 / 1024,
    window: WINTER_WINDOW,
  },
  {
    id: "mikolaj",
    label: "Mikołaj",
    src: "/characters/mikolaj.webp",
    contentLeft: 376 / 1024,
    contentRight: 376 / 1024,
    window: CHRISTMAS_WINDOW,
  },
  {
    id: "renifer",
    label: "Renifer",
    src: "/characters/renifer.webp",
    contentLeft: 258 / 1024,
    contentRight: 258 / 1024,
    window: CHRISTMAS_WINDOW,
  },
  {
    id: "pingwin",
    label: "Pingwin",
    src: "/characters/pingwin.webp",
    contentLeft: 298 / 1024,
    contentRight: 298 / 1024,
    window: WINTER_WINDOW,
  },
  {
    id: "dinozaur",
    label: "Dinozaur",
    src: "/characters/dinozaur.webp",
    contentLeft: 191 / 1024,
    contentRight: 212 / 1024,
  },
  {
    id: "jednorozec",
    label: "Jednorożec",
    src: "/characters/jednorozec.webp",
    contentLeft: 192 / 1024,
    contentRight: 192 / 1024,
  },
  { id: "kot", label: "Kot", src: "/characters/kot.webp", contentLeft: 208 / 1024, contentRight: 208 / 1024 },
  { id: "pies", label: "Pies", src: "/characters/pies.webp", contentLeft: 192 / 1024, contentRight: 192 / 1024 },
  {
    id: "rakieta",
    label: "Rakieta",
    src: "/characters/rakieta.webp",
    contentLeft: 333 / 1024,
    contentRight: 332 / 1024,
  },
  { id: "robot", label: "Robot", src: "/characters/robot.webp", contentLeft: 307 / 1024, contentRight: 307 / 1024 },
  {
    id: "samochodzik",
    label: "Samochodzik",
    src: "/characters/samochodzik.webp",
    contentLeft: 213 / 1024,
    contentRight: 189 / 1024,
  },
  { id: "smok", label: "Smok", src: "/characters/smok.webp", contentLeft: 192 / 1024, contentRight: 192 / 1024 },
  {
    id: "strazak",
    label: "Strażak",
    src: "/characters/strazak.webp",
    contentLeft: 322 / 1024,
    contentRight: 321 / 1024,
  },
  {
    id: "syrenka",
    label: "Syrenka",
    src: "/characters/syrenka.webp",
    contentLeft: 366 / 1024,
    contentRight: 366 / 1024,
  },
  { id: "wrozka", label: "Wróżka", src: "/characters/wrozka.webp", contentLeft: 266 / 1024, contentRight: 266 / 1024 },
] as const;

/** Empty margin before the first opaque pixel, as a fraction of the square file. Own images have none. */
export function characterContentLeft(id: string): number {
  const row = CHARACTER_CHOICES.find((option) => option.id === id);
  if (row === undefined || !("contentLeft" in row)) {
    return 0;
  }
  return row.contentLeft;
}

/** Empty margin after the last opaque pixel, as a fraction of the square file. Own images have none. */
export function characterContentRight(id: string): number {
  const row = CHARACTER_CHOICES.find((option) => option.id === id);
  if (row === undefined || !("contentRight" in row)) {
    return 0;
  }
  return row.contentRight;
}

/**
 * The rows of the pick list on `today`: a character with a window is offered only inside it, except the one that
 * is `selected` (a saved favourite or last-used one stays on the list). `separatorAfter` is the id of the last
 * seasonal row shown, where the list draws a line, or null when none is shown. The catalog itself does not depend
 * on the date, so a saved seasonal character is never replaced by "Brak".
 */
export function characterPickRowsOn(
  today: Date,
  selected: string,
): { rows: readonly (typeof CHARACTER_CHOICES)[number][]; separatorAfter: string | null } {
  const rows = CHARACTER_CHOICES.filter(
    (row) => !("window" in row) || row.id === selected || inWindow(row.window, today),
  );
  const seasonal = rows.filter((row) => "window" in row);
  return { rows, separatorAfter: seasonal.length === 0 ? null : seasonal[seasonal.length - 1].id };
}

export function characterSheetSrc(id: string): string | null {
  const row = CHARACTER_CHOICES.find((option) => option.id === id);
  if (row === undefined) {
    return null;
  }
  return row.src;
}

export function characterRow(id: string): (typeof CHARACTER_CHOICES)[number] {
  const match = CHARACTER_CHOICES.find((option) => option.id === id);
  if (match !== undefined) {
    return match;
  }

  const none = CHARACTER_CHOICES.find((option) => option.id === "none");
  if (none !== undefined) {
    return none;
  }

  return noneChoice;
}

export type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];

/** A parent photo. It is allowed on a profile and in last-used, and it is not a catalog file. */
export const OWN_IMAGE_ID = "wlasne" as const;

export const OWN_IMAGE_LABEL = "Własny obrazek";

export type SheetCharacterId = CharacterChoice | typeof OWN_IMAGE_ID;

export const ALLOWED_CHARACTER_IDS: readonly string[] = [...CHARACTER_CHOICES.map((option) => option.id), OWN_IMAGE_ID];

/** A catalog id, or `wlasne`. Anything else, including a data URL, falls back to "none". */
export function characterChoice(value: string): SheetCharacterId {
  if (value === OWN_IMAGE_ID) {
    return OWN_IMAGE_ID;
  }

  const match = CHARACTER_CHOICES.find((option) => option.id === value);
  if (match === undefined) {
    return "none";
  }
  return match.id;
}
