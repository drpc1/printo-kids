export interface CardKind {
  id: string;
  title: string;
  href: string;
  thumbnail: string;
}

export const CARD_KINDS: readonly CardKind[] = [
  { id: "labirynt", title: "Labirynt", href: "/labirynt", thumbnail: "/thumbnails/labirynt.svg" },
  { id: "symetria", title: "Symetria", href: "/symetria", thumbnail: "/thumbnails/symetria.svg" },
  { id: "sudoku", title: "Sudoku", href: "/sudoku", thumbnail: "/thumbnails/sudoku.svg" },
  { id: "sekwencje", title: "Sekwencje", href: "/sekwencje", thumbnail: "/thumbnails/sekwencje.svg" },
];
