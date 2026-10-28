export interface CardKind {
  id: string;
  title: string;
  href: string;
  thumbnail: string;
}

export const CARD_KINDS: readonly CardKind[] = [
  { id: "labirynt", title: "Labirynt", href: "/maze", thumbnail: "/thumbnails/labirynt.svg" },
  { id: "symetria", title: "Symetria", href: "/symmetry", thumbnail: "/thumbnails/symetria.svg" },
  { id: "sudoku", title: "Sudoku", href: "/sudoku", thumbnail: "/thumbnails/sudoku.svg" },
  { id: "sekwencje", title: "Sekwencje", href: "/sequences", thumbnail: "/thumbnails/sekwencje.svg" },
  { id: "nonogram", title: "Nonogram", href: "/nonogram", thumbnail: "/thumbnails/nonogram.svg" },
  { id: "dyktando", title: "Dyktando graficzne", href: "/dictation", thumbnail: "/thumbnails/dyktando.svg" },
];

export function cardsInCatalogOrder(): CardKind[] {
  return [...CARD_KINDS].sort((left, right) => left.title.localeCompare(right.title, "pl"));
}
