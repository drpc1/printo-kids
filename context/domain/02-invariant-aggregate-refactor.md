---
title: Plan refaktoru — jeden strażnik „karta ma jedną sprawdzalną odpowiedź" dla wszystkich kart
created: 2026-11-03
type: refactor-plan
---

# Plan refaktoru: `VerifiedCard` — wspólny strażnik niezmiennika kart

To jest **plan**, nie implementacja. Nie zmieniłem żadnego pliku produkcyjnego ani testu. Poza czytaniem uruchomiłem jednorazowo skrypt sondujący labirynt (poza repo, treść w dodatku A). Nie uruchamiałem `npm test`, Playwrighta ani Strykera. Każde `plik:linia` otworzyłem w tej sesji, chyba że przy cytacie stoi „za D01" (wtedy opieram się na `01-domain-distillation.md`, a nie na własnym odczycie).

Skróty: **PRD** = `context/foundation/prd.md`, **TP** = `context/foundation/test-plan.md`, **D01** = `context/domain/01-domain-distillation.md`, **AG** = `AGENTS.md`.

## Co zmieniło się względem pierwszej wersji tego dokumentu

Pierwsza wersja wybierała jako niezmiennik „labirynt ma jedną drogę" i projektowała agregat tylko dla labiryntu. To był błąd wyboru: wzięłem labirynt za najważniejszą kartę, bo PRD wymienia go w Primary Success Criteria, a PRD robi tak tylko dlatego, że był pierwszy. Właściwy niezmiennik jest wspólny dla wszystkich kart, a największe ryzyko to nowe karty, które go złamią (z M-5 wchodzą trzy). Ten dokument projektuje więc strażnika wspólnego, a labirynt jest w nim pierwszą migracją i najgorszym dziś przykładem luki.

**Szlaczki:** właściciel uważa, że mają jedną prawidłową odpowiedź, ale karta nie jest jeszcze zaimplementowana i nie chce teraz niczego rozstrzygać. Plan **niczego nie przesądza**: kontrakt wymaga od każdej karty funkcji sprawdzającej, ale nie mówi, co ta funkcja sprawdza. Zob. sekcja 7.

## 0. Kontekst i co z szablonu zadania nie ma tu zastosowania

**Stack i warstwy.** Astro 7 SSR na Cloudflare Workers, ale cała logika kart działa w przeglądarce: strony kart to wyspy `client:only="react"` (np. `src/pages/maze.astro:10`). W `src` nie ma `src/pages/api/` ani `fetch` (grep w tej sesji po `src tests scripts`: tylko `scripts/smoke.mjs`). AG `Hard rules` (`AGENTS.md:7`): „MVP has no accounts, payments, AI, or backend jobs". PRD:649 i PRD:924: wygenerowane karty nie są przechowywane.

| Warstwa | Pliki |
|---|---|
| Domena (czyste funkcje, `node:test`) | `src/lib/<karta>/generate.ts`, `.../rules.ts`, `.../levels.ts` |
| Rejestr rodzajów kart | `src/lib/cards.ts:10` (`CARD_KINDS`) |
| Rysowanie i układ A4 | `src/lib/sheet/*`, `src/lib/<karta>/layout.ts`, `.../sheet.ts` |
| Stan strony i UI (React) | `src/components/*Generator.tsx`, `CardPage.tsx` |
| Narzędzia poza `src` | `scripts/build-thumbnails.mjs` |

**Czego z szablonu zadania nie robię i czym to zastępuję:** nie ma serwera, bazy ani transakcji, i nie powinny powstać. „Repozytorium w jednej transakcji" → fabryka w module domeny, której wynik powstaje w całości albo wcale (4.5). „Cienkie API/route" → handler zdarzenia w komponencie. „Egzekucja z klienta na serwer" → egzekucja z komponentów i konwencji w `src/lib/<karta>/` do jednego kontraktu w `src/lib/`.

## 1. Niezmienniki biznesowe

| ID | Niezmiennik | Źródło |
|---|---|---|
| **I-1** | **Każda karta ma odpowiedź, którą aplikacja zna i potrafi sprawdzić; karta, która łamie regułę swojego rodzaju, nie jest pokazana** | PRD, „Po MVP": „Wspólna umowa z labiryntem: generator algorytmiczny, jedna sprawdzalna odpowiedź…"; PRD:86 (labirynt); PRD:166 (symetria); PRD:233 (sekwencje); PRD:733 (sudoku); PRD:306 (nonogram); PRD:337 (dyktando); PRD:429 (pieniądze) |
| I-2 | Każde Generuj daje nową kartę (inną niż poprzednia) | PRD:169 (symetria), PRD:721 (sekwencje) i analogicznie w pozostałych; w kodzie `card.key !== previousKey` np. `symmetry/generate.ts:64` |
| I-3 | Karta mieści się na jednej stronie A4 z marginesem ≥10 mm | PRD:637 |
| I-4 | Generowanie ≤5 s | PRD:70 |
| I-5 | Dane profili i ustawień nie opuszczają urządzenia | PRD:648; `AGENTS.md:7` |
| I-6 | Wygenerowane karty nie są przechowywane | PRD:649, PRD:924 |
| I-7 | Ulubiona postać zmienia się tylko jawnie | PRD (US-08); `sheet/own-image-store.ts:86-92` |
| I-8 | Drukowanie nie wymaga profilu | PRD:69 |

## 2. Klasyfikacja i wybór #1

