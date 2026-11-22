/**
 * What a card practises ("Co ćwiczy?"), in the order of the catalog chips: Polish alphabetical by label.
 * A skill fits a card when a parent would not be surprised to find it there (a clock is not "Liczby").
 * Insert a new skill at its alphabetical place. Not to be confused with card kind id `liczby` ("Labirynt liczbowy").
 */
export const CARD_SKILLS = [
  { id: "czas-pieniadze", label: "Czas i pieniądze" },
  { id: "liczby", label: "Liczby" },
  { id: "logika", label: "Logika" },
  { id: "rysowanie", label: "Rysowanie" },
  { id: "spostrzegawczosc", label: "Spostrzegawczość" },
] as const;

export type CardSkillId = (typeof CARD_SKILLS)[number]["id"];

export interface CardKind {
  id: string;
  title: string;
  href: string;
  thumbnail: string;
  /** One or two skills, in the order of `CARD_SKILLS`. */
  skills: readonly CardSkillId[];
  /** Two or three sentences for the "Jak to działa" page: what the child does and what is on the sheet. */
  description: string;
}

/** Polish title order. Insert a new card at its alphabetical place; do not append it. */
export const CARD_KINDS = [
  {
    id: "cienie",
    title: "Cienie",
    href: "/shadows",
    thumbnail: "/thumbnails/cienie.svg",
    skills: ["spostrzegawczosc"],
    description:
      "Dziecko łączy kreską kolorowy obrazek z jego czarnym cieniem. Na kartce są dwie kolumny: po lewej obrazki, po prawej ich cienie w innej kolejności, przy każdym kropka, a żaden cień nie stoi w rzędzie swojego obrazka. Poziom zmienia liczbę par i to, jak bardzo obrazki są do siebie podobne: od zupełnie różnych rzeczy po warianty jednej rzeczy.",
  },
  {
    id: "dyktando",
    title: "Dyktando graficzne",
    href: "/dictation",
    thumbnail: "/thumbnails/dyktando.svg",
    skills: ["rysowanie"],
    description:
      "Dziecko rysuje po liniach kratki według strzałek i liczb kratek, a na końcu odkrywa obrys obiektu. Na kartce jest pusta kratka z kropką startu i lista poleceń, na przykład „3 →”. Karta nie zdradza, co się narysuje.",
  },
  {
    id: "kodowanie",
    title: "Kodowanie",
    href: "/coding",
    thumbnail: "/thumbnails/kodowanie.svg",
    skills: ["logika"],
    description:
      "Dziecko zapisuje strzałkami najkrótszą drogę postaci do mety albo idzie za podanymi strzałkami i zakreśla obrazek, na którym kończy się droga, zależnie od trybu. Na kartce jest kratka z szarymi przeszkodami, postać w polu startu, flaga mety i pola na strzałki albo trzy obrazki. Poziom zmienia wielkość kratki, długość drogi i zakręty, a na najwyższym zapis „3 →”.",
  },
  {
    id: "krzyzowka",
    title: "Krzyżówka matematyczna",
    href: "/math-crossword",
    thumbnail: "/thumbnails/krzyzowka.svg",
    skills: ["liczby"],
    description:
      "Dziecko uzupełnia puste pola krzyżówki, w której działania takie jak „3 + 4 = 7” biegną w prawo albo w dół i krzyżują się we wspólnych liczbach. Na kartce każde pole jest osobną kratką, część liczb jest wpisana, a resztę da się wyliczyć bez zgadywania. Poziom zmienia rodzaj działań, największą liczbę i wielkość krzyżówki.",
  },
  {
    id: "pieniadze",
    title: "Kto ma więcej",
    href: "/money",
    thumbnail: "/thumbnails/pieniadze.svg",
    skills: ["czas-pieniadze", "liczby"],
    description:
      "Dziecko porównuje, w której z dwóch kupek monet i banknotów jest więcej pieniędzy, i wpisuje między nimi „<”, „>” albo „=”. Na kartce jest pięć rzędów po dwie kupki z pustym polem pośrodku, a nominał to liczba na każdej monecie i banknocie. Waluta to złote, euro albo dolary, a poziom zmienia nominały, wielkość sum i to, czy liczba sztuk myli.",
  },
  {
    id: "niepasuje",
    title: "Który nie pasuje",
    href: "/odd-one-out",
    thumbnail: "/thumbnails/niepasuje.svg",
    skills: ["logika", "spostrzegawczosc"],
    description:
      "Dziecko zakreśla w każdym rzędzie obrazek, który łamie regułę rzędu: ma inny kształt, rozmiar, liczbę, kolor albo rodzaj obiektu niż reszta. Na kartce jest pięć albo sześć rzędów obrazków w ramkach i w każdym jest jedna odpowiedź. Poziom zmienia liczbę obrazków, rodzaje reguł i to, ile cech mąci; kolory włączasz osobno.",
  },
  {
    id: "labirynt",
    title: "Labirynt",
    href: "/maze",
    thumbnail: "/thumbnails/labirynt.svg",
    skills: ["logika", "rysowanie"],
    description:
      "Dziecko prowadzi palcem albo kredką od startu u góry do mety na dole. Na kartce jest labirynt z jedną prawidłową drogą, a znak wybranej postaci stoi przy starcie. Poziom zmienia szerokość alejki i długość drogi.",
  },
  {
    id: "liczby",
    title: "Labirynt liczbowy",
    href: "/number-maze",
    thumbnail: "/thumbnails/liczby.svg",
    skills: ["liczby"],
    description:
      "Dziecko rysuje drogę od startu do mety po sąsiednich kratkach z kolejnymi liczbami, w prawo, w lewo, w górę albo w dół, bez skosów, i omija liczby-pułapki. Na kartce jest kratka cała wypełniona liczbami: start w lewym górnym rogu, meta w prawym dolnym, obie w grubej ramce, a droga jest jedna. Poziom zmienia wielkość kratki, zakres liczb i to, czy liczy się co 1, co 2, czy co 5.",
  },
  {
    id: "nonogram",
    title: "Nonogram",
    href: "/nonogram",
    thumbnail: "/thumbnails/nonogram.svg",
    skills: ["logika"],
    description:
      "Dziecko zamalowuje kratki według liczb przy wierszach i kolumnach, a po rozwiązaniu odkrywa obrazek. Na kartce jest pusta kratka z liczbami, a na poziomie łatwym znaczki przy wierszach zamiast liczb przy kolumnach. Karta nie zdradza, co się ukryło.",
  },
  {
    id: "odnajmniejszego",
    title: "Od najmniejszego",
    href: "/size-order",
    thumbnail: "/thumbnails/odnajmniejszego.svg",
    skills: ["spostrzegawczosc"],
    description:
      "Dziecko numeruje obrazki w rzędzie od najmniejszego do największego: wpisuje 1, 2, 3… w pustym polu pod obrazkiem albo rysuje tyle kropek. Na kartce jest kilka rzędów, w każdym ta sama sylwetka (ikona albo kształt) w trzech, czterech albo pięciu wielkościach w pomieszanej kolejności, stojąca na wspólnej linii. Poziom zmienia liczbę obrazków i rzędów oraz to, jak mało różnią się wielkości; po włączeniu kolorów każdy rząd ma jedną kredkę.",
  },
  {
    id: "sekwencje",
    title: "Sekwencje",
    href: "/sequences",
    thumbnail: "/thumbnails/sekwencje.svg",
    skills: ["logika"],
    description:
      "Dziecko dopisuje albo dorysowuje brakujące elementy w kilku ciągach kształtów i liczb. Na kartce jest kilka rzędów pól, w których część jest pusta, a każdy ciąg ma jedną prawidłową odpowiedź. Poziom zmienia długość ciągów i rodzaj reguł.",
  },
  {
    id: "kopiuj",
    title: "Skopiuj obrazek",
    href: "/copy-drawing",
    thumbnail: "/thumbnails/kopiuj.svg",
    skills: ["rysowanie", "spostrzegawczosc"],
    description:
      "Dziecko przerysowuje czarny obrazek z jednej kratki do pustej kratki obok, zamalowując te same kratki. Na kartce są dwie kratki tej samej wielkości: w lewej jest gotowy obrazek, a prawa jest pusta. Poziom zmienia wielkość kratki i bogactwo obrazka, a kategorią wybierasz rodzaj obiektów; karta nie zdradza, co to jest.",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    href: "/sudoku",
    thumbnail: "/thumbnails/sudoku.svg",
    skills: ["logika"],
    description:
      "Dziecko uzupełnia puste pola planszy tak, by żaden kształt albo cyfra nie powtórzyły się w wierszu, kolumnie i bloku. Na kartce jest plansza 4×4, 6×6 albo 9×9, a przy kształtach pod planszą lista figur do użycia. Rozmiar i poziom wybierasz osobno.",
  },
  {
    id: "symetria",
    title: "Symetria",
    href: "/symmetry",
    thumbnail: "/thumbnails/symetria.svg",
    skills: ["rysowanie", "spostrzegawczosc"],
    description:
      "Dziecko dorysowuje drugą połowę obiektu jako odbicie pierwszej. Na kartce jest kratka z osią symetrii, a po jednej jej stronie narysowana połowa rakiety, robota, truskawki albo innego obiektu. Kolory włączasz osobno.",
  },
  {
    id: "szlaczki",
    title: "Szlaczki",
    href: "/patterns",
    thumbnail: "/thumbnails/szlaczki.svg",
    skills: ["rysowanie"],
    description:
      "Dziecko prowadzi ołówek po kropkach albo kontynuuje pokazany wzór. Na kartce są rzędy szlaczków, od czterech do siedmiu zależnie od poziomu. Poziom zmienia tryb, wzory i liczbę rzędów, a na wyższych poziomach włączasz i wyłączasz linie pomocnicze.",
  },
  {
    id: "zegar",
    title: "Zegar",
    href: "/clock",
    thumbnail: "/thumbnails/zegar.svg",
    skills: ["czas-pieniadze"],
    description:
      "Dziecko odczytuje godzinę z tarczy ze wskazówkami i wpisuje ją pod zegarem, dorysowuje wskazówki do godziny podanej pod pustą tarczą albo łączy kreską tarczę z zegarem cyfrowym, zależnie od trybu. Na kartce są tarcze z liczbami 1–12: sześć przy odczytywaniu i dorysowywaniu, pięć przy łączeniu. Poziom zmienia minuty, od pełnych godzin po co minutę, a po włączeniu „24 h” pod tarczą stoi pora dnia.",
  },
] as const satisfies readonly CardKind[];

/** The ids of the catalog, as a union: what `CARD_ENGINES` and the card settings are keyed by. */
export type CardKindId = (typeof CARD_KINDS)[number]["id"];

export function cardsInCatalogOrder(): CardKind[] {
  return ([...CARD_KINDS] as CardKind[]).sort((left, right) => left.title.localeCompare(right.title, "pl"));
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

/** Labels of the skills of a card, in the order of `CARD_SKILLS`. */
export function cardSkillLabels(kind: Pick<CardKind, "skills">): string[] {
  return CARD_SKILLS.filter((skill) => kind.skills.includes(skill.id)).map((skill) => skill.label);
}
