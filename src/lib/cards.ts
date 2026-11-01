export interface CardKind {
  id: string;
  title: string;
  href: string;
  thumbnail: string;
  /** Two or three sentences for the "Jak to działa" page: what the child does and what is on the sheet. */
  description: string;
}

export const CARD_KINDS: readonly CardKind[] = [
  {
    id: "labirynt",
    title: "Labirynt",
    href: "/maze",
    thumbnail: "/thumbnails/labirynt.svg",
    description:
      "Dziecko prowadzi palcem albo kredką od startu u góry do mety na dole. Na kartce jest labirynt z jedną prawidłową drogą, a znak wybranej postaci stoi przy starcie. Poziom zmienia szerokość alejki i długość drogi.",
  },
  {
    id: "symetria",
    title: "Symetria",
    href: "/symmetry",
    thumbnail: "/thumbnails/symetria.svg",
    description:
      "Dziecko dorysowuje drugą połowę obiektu jako odbicie pierwszej. Na kartce jest kratka z osią symetrii, a po jednej jej stronie narysowana połowa rakiety, robota, truskawki albo innego obiektu. Kolory włączasz osobno.",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    href: "/sudoku",
    thumbnail: "/thumbnails/sudoku.svg",
    description:
      "Dziecko uzupełnia puste pola planszy tak, by żaden kształt albo cyfra nie powtórzyły się w wierszu, kolumnie i bloku. Na kartce jest plansza 4×4, 6×6 albo 9×9, a przy kształtach pod planszą lista figur do użycia. Rozmiar i poziom wybierasz osobno.",
  },
  {
    id: "sekwencje",
    title: "Sekwencje",
    href: "/sequences",
    thumbnail: "/thumbnails/sekwencje.svg",
    description:
      "Dziecko dopisuje albo dorysowuje brakujące elementy w kilku ciągach kształtów i liczb. Na kartce jest kilka rzędów pól, w których część jest pusta, a każdy ciąg ma jedną prawidłową odpowiedź. Poziom zmienia długość ciągów i rodzaj reguł.",
  },
  {
    id: "nonogram",
    title: "Nonogram",
    href: "/nonogram",
    thumbnail: "/thumbnails/nonogram.svg",
    description:
      "Dziecko zamalowuje kratki według liczb przy wierszach i kolumnach, a po rozwiązaniu odkrywa obrazek. Na kartce jest pusta kratka z liczbami, a na poziomie łatwym znaczki przy wierszach zamiast liczb przy kolumnach. Karta nie zdradza, co się ukryło.",
  },
  {
    id: "dyktando",
    title: "Dyktando graficzne",
    href: "/dictation",
    thumbnail: "/thumbnails/dyktando.svg",
    description:
      "Dziecko rysuje po liniach kratki według strzałek i liczb kratek, a na końcu odkrywa obrys obiektu. Na kartce jest pusta kratka z kropką startu i lista poleceń, na przykład „3 →”. Karta nie zdradza, co się narysuje.",
  },
  {
    id: "pieniadze",
    title: "Kto ma więcej?",
    href: "/money",
    thumbnail: "/thumbnails/pieniadze.svg",
    description:
      "Dziecko porównuje, w której z dwóch kupek monet i banknotów jest więcej pieniędzy, i wpisuje między nimi „<”, „>” albo „=”. Na kartce jest pięć rzędów po dwie kupki z pustym polem pośrodku, a nominał to liczba na każdej monecie i banknocie. Poziom zmienia nominały, wielkość sum i to, czy liczba sztuk myli.",
  },
];

export function cardsInCatalogOrder(): CardKind[] {
  return [...CARD_KINDS].sort((left, right) => left.title.localeCompare(right.title, "pl"));
}

export function cardTitle(id: CardKind["id"]): string {
  const kind = CARD_KINDS.find((candidate) => candidate.id === id);
  if (!kind) {
    throw new Error(`Unknown card kind: ${id}`);
  }
  return kind.title;
}

export function cardPageTitle(id: CardKind["id"]): string {
  return `PrintoKids - ${cardTitle(id)}`;
}