| ID | Rdzeń | Rozsmarowanie | Egzekwowanie |
|---|---|---|---|
| **I-1** | **najwyższy**: wszystkie karty są jednakowo ważne i wszystkie obiecują to samo (PRD „Po MVP", cytat w 1); właściciel potwierdził, że to jest zasada produktu | **7 niezależnych implementacji** + 3 planowane (M-5); brak wspólnego typu | **per karta, z konwencji** — patrz 3 (zmiana po odpowiedzi nr 4: dla labiryntu dochodzi niezmiennik osiągalności wszystkich komórek, dziś bez strażnika w bramce) |
| I-2 | średni | w każdej pętli generatora osobno | strzeżone (`key !== previousKey`) tam, gdzie je znalazłem |
| I-3 | wysoki | 7 miejsc ze stałymi 210/297/10 (za D01 A10) | strzeżone testem treści |
| I-4 | średni | – | test czasu jest dla 5 z 7 kart (za D01 R-10) |
| I-5 | wysoki dla zaufania | – | tylko deklarowany (D01 R-8) |
| I-6 | niski | – | zapewniony brakiem kodu zapisu |
| I-7 | średni | 2 implementacje (D01 R-6) | strzeżone |
| I-8 | średni | – | nierozstrzygnięty (D01 R-4) |

**Wybór: I-1.** Jest najbardziej rdzeniowy (wspólna obietnica wszystkich kart) i jedyny z rdzeniowych, który nie ma jednego strażnika. Pozostałe są albo wspólne i już strzeżone (I-3), albo decyzją polityczną (I-5), albo mniej istotne dla sensu produktu.

**Relacja do D01 §5.** D01 stawia na #1 *rejestr rodzajów kart* (A9) z powodu kosztu najbliższej zmiany (M-5). To ten sam problem widziany z drugiej strony: rejestr dziś nie wie, że każdy rodzaj musi dostarczyć strażnika I-1. Plan poniżej wykorzystuje rejestr do wymuszenia kontraktu, więc obie rekomendacje się zazębiają i nie wykluczają.

## 3. Diagnoza I-1

### 3.1 Jak to wygląda w kodzie

Każdy rodzaj karty ma własną funkcję sprawdzającą i własną pętlę, która ją woła:

| Karta | Funkcja sprawdzająca | Gdzie wywoływana w generowaniu |
|---|---|---|
| Symetria | `symmetryCardProblems` (`symmetry/generate.ts:191`) | `symmetry/generate.ts:64` |
| Sekwencje | `sequenceCardProblems` (`sequence/generate.ts:247`), `sequenceRowProblems` (`:190`) | `sequence/generate.ts:63`, `:134` |
| Sudoku | `sudokuCardProblems` (`sudoku/generate.ts:322`) | `sudoku/generate.ts:296` |
| Nonogram | `nonogramCardProblems` (`nonogram/generate.ts:89`), `simpleNonogramProblems` (`nonogram/simple.ts:86`) | `nonogram/generate.ts:53`, `:59` |
| Dyktando | `dictationCardProblems` (`dictation/generate.ts:193`) | `dictation/generate.ts:104` |
| Pieniądze | `moneyCardProblems` (`money/rules.ts:87`) | `money/generate.ts:96` |
| **Labirynt** | **brak** `*Problems`; bramka `mazeForSheet` (`maze/generate.ts:114-130`) | **w komponencie**: `WorksheetGenerator.tsx:52`, `:74`; w skrypcie `build-thumbnails.mjs:62` |

### 3.2 Co jest słabe

1. **Zero wspólnego kontraktu.** Sześć kart ma funkcję o nazwie `*Problems`, ale sygnatury się różnią (symetria: `(card)`; pieniądze: `(card, level)`; sekwencje: dwa poziomy sprawdzenia) i nic nie łączy ich w jeden typ. To konwencja nazwy, nie kontrakt.
2. **Nic nie wymusza, żeby nowa karta ją miała.** Jedyne testy, które iterują po `CARD_KINDS`, sprawdzają ustawienia i miniatury (`card-settings.test.ts:33`, `card-summary.test.ts:21`), nie poprawność kart. Rodzaj dopisany do `CARD_KINDS` z generatorem, który nic nie sprawdza, przechodzi kompilację i testy rejestru. Rejestr ma pięć pól opisowych (`cards.ts:1-8`: `id`, `title`, `href`, `thumbnail`, `description`) i żadnego odnoszącego się do generowania.
3. **Każdy generator zwraca `Karta | null`, a każdy komponent obsługuje `null` po swojemu** (siedem niezależnych `useState(false)` na `generateFailed`: `WorksheetGenerator.tsx:42`, `DictationGenerator.tsx:33`, `MoneyGenerator.tsx:30`, `NonogramGenerator.tsx:35`, `SequenceGenerator.tsx:32`, `SudokuGenerator.tsx:42`, `SymmetryGenerator.tsx:33`). `null` nie mówi, *dlaczego*: wyczerpane próby (legalne, np. cienka kategoria) i defekt generatora są nieodróżnialne.
4. **Strażnik może być pominięty przez wywołującego**: `generateMaze` (`maze/generate.ts:30`) jest publiczne i zwraca niezweryfikowany wynik; `walls.test.ts:46` właśnie tak go używa.
5. **Nieznana zupełność strażników.** Znane miękkie miejsca (za D01): łatwy nonogram sprawdza tylko `no-filled-cell`, `too-many-runs`, `runs-mismatch`, a jednoznaczność wynika z konstrukcji (`nonogram/simple.ts:86-97`, D01 A5); punkt startu dyktanda jest w konstrukcji `traceOutline`, a `dictationCardProblems` go nie sprawdza (`dictation/outline.ts:217` vs `dictation/generate.ts:193-234`, D01 R-9). To dokładnie ten rodzaj luki, który wspólny kontrakt z „testem żywotności" (4.3) wykrywa.
6. **Test czasu (I-4) jest per karta i brakuje go dla symetrii i dyktanda** (za D01 R-10).

### 3.3 Labirynt jako najgorszy przypadek (sonda)

Dla labiryntu bramka `mazeForSheet` leży poza domeną i sprawdza tylko część tego, co trafia na kartkę. Sonda (dodatek A) wzięła poprawny labirynt Poziomu 3 (`generateMaze("lat5", seed 1)`), zmieniła jedną rzecz i zapytała `mazeForSheet`:

| Mutacja | `mazeForSheet` | Skutek na kartce |
|---|---|---|
| Zamknięta północna ściana wejścia | **przyjęty** | `walls.ts:22` narysuje ścianę: dziecko nie ma jak wejść |
| Zamknięta południowa ściana wyjścia | **przyjęty** | analogicznie przy mecie (`walls.ts:34`) |
| Dziura w zewnętrznej ścianie (`cells[5][0].west = false`) | **przyjęty** | `countPaths` ignoruje wyjście poza siatkę (`maze/generate.ts:103`); `walls.ts:43` dziury nie narysuje |
| Ściana otwarta z jednej strony (`A.east=false`, `B.west=true`) | **przyjęty**, `countPaths=1` | `walls.ts:25` rysuje tylko `A.east`, więc rysunek pokazuje przejście, którego solver idący z B do A nie widzi |
| Otwarta tylko strona `B.west` (`A.east=true`) | **przyjęty** | rysunek (tylko `east`) pokazuje ścianę, a solver z B przejdzie przez nią |

Wynik sondy: `sealed entrance accepted: true`, `sealed exit accepted: true`, `outer-wall hole accepted: true`, `asymmetric wall accepted: true paths: 1`, `west-only open accepted: true`.

**Czego to dowodzi i czego nie.** Dowodzi, że strażnik nie obejmuje tego, co jest rysowane (solver i rysunek mają dwa różne modele ściany, a granice siatki są cicho ignorowane: `maze/generate.ts:94`, `:97`, `:100`, `:103`). **Nie dowodzi**, że dziś ktoś dostaje zepsutą kartkę: `generateCandidate` buduje komórki symetrycznie (`openPassage`, `maze/generate.ts:318-327`), więc żaden z tych stanów nie powstaje z dzisiejszego generatora. Ryzyko jest naruszalne, nie naruszane. Dotyczy to przyszłej zmiany generatora (PRD:670 już dopuszcza pętle w ślepych odnogach Poziomu 6). Dla pozostałych sześciu kart takiej sondy nie robiłem; faza 0 sprawdza je jednym wspólnym testem.

(zmiana po odpowiedzi nr 4) Osiągalność wszystkich komórek jest regułą produktu, a bramka `mazeForSheet` jej nie sprawdza: z lektury `maze/generate.ts:114-130` wynika, że liczy tylko drogi wejście→wyjście, więc komórki odcięte od tej drogi go nie obchodzą. Tego przypadku sonda nie obejmowała; pokrywa go dopiero test generatora (`maze/generate.test.ts:149`), czyli tylko dla map z dzisiejszego generatora.

(zmiana po odpowiedzi nr 5) Do diagnozy 3.2 pkt 3 dochodzi skutek dla rodzica: `null` nie niesie przyczyny, więc UI nie ma z czego jej pokazać, a właścicielka chce ją pokazywać.

## 4. Projekt: `VerifiedCard` i `CardEngine`

### 4.1 Idea w jednym zdaniu

Karta pokazana w UI ma typ `VerifiedCard<C>`, którego **nie da się skonstruować bez wywołania funkcji sprawdzającej rodzaju**, a rejestr rodzajów wymaga od każdego rodzaju silnika, który produkuje tylko `VerifiedCard`.

### 4.2 Granice

- **Root agregatu: `VerifiedCard<C>`**: niezmienna wartość (zamrożona kopia karty `C` + `kind` + `key`), konstruktor prywatny. Nietrwała (PRD:649).
- **Polityka rodzaju: `CardSpec<S, C>`**: jedyny element, który pisze autor rodzaju: `problems`, `keyOf`. To on mówi, *co znaczy* „jedna odpowiedź" dla tej karty.
- **Fabryka: `CardEngine<S, C>`**: `generate(settings, random, previousKey): VerifiedCard<C>`; to ona próbkuje kandydatów w pętli i przepuszcza przez `spec`.
- **Poza agregatem:** układ A4, postać, rysowanie, stan paska ustawień.

**Odrzucone alternatywy:** (a) osobny agregat dla każdego rodzaju w stylu `MazeCard`, `SymmetryCardGuard`… — powiela ten sam mechanizm siedem razy i nic nie pilnuje ósmego; (b) jedna klasa bazowa `Card` z dziedziczeniem — karty mają różne dane i różne sygnatury sprawdzeń, więc dziedziczenie wymusiłoby `any`.

### 4.3 Kontrakt (sygnatury)

```ts
// src/lib/card-contract.ts (nowy)

export interface CardProblem {
  code: string;          // stabilny identyfikator, np. "hints-reveal-all", "entrance-sealed"
  detail: string;        // dla człowieka; nie parsować
}

/** Co pisze autor rodzaju. Nic poza tym nie jest dozwolone. */
export interface CardSpec<S, C> {
  readonly kind: CardKindId;
  /** Pusta lista = karta legalna. MUSI być zdefiniowana dla każdego rodzaju; co dokładnie sprawdza, decyduje rodzaj. */
  problems(card: C, settings: S): readonly CardProblem[];
  keyOf(card: C): string;                  // dla "Generuj daje nową kartę" (I-2)
  /** Znane złe karty: test żywotności wymaga, by `problems` każdą odrzuciło. */
  readonly knownBad: ReadonlyArray<{ name: string; card: C; settings: S; expectedCode: string }>;
}

/** Nazwany błąd domenowy: karta jest nielegalna. */
export class CardInvariantError extends Error {
  readonly name = "CardInvariantError";
  constructor(readonly kind: CardKindId, readonly problems: readonly CardProblem[]) { super(...); }
}

/** Nazwany wynik legalny, ale pusty: próbki się skończyły (np. cienka kategoria). Nie jest defektem. */
export class CardExhausted extends Error {
  readonly name = "CardExhausted";
  constructor(readonly kind: CardKindId, readonly attempts: number) { super(...); }
}

export class VerifiedCard<C> {
  private constructor(readonly kind: CardKindId, readonly card: Readonly<C>, readonly key: string) {}

  /** Jedyny sposób na legalny `VerifiedCard`. Rzuca CardInvariantError. */
  static require<S, C>(spec: CardSpec<S, C>, card: C, settings: S): VerifiedCard<C> {
    const problems = spec.problems(card, settings);
    if (problems.length > 0) throw new CardInvariantError(spec.kind, problems);
    return new VerifiedCard(spec.kind, deepFreeze(structuredClone(card)), spec.keyOf(card));
  }

  /** Dla pętli próbkującej: nie rzuca, zwraca problemy (karta odrzucona, losujemy dalej). */
  static check<S, C>(spec: CardSpec<S, C>, card: C, settings: S):
    { ok: true; card: VerifiedCard<C> } | { ok: false; problems: readonly CardProblem[] };
}

export interface CardEngine<S, C> {
  readonly spec: CardSpec<S, C>;
  /**
   * Zwraca VerifiedCard albo rzuca. Nigdy `null`.
   *  - CardExhausted: próby wyczerpane (legalne; UI wyłącza poprzednią kartę i pokazuje przyczynę). (zmiana po odpowiedzi nr 2 i nr 5)
   *  - CardInvariantError: kandydat z kroku KONSTRUKCYJNEGO jest nielegalny (defekt generatora; UI nie zgaduje).
   */
  generate(settings: S, random: () => number, previousKey: string | null): VerifiedCard<C>;
}
```

Dwa tryby wytwarzania, bo tak naprawdę działają dzisiejsze generatory:

- **Próbkujące** (symetria, sekwencje, sudoku, nonogram, dyktando, pieniądze): losują kandydata, `check`, przy odrzuceniu losują dalej (`symmetry/generate.ts:60-68`), po limicie prób `CardExhausted`. Odrzucony kandydat to normalny przebieg, nie błąd.
- **Konstrukcyjny** (labirynt: drzewo rozpinające z zasady ma jedną drogę): `require` na zwycięzcy z 20 kandydatów; naruszenie to defekt generatora i rzuca `CardInvariantError`.

**Rejestr wymusza kontrakt:**

```ts
// src/lib/cards.ts (zmiana)
export const CARD_KINDS = [ { id: "labirynt", ... }, ... ] as const satisfies readonly CardKind[];
export type CardKindId = (typeof CARD_KINDS)[number]["id"];

// src/lib/card-engines.ts (nowy)
export const CARD_ENGINES = {
  labirynt: mazeEngine, symetria: symmetryEngine, sudoku: sudokuEngine, sekwencje: sequenceEngine,
  nonogram: nonogramEngine, dyktando: dictationEngine, pieniadze: moneyEngine,
} satisfies { [K in CardKindId]: CardEngine<any, any> };
```

Dopisanie rodzaju do `CARD_KINDS` bez silnika **nie kompiluje się** (`npx astro check` jest w jobie `ci`, AG „Tests and CI"). Nowa karta (S-34, S-35, S-36) nie może wejść do katalogu bez strażnika.

### 4.4 „Test żywotności" i test zbiorczy

Strażnik, który zawsze zwraca `[]`, przechodzi każdy test „generator daje karty bez problemów". Dlatego kontrakt wymaga `knownBad`. Jeden plik `src/lib/card-engines.test.ts` iteruje po `CARD_ENGINES` i dla **każdego** rodzaju:

1. **Kompletność:** `Object.keys(CARD_ENGINES)` = id z `CARD_KINDS`.
2. **Legalność:** dla każdego poziomu/ustawienia × N ziaren `generate` zwraca `VerifiedCard`, a niezależne `spec.problems(card.card, settings)` jest puste.
3. **Różnorodność (I-2):** kolejne `generate` z `previousKey` daje inny `key` (z tolerancją `CardExhausted` tam, gdzie PRD to dopuszcza).
4. **Czas (I-4):** średni czas `generate` < 5 s, na każdym poziomie (domyka lukę R-10 dla symetrii i dyktanda).
5. **Żywotność:** każda pozycja `spec.knownBad` jest odrzucana przez `problems` z `expectedCode`.
6. **Niezmienność:** `VerifiedCard.card` jest zamrożony.

Ten test nie wymaga niczego od autora nowej karty poza `engine` i `knownBad`; reszta dzieje się sama.

### 4.5 Repozytorium, transakcja, „API"

- **Repozytorium: brak, świadomie** (PRD:649, 924). Rolę „ładowania" pełni `CardEngine.generate`, rolę „zapisu" przypisanie do stanu Reacta.
- **Atomowość:** konstruktor `VerifiedCard` jest atomowy: albo zwraca w pełni sprawdzoną zamrożoną kartę, albo rzuca. Po stronie UI zamiana karty to jedna wartość stanu (4.6).
- **Cienka warstwa UI (zamiast route)**, jedna na wszystkie rodzaje:

```ts
// komponent (po refaktorze, na przykładzie symetrii)
function handleGenerate(): void {
  setSheet((cur) => generateSheet(cur, CARD_ENGINES.symetria, settings, Math.random));
}
```

`generateSheet` (czysta funkcja w `src/lib/`) łapie **wyłącznie** `CardExhausted` i `CardInvariantError` i mapuje je na stan; każdy inny błąd (np. `TypeError`) leci dalej bez zmiany stanu.

(zmiana po odpowiedzi nr 5) Stan niesie złapany błąd jako przyczynę (`failure`, 4.6), a UI zamienia go na krótki tekst dla rodzica funkcją `failureReason(failure)`: inny dla `CardExhausted` (np. brak kolejnych wariantów w wybranej kategorii i na wybranym poziomie, bo kategoria i poziom są znane z ustawień) i dla kodów `CardInvariantError`. Brzmienie tekstów ustala się w implementacji; plan wymaga tylko tego, że przyczyna dociera do rodzica. `console.error` z kodem przy defekcie zostaje jako dodatek dla twórcy.

### 4.6 Stan strony jako jedna wartość (opcjonalnie, faza 3b)

Wspólny dla siedmiu komponentów (dziś siedem kopii flag, 3.2 pkt 3):

```ts
export type CardFailure = CardExhausted | CardInvariantError;   // (zmiana po odpowiedzi nr 5)

export type SheetState<C> =
  | { kind: "idle"; failure: CardFailure | null }                  // przed pierwszą kartą; failure po nieudanym Generuj
  | { kind: "showing"; card: VerifiedCard<C> }                     // jedyny stan drukowalny
  | { kind: "unavailable"; failure: CardFailure };                 // karta była, Generuj albo zmiana poziomu nie wyszły (dzisiaj labirynt: WorksheetGenerator.tsx:76-77)
```

(zmiana po odpowiedzi nr 2) Decyzja 7.2 zapadła: nieudane Generuj przy pokazanej karcie wyłącza ją tak samo jak nieudana zmiana poziomu, czyli przechodzi w `unavailable`. Dlatego znika flaga `lastAttemptFailed` i stan „stara karta + komunikat"; drukować można tylko w `showing`. Jest to zmiana zachowania względem dziś (`WorksheetGenerator.tsx:53-56` zostawia starą kartę).

(zmiana po odpowiedzi nr 5) `failed: boolean` zastąpione przez `failure`, żeby UI miało z czego zbudować przyczynę.

Stan nie jest częścią niezmiennika I-1, więc można go pominąć bez utraty gwarancji. (zmiana po odpowiedzi nr 2) Jeśli go pominąć, decyzja 7.2 musi zostać wdrożona osobno w każdym z siedmiu komponentów.

### 4.7 Wymuszenie „jedyne miejsce"

Typy same nie zabronią zaimportowania `generateSymmetryCard` wprost. Reguła dependency-cruisera (CI uruchamia `npm run depcruise`; `.dependency-cruiser.cjs:267` ma `tsPreCompilationDeps: true`, więc importy typów da się odróżnić):

```js
{
  name: 'cards-only-through-engines',
  severity: 'error',
  comment: 'UI dostaje karty wyłącznie z CARD_ENGINES (VerifiedCard), nie z surowych generatorów.',
  from: { path: '^src/(components|hooks|pages)/' },
  to: {
    path: '^src/lib/(maze|symmetry|sequence|sudoku|nonogram|dictation|money)/generate\\.ts$',
    dependencyTypesNot: ['type-only']
  }
}
```

Znane odstępstwo do przeniesienia: `SudokuGenerator.tsx:12` importuje wartość `sudokuBlock` z `sudoku/generate`, więc w fazie 3 trafia do osobnego modułu. `depcruise` obejmuje `src` i `tests` (`package.json`, skrypt `depcruise`), **nie** `scripts/`, więc `build-thumbnails.mjs` migruję ręcznie.

### 4.8 Labirynt: pierwsza migracja

`mazeSpec.problems(grid, level)` zwraca listę `CardProblem` z kodami (kolejność jest kontraktem testu; sprawdzenie strukturalne `grid-size` przerywa dalsze, żeby nie dostać `TypeError`):

| Kod | Niezmiennik |
|---|---|
| `grid-size` | `width = level.columns`, `height = level.rows`, `cells` ma `height` wierszy po `width` komórek |
| `entrance-position` | wejście = `level.entrance` |
| `entrance-sealed` | północna ściana komórki wejścia jest otwarta |
| `exit-position` | wyjście w wierszu `rows-1` i kolumnie z `level.exitColumns` |
| `exit-sealed` | południowa ściana komórki wyjścia jest otwarta |
| `outer-wall-open` | każda inna zewnętrzna ściana jest zamknięta |
| `wall-mismatch` | każda wewnętrzna ściana jest taka sama z obu stron (`A.east = B.west`, `A.south = B.north`) |
| `no-route` | istnieje co najmniej jedna prosta droga wejście→wyjście |
| `several-routes` | nie istnieje druga prosta droga wejście→wyjście |
| `unreachable-cells` | każda komórka siatki jest osiągalna z wejścia (zmiana po odpowiedzi nr 4); sprawdzane jako ostatnie, bo wymaga spójnych ścian |

`mazeEngine.generate`: dzisiejsza pętla z `maze/generate.ts:30-42` (20 kandydatów, `scoreMaze`) → `VerifiedCard.require(mazeSpec, zwycięzca, { levelId })`. Weryfikuję zwycięzcę, nie wszystkich 20: gwarancja ta sama, koszt jeden `countPaths` (liniowy na drzewie). `countPaths` i `scoreMaze` zostają jako funkcje modułu (testowane dziś na ręcznych siatkach); ciche ignorowanie granic w `countPaths` przestaje być groźne, bo `outer-wall-open` odrzuca siatkę z otwartą granicą. Labirynt traci dziś brakujący `Card` i `*Problems`: oba pojawiają się przez to samo.

(zmiana po odpowiedzi nr 4) Osiągalność wszystkich komórek jest regułą produktu, więc wchodzi do `mazeSpec` jako kod `unreachable-cells` (wcześniej ją pomijałem, bo PRD jej nie nazywał). Dziś pilnuje jej tylko test generatora (`maze/generate.test.ts:149`, `reachableCount`). Pętle w ślepych odnogach (PRD:670) zostają legalne: pętla nie odcina komórek, więc nie łamie tej reguły. PRD:670 wymaga doprecyzowania (faza 6).

## 5. Before / after

| # | Miejsce | Before | After |
|---|---|---|---|
| 1 | `cards.ts:10` `CARD_KINDS` | lista opisów, `id: string` | `as const satisfies`, `CardKindId`; rejestr silników wymuszony kompilatorem |
| 2 | `maze/generate.ts:114-130` `mazeForSheet` | 5 sprawdzeń, `null` bez przyczyny, poza domeną | `mazeSpec.problems` (10 kodów, w tym `unreachable-cells`; zmiana po odpowiedzi nr 4); `mazeForSheet` usunięty |
| 3 | `maze/generate.ts:30-42` `generateMaze` | publiczne, niezweryfikowane | wewnętrzna pętla `mazeEngine.generate`; publiczne tylko przez silnik |
| 4 | `WorksheetGenerator.tsx:52`, `:74` | dwie kopie `mazeForSheet(generateMaze(...))` | `generateSheet(CARD_ENGINES.labirynt, …)` |
| 5 | `symmetry/generate.ts:49-68` (i analogiczne w 5 kartach) | `generateXCard(...) : X \| null`, pętla woła `*Problems` | `symmetryEngine.generate : VerifiedCard`; `null` → `CardExhausted` |
| 6 | siedem `useState(false)` na `generateFailed` | flagi per komponent | `SheetState<C>` (opcjonalnie, 4.6) albo przynajmniej wspólna obsługa `CardExhausted`; nieudane Generuj wyłącza kartę i pokazuje przyczynę (zmiana po odpowiedzi nr 2 i nr 5) |
| 7 | `scripts/build-thumbnails.mjs:62-65` | `mazeForSheet(...) === null → throw` | `CARD_ENGINES.labirynt.generate(...)` (rzuca samo) |
| 8 | `sheet/character.test.ts:78` | regex na treść komponentu `generateMaze\(level, Math\.random\)` | test zachowania silnika (regex usunięty) |
| 9 | `sheet/walls.test.ts:3`, `:46` | `generateMaze("lat5", () => 0.5)` | silnik labiryntu; reguła depcruise to wymusza |
| 10 | `maze/generate.test.ts:289-343` | testy `mazeForSheet` przez `null` | testy `mazeSpec.problems` z asercją na `code` |
| 11 | `dictation/generate.ts:193-234` | nie sprawdza punktu startu (D01 R-9) | `dictationSpec.problems` dodaje sprawdzenie albo PRD:794 traci zdanie — **decyzja właściciela**, plan jej nie przesądza |
| 12 | `stryker/maze.config.json` | mutuje `maze/generate.ts` itd. | dodaję `card-contract.ts` i `maze` spec do `mutate` oraz ich testy do `commandRunner` |

## 6. Plan faz

Projekt ma runner (`node --experimental-strip-types --test`, `package.json:12`) i dyscyplinę TDD (skille `10x-tdd`, `10x-implement`). **Uwaga proceduralna:** skrypt `test` wylicza pliki ręcznie, a jego środek ma literówkę (`analytics.test.tssrc/lib/last-used.test.ts`, D01 R-12, właściciel: „nie wiadomo"). Nowe pliki testów dopisuję **na końcu** listy i nie naprawiam R-12 w tym planie.

| Faza | Zakres | Tryb | Gotowe, gdy |
|---|---|---|---|
| **0** | **Inwentaryzacja bez zmiany kodu produkcyjnego.** (a) Test zbiorczy z 4.4 pkt 2–4 napisany na *dzisiejszych* generatorach i `*Problems` (przez cienkie adaptery w pliku testu). (b) `knownBad` dla każdej z 7 kart, w tym 5 mutacji labiryntu z sondy (dodatek A). Czerwone testy to znaleziska (kandydaci: D01 A5 i R-9) | **test-first** | test istnieje; lista czerwonych przypadków jest zapisana i przejrzana z właścicielem przed fazą 2 |
| **1** | `card-contract.ts` (`CardSpec`, `VerifiedCard`, `CardInvariantError`, `CardExhausted`) + testy kontraktu C1–C9 (6.1) | **test-first** | testy zielone |
| **2** | Silniki rodzaj po rodzaju, **osobne małe zmiany**: najpierw labirynt (największa luka), potem pozostałe sześć. Każdy: `spec` + `knownBad` + `engine` owijające istniejącą pętlę; zachowanie generatora bez zmian | **test-first** dla spec i `knownBad`; owinięcie istniejącej pętli jest refaktorem pod osłoną testów generatora | testy z fazy 0 dla danego rodzaju zielone; stare testy generatora zielone |
| **3** | Komponenty przechodzą na `CARD_ENGINES`; `CARD_KINDS` → `as const satisfies`; `sudokuBlock` do osobnego modułu; reguła `cards-only-through-engines`; usunięcie `mazeForSheet`, publicznego `generateMaze`, regexu `character.test.ts:78` | implementacja (klej UI); regresja: e2e Chromium na wolnym porcie (`E2E_PORT`, AG „Tests and CI") | `npm test`, `npm run lint`, `npx astro check`, `npm run depcruise` zielone; zrzut `/maze` i pozostałych stron bez zmian wizualnych |
| **3b** | (opcjonalnie) `SheetState<C>` zamiast siedmiu zestawów flag | test-first dla czystych przejść (w tym: nieudane Generuj przy `showing` → `unavailable`, nie `showing`; `failure` niesie przyczynę) | decyzje 7.2 i 7.5 zapadły (zmiana po odpowiedzi nr 2 i nr 5); faza pozostaje opcjonalna, ale bez niej zmianę zachowania trzeba wdrożyć w siedmiu komponentach osobno |
| **4** | **Karty z M-5 rodzą się w kontrakcie**: definicja gotowości S-34, S-35, S-36 dostaje punkt „silnik w `CARD_ENGINES` + `spec` + `knownBad` + test zbiorczy zielony". Treść `problems` dla szlaczków: patrz 7.1 | – | dopisane do `roadmap.md` przy otwarciu kamienia S-34..S-36 |
| **5** | Mutacja wąska: `npm run mutate:maze -- --mutate "src/lib/card-contract.ts"` oraz na spec labiryntu (AG „Mutation testing"); ocalałe mutanty jeden po drugim, asercja tylko tam, gdzie mutant = błąd widoczny dla rodzica | test-after | decyzje zapisane w `context/changes/<id>/reviews/stryker-results.md` |
| **6** | Dokumenty: pojęcia z sekcji 8 do `context/domain/glossary.md`; w TP §2 ryzyko 1 i 8–9 doprecyzować, że strażnik jest wspólny. PRD: doprecyzować PRD:670 (pętle w ślepych odnogach legalne, odcięte komórki nie; zmiana po odpowiedzi nr 4), reszta PRD bez zmian | dokumenty | – |

Po fazach 0–2 zachowanie aplikacji się nie zmienia (nikt jeszcze nie woła silników). Zmiana zachowania następuje w fazie 3 i sprowadza się do tego, że karta z wadą przestaje przechodzić (czego dzisiejsze generatory poza ewentualnymi znaleziskami fazy 0 i tak nie produkują).

### 6.1 Przypadki testowe kontraktu (`card-contract.test.ts`, faza 1)

| ID | Przypadek | Oczekiwanie |
|---|---|---|
| C1 | `require` z `problems = []` | zwraca `VerifiedCard` z `kind`, `key = keyOf(card)` |
| C2 | `require` z jednym problemem | rzuca `CardInvariantError` z `problems` i `kind`; nic nie zwraca |
| C3 | `check` z problemami | `{ ok: false, problems }`, bez wyjątku |
| C4 | `check` bez problemów | `{ ok: true, card }` |
| C5 | próba `verified.card.x = …` | `TypeError` (zamrożenie) |
| C6 | zmiana wejściowej karty *po* `require` | nie zmienia `verified.card` (kopia) |
| C7 | silnik próbkujący z samymi odrzuconymi kandydatami | `CardExhausted` z liczbą prób; nigdy `null` |
| C8 | silnik konstrukcyjny z nielegalnym zwycięzcą | `CardInvariantError`, nie `CardExhausted` |
| C9 | `new VerifiedCard(...)` poza modułem | błąd kompilacji (`@ts-expect-error` w teście) |

### 6.2 Przypadki testowe labiryntu (`mazeSpec`, faza 2)

**Legalne:** L1 `generate` dla 6 poziomów × 5 ziaren daje kartę o wymiarach, wejściu i wyjściu poziomu. L2 świeży `generateCandidate` jest przyjęty (100 ziaren × poziom). L3 siatka z pętlą w ślepej odnodze (poza drogą) jest **przyjęta** (PRD:670). L4 determinizm: to samo ziarno daje równe karty (jak `maze/generate.test.ts:232`). L5 czas Poziomu 6 < 500 ms na kartę (przenosiny testu, `MUTATION_RUN` jak dziś). L6 (zmiana po odpowiedzi nr 4) każda komórka karty z generatora jest osiągalna z wejścia, 6 poziomów × 5 ziaren; test przenosi asercję z `maze/generate.test.ts:149` do `mazeSpec`, a jej odpowiednikiem negatywnym jest N13.

**Nielegalne** (asercja na `code`, nie na `null`):

| ID | Mutacja | Kod |
|---|---|---|
| N1 | `width+1`; `height+1`; brak wiersza `cells`; skrócony wiersz | `grid-size` |
| N2 | wejście w złej kolumnie; w złym wierszu | `entrance-position` |
| N3 | zamknięta północna ściana wejścia | `entrance-sealed` |
| N4 | wyjście w wierszu `rows-2`; kolumna spoza `exitColumns`; kolumna bliższa środka niż 2 | `exit-position` |
| N5 | zamknięta południowa ściana wyjścia | `exit-sealed` |
| N6 | otwarta: zachód kol. 0; wschód ostatniej kol.; północ rzędu 0 poza wejściem; południe ostatniego rzędu poza wyjściem | `outer-wall-open` (4) |
| N7 | `A.east=false,B.west=true`; `B.west=false,A.east=true`; `A.south=false,B.north=true` | `wall-mismatch` (3) |
| N8 | wszystkie ściany zamknięte (z otwartym wejściem i wyjściem, żeby nie zasłonić tego kodu); odcięte wyjście | `no-route` |
| N9 | `fullyOpen` (`maze/generate.test.ts:554`); „diament z ogonem" (`:430`) | `several-routes` |
| N10 | nieznany `levelId` | zwykły `Error` z `maze/levels.ts:117` (błąd programisty), **nie** `CardInvariantError` |
| N11 | silnik z wstrzykniętym wadliwym kandydatem (N3, N6, N7, N9) | `CardInvariantError`; nic nie zwraca |
| N12 | kandydat z dwoma wadami | pierwszy kod w kolejności tabeli; kolejność jest kontraktem |
| N13 | (zmiana po odpowiedzi nr 4) legalna droga wejście→wyjście plus komórka (lub grupa komórek) odcięta zamkniętymi ścianami z każdej strony; osobno: odcięta grupa z własną pętlą, która nie tworzy drugiej drogi | `unreachable-cells` |
| N14 | (zmiana po odpowiedzi nr 4) pętla w ślepej odnodze osiągalnej z drogi (PRD:670), wszystkie komórki osiągalne | brak problemów (legalna); przypadek graniczny do N13 |
| N15 | (zmiana po odpowiedzi nr 5) każdy kod labiryntu ma niepusty tekst przyczyny w `failureReason`; `CardExhausted` ma osobny tekst | test kompletności mapowania |
| N16 | (zmiana po odpowiedzi nr 2) `SheetState`: `showing` + nieudane Generuj (`CardExhausted` albo `CardInvariantError`) → `unavailable` z `failure`; `idle` + nieudane Generuj → `idle` z `failure`; `unavailable` + udane Generuj → `showing`; inny błąd (`TypeError`) → stan bez zmiany | test czystych przejść (faza 3b) |

Dla pozostałych sześciu kart `knownBad` i przypadki wyprowadzam z już istniejących testów negatywnych przy ich `*Problems` (np. `hint-not-in-answer`, `hints-reveal-all` dla symetrii: kody w `symmetry/generate.ts:275-280`); nie wypisuję ich tu jeden po drugim, bo nie czytałem wszystkich testów tych kart.

## 7. Decyzje właściciela (nie rozstrzygam)

1. **Szlaczki.** Właściciel: karta ma jedną prawidłową odpowiedź, ale nie rozstrzyga tego przed implementacją. PRD mówi inaczej w trybie kontynuacji (PRD:512: „wyjątek od jednej sprawdzalnej odpowiedzi"). Kontrakt jest na to neutralny: `CardSpec.problems` jest wymagane, a jego treść należy do rodzaju. Konsekwencje na później: (a) jeśli odpowiedź jest jedna, `problems` ją sprawdza jak w innych kartach i PRD:512 wymaga korekty; (b) jeśli nie, `problems` sprawdza słabszy warunek (np. początek zawiera ≥2 powtórzenia wzoru, PRD „Karta szlaczków") i kontrakt nic nie zmienia. Plan nie wprowadza „trybu bez sprawdzalnej odpowiedzi".
   - **Odpowiedź (2026-11-03):** Decyzja zapadnie na etapie implementacji karty szlaczków. Plan zostaje neutralny.
2. **Nieudane Generuj przy pokazanej karcie:** zostawić starą kartę drukowalną (dziś, np. `WorksheetGenerator.tsx:53-56`) czy ją wyłączyć jak po nieudanej zmianie poziomu? Dotyczy tylko fazy 3b.
   - **Odpowiedź (2026-11-03):** Wyłączyć, jak po nieudanej zmianie poziomu. Po nieudanym Generuj stan przechodzi więc w `unavailable` (bez drukowalnej karty), a nie zostaje przy starej karcie.
3. **Punkt startu dyktanda (D01 R-9):** dodać do `dictationSpec.problems` czy usunąć zdanie z PRD:794. Ten sam rodzaj pytania wyjdzie dla łatwego nonogramu (D01 A5), jeśli faza 0 coś znajdzie.
   - **Odpowiedź (2026-11-03):** Nie wiadomo. Pytanie zostaje otwarte do wyników fazy 0.
4. **Osiągalność wszystkich komórek labiryntu:** czy jest regułą produktu (dziś tylko test generatora). Jeśli tak, dochodzi kod `unreachable-cells`, który wyklucza ślepe „wyspy" dopuszczone w PRD:670.
   - **Odpowiedź (2026-11-03):** Tak, osiągalność wszystkich komórek jest regułą produktu. Kod `unreachable-cells` dochodzi do tabeli w 4.8 i do testów 6.2; PRD:670 wymaga wtedy doprecyzowania, bo dopuszcza „pętle w ślepych odnogach" (pętle nie są wyspami i zostają legalne).
5. **Przyczyna w UI:** wystarczy jeden tekst błędu na kartę (dziś np. `GENERATE_FAILED_TEXT`, `WorksheetGenerator.tsx:32`) czy `CardExhausted` i `CardInvariantError` mają się różnić dla rodzica (plan: nie, tylko `console.error` z kodem przy defekcie).
   - **Odpowiedź (2026-11-03):** Dodać przyczynę, jeśli to nie jest problem. Rodzic widzi więc krótką przyczynę niepowodzenia (z `CardExhausted` albo kodu `CardInvariantError`), a nie jeden wspólny tekst.

## 8. Nowe nazwy „load-bearing" do zarejestrowania

Projekt **nie ma** rejestru kontraktów (grep po `context/foundation`, `context/domain`, `AGENTS.md` na „load-bearing"/„contract registry": 0 trafień). Najbliższe miejsce: `context/domain/glossary.md`. Nazwy, na których opierają się testy i UI, więc zmiana którejkolwiek jest zmianą kontraktu:

| Nazwa | Rola |
|---|---|
| `VerifiedCard<C>`, `VerifiedCard.require`, `VerifiedCard.check` | jedyny legalny typ karty w UI |
| `CardSpec<S, C>` (`problems`, `keyOf`, `knownBad`) | co pisze autor rodzaju |
| `CardEngine<S, C>` (`generate`) | fabryka rodzaju |
| `CARD_ENGINES`, `CardKindId` | rejestr silników, wymuszony `satisfies` |
| `CardProblem.code` | stabilne kody przyczyn; testy pinują wartości |
| `CardInvariantError`, `CardExhausted` | nazwane błędy domenowe; UI łapie tylko te dwa |
| kody labiryntu: `grid-size`, `entrance-position`, `entrance-sealed`, `exit-position`, `exit-sealed`, `outer-wall-open`, `wall-mismatch`, `no-route`, `several-routes`, `unreachable-cells` (zmiana po odpowiedzi nr 4) | kolejność sprawdzania jest kontraktem testu N12 |
| `failureReason(failure)`, `CardFailure` (zmiana po odpowiedzi nr 5) | zamiana błędu domenowego na tekst przyczyny dla rodzica; test kompletności N15 |
| `SheetState<C>` (`idle` / `showing` / `unavailable`) | tylko jeśli faza 3b |
| `cards-only-through-engines` | nazwa reguły depcruise |
| `src/lib/card-contract.test.ts`, `src/lib/card-engines.test.ts` | pliki dopisane do skryptu `test` i `stryker/maze.config.json` |
| Bez zmiany: `LevelId` (`maze/levels.ts:3`), id poziomów `lat3…nastolatek`, klucze `localStorage` | dane zapisane w profilach — plan ich nie dotyka |

Usuwane z kontraktu: `mazeForSheet`, publiczne `generateMaze`, regex `character.test.ts:78`.

## 9. Ryzyka planu i czego nie sprawdziłem

- **Nie uruchamiałem `npm test`.** Nie wiem, czy cała dzisiejsza paczka przechodzi na gałęzi `domain-ddd`.
- **Nie przeczytałem w całości** żadnego z sześciu pozostałych generatorów ani ich testów ani komponentów `*Generator.tsx`; widziałem wywołania `*Problems` i miejsca wywołań generatorów. Zakładam, że każda pętla ma limit prób i zwraca `null` po jego przekroczeniu (potwierdzone w symetrii: `symmetry/generate.ts:57`, `:68`; w pozostałych po wzorcu `return null` z D01). Faza 0 to sprawdza.
- **Typowanie `CardEngine<any, any>` w rejestrze** jest kompromisem: różne rodzaje mają różne `S`. Alternatywa (mapowany typ po `CardKindId`) wymaga wspólnej mapy `Settings` — dziś `CardSettingsMap` w `card-settings.ts:57` jest jej zalążkiem. Do rozstrzygnięcia w fazie 1.
- **Koszt `structuredClone` + zamrożenie** dla największych kart (labirynt 29×35, nonogram trudny, sudoku 9×9) nie był mierzony; test czasu (4.4 pkt 4) ma to potwierdzić. Sudoku sprawdza jednoznaczność solverem, więc `require` nie może drugi raz liczyć tego, co pętla już policzyła; stąd `check` zwracające od razu `VerifiedCard`.
- **React w trybie strict** woła updatery `setState` dwa razy w dev. Updater `generateSheet` zużywa losowość, więc wynik nie jest powtarzalny między wywołaniami; poprawny pozostaje. Alternatywa: losować przed `setSheet`. Do wyboru w fazie 3.
- **Nie ruszam** D01 R-1…R-14 poza R-9 i R-10, które plan wprost dotyka.

## Dodatek A. Sonda użyta w sekcji 3.3

Skrypt jednorazowy (poza repo, usunięty po uruchomieniu; `node --experimental-strip-types`). Zasada: poprawny labirynt Poziomu 3 z ziarnem 1, jedna mutacja, wywołanie `mazeForSheet(m, "lat5")`.

```js
const base = generateMaze("lat5", rng(1));
m = clone(base); m.cells[m.entrance.row][m.entrance.col].north = true;   // wejście zamknięte
m = clone(base); m.cells[m.exit.row][m.exit.col].south = true;          // wyjście zamknięte
m = clone(base); m.cells[5][0].west = false;                              // dziura w ramce
// pierwsza zamknięta wewnętrzna ściana wschodnia: A.east = false  (B.west zostaje true)
// pierwsza zamknięta wewnętrzna ściana wschodnia: B.west = false  (A.east zostaje true)
```

Wynik: `sealed entrance accepted: true`, `sealed exit accepted: true`, `outer-wall hole accepted: true`, `asymmetric wall accepted: true paths: 1` (narysowane ściany wschodnie 114 → 113), `west-only open accepted: true` (114 → 114). Faza 0 zamienia to w testy w repo.
