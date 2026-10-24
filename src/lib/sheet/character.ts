const noneChoice = { id: "none", label: "Bez postaci", src: null } as const;

export const CHARACTER_CHOICES = [
  noneChoice,
  { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.png" },
  { id: "jednorozec", label: "Jednorożec", src: "/characters/jednorozec.png" },
  { id: "kot", label: "Kot", src: "/characters/kot.png" },
  { id: "pies", label: "Pies", src: "/characters/pies.png" },
  { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.png" },
  { id: "robot", label: "Robot", src: "/characters/robot.png" },
  { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.png" },
  { id: "smok", label: "Smok", src: "/characters/smok.png" },
  { id: "strazak", label: "Strażak", src: "/characters/strazak.png" },
  { id: "syrenka", label: "Syrenka", src: "/characters/syrenka.png" },
  { id: "wrozka", label: "Wróżka", src: "/characters/wrozka.png" },
] as const;

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

export const OWN_IMAGE_LABEL = "Własne zdjęcie";

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
