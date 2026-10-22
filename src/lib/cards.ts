export interface CardKind {
  id: string;
  title: string;
  href: string;
  thumbnail: string;
}

export const CARD_KINDS: readonly CardKind[] = [
  { id: "labirynt", title: "Labirynt", href: "/labirynt", thumbnail: "/thumbnails/labirynt.svg" },
];
