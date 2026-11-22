# „Skopiuj obrazek” z kształtami dyktanda (S-55) — Plan Brief

> Full plan: `context/changes/copy-drawing-asymmetric-shapes/plan.md`
> Makieta: `context/changes/copy-drawing-asymmetric-shapes/mockup.mts` → `mockup-colors.json`

## What & Why

Karta „Skopiuj obrazek” dostaje oprócz obiektów z szablonów symetrii także niesymetryczne kształty z katalogu dyktanda (np. skarpeta, ryba, dinozaur): więcej różnych kart, a karta i tak nie ma osi, więc symetria nie jest potrzebna (S-55, GitHub drpc1/printo-kids#379; PRD US-27, US-28, FR-037).

## Starting Point

Karta zna tylko szablon: `templateId` i `variants`, klucz `level:templateId:variants`, sprawdzenie i kolory odbudowują sylwetkę z szablonu (`src/lib/copy-drawing/card.ts`, `generate.ts`, `colors.ts`). Kształty dyktanda to czarne bitmapy `#`/`.` w `src/lib/dictation/shapes.ts`, bez kolorów.

## Desired End State

Generuj na każdym poziomie i w każdej kategorii daje szablon albo jeden z 15 kształtów (bez klucza poziomego), także odbity. Z kolorami kształt ma kolorowy rysunek z makiety. Dyktando rysuje pięć nowych rysunków (renifer, ciężarówka, helikopter średni, dinozaur, skarpeta) i działa jak dotąd.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Które kształty | 15 z 16, bez klucza poziomego | Decyzja użytkowniczki po makiecie; klucz zostaje w dyktandzie | Makieta 2026-11-21 |
| Kolory kształtu | Litera kredki w każdej kratce bitmapy (`r g y b o s k n`), dziury białe | Jak szablony symetrii; jedno źródło rysunku dla dyktanda i karty | Makieta / Plan |
| Nowe rysunki | Pięć kształtów przerysowanych, wspólnych z dyktandem | Lepsze proporcje; przechodzą reguły obrysu dyktanda prosto i odbite | Makieta |
| Losowanie | Każdy obiekt (szablon albo kształt) ma równą szansę, potem wariant albo odbicie | Odpowiedź użytkowniczki przy planowaniu | Plan |
| Odbicie | Kształt może wypaść odbity w poziomie, jak w dyktandzie | Odpowiedź użytkowniczki przy planowaniu; więcej różnych kart | Plan |
| Model karty | Dyskryminowane pole `picture` (szablon albo kształt) | Jedno miejsce buduje wzór i kolory dla generatora, sprawdzenia i rysunku | Plan |
| Klucz | Szablon jak dziś, kształt z własnym znacznikiem (`level:ksztalt:id:prosty/odbity`) | Karty szablonów się nie zmieniają, a klucze się nie pokrywają | Plan |
| Poziomy | `latwy/sredni/trudny` ↔ `lat5/lat6/lat7` | Rysunki tych poziomów mieszczą się w siatkach 8×12, 12×15, 18×24 | Plan |
| Wyłączenie klucza | Pole `onCopyDrawing` na każdym kształcie | Jawna decyzja przy każdym nowym kształcie | Plan |

## Scope

**In scope:**

- Litery kredek i nowe rysunki w `src/lib/dictation/shapes.ts`, wspólny odczyt liter z `template-format.ts`
- `picture` na karcie, generator, sprawdzenie, kolory, silnik i testy „Skopiuj obrazek”
- Wąski Stryker na zmienionych zakresach, przebudowa miniatur (`dyktando.svg`, `kopiuj.svg`)
- Wydruk próbny na iOS i e2e karty

**Out of scope:**

- Klucz poziomy na karcie, kolory w dyktandzie
- Układ kartki, pasek, ustawienia karty, opis w `CARD_KINDS`, „Jak to działa”
- Aktualizacja `test-plan.md` (S-51), commit `preview.html`

## Architecture / Approach

Kształty dyktanda mają jedną bitmapę z literami kredek: dyktando czyta każdą literę jako kratkę obrysu, a karta „Skopiuj obrazek” bierze z niej i czarny wzór, i kolory. Karta nazywa obrazek polem `picture`; jedna funkcja odbija kształt, wstawia go w siatkę poziomu z wyśrodkowaniem w poziomie i `centerSilhouette` w pionie, a generator, `copyDrawingProblems` i `copyDrawingCellColors` z niej korzystają, więc wzór i kolory nie mogą się rozjechać.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Kolorowe kształty dyktanda | Litery kredek, pięć nowych rysunków, `onCopyDrawing`; dyktando bez zmian zachowania | Błąd przy przepisywaniu bitmap z JSON-a psuje obrys dyktanda |
| 2. Kształty na karcie „Skopiuj obrazek” | `picture`, losowanie z obu katalogów, kolory i sprawdzenie kształtu, testy, Stryker, miniatura | Przesunięcie kolorów inne niż wzoru; klucz kształtu pokrywa się z kluczem szablonu |
| 3. Wydruk próbny i staging | Wydruk na iOS, dyktando z nowymi rysunkami, e2e | Kolory na kratce 5 mm nieczytelne na papierze |

**Prerequisites:** zatwierdzona makieta (`mockup-colors.json`), PRD, glosariusz i roadmapa zaktualizowane w tym worktree (do commita z fazą 1).
**Estimated effort:** ~2–3 sesje: faza 1 mała, faza 2 główna, faza 3 ręczna.

Każda faza kończy się bramkami `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` i `/10x-impl-review copy-drawing-asymmetric-shapes` przed PR-em fazy.

## Open Risks & Assumptions

- Miniatury z ziarnem mogą wyjść inne (dyktando po fazie 1, karta po fazie 2); zostają, jeśli są czytelne, bez zmiany ziarna.
- Czytelność kolorów i odbitych kształtów na trudnym (kratka 5 mm) potwierdza dopiero wydruk w fazie 3.
- Równa szansa obiektu oznacza, że w „Wszystkie” obok 40 obiektów szablonów stoi 8 kształtów na łatwym, 14 na średnim i 15 na trudnym; kategorie z wieloma kształtami (Kosmos i maszyny, Boże Narodzenie) zmieniają się najbardziej.

## Success Criteria (Summary)

- Rodzic dostaje na „Skopiuj obrazek” kształty dyktanda w każdej kategorii i na każdym poziomie, czarne albo w kolorach z makiety, także odbite, a każda karta drukuje się jako jedna strona A4.
- Dyktando działa jak dotąd, z nowymi rysunkami pięciu kształtów.
