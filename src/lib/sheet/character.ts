const noneChoice = { id: "none", label: "Bez postaci", src: null } as const;

export const CHARACTER_CHOICES = [
  noneChoice,
  { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.png" },
  { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.png" },
  { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.png" },
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
