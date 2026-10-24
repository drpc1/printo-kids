---
date: 2026-10-23T10:54:01+02:00
researcher: Claude (Opus 5.5) z drpc1
git_commit: c7b447c5b9ed1949c26767bb7fc5654d0d4203e5
branch: claude/symmetry-first-printable-38a510
repository: drpc1/printo-kids
topic: "S-12 symmetry-first-printable: co w kodzie dźwiga kartę symetrii na /symetria i jak ma wyglądać"
tags: [research, symmetry, generator-shell, print, card-catalog, thumbnails]
status: complete
last_updated: 2026-10-23
last_updated_note: "Wzór to szablony obiektów zamiast plam; kolory jako osobny przełącznik (S-15); poziomy przebudowane w PRD"
last_updated_by: Claude (Opus 5.5) z drpc1
---

# Research: S-12 karta symetrii na A4

**Date**: 2026-10-23T10:54:01+02:00
**Researcher**: Claude (Opus 5.5) z drpc1
**Git Commit**: c7b447c (lokalny merge `origin/main` 8e3b2fc do gałęzi; jeszcze niewypchnięty)
**Branch**: claude/symmetry-first-printable-38a510
**Repository**: drpc1/printo-kids

## Research Question

Co w obecnym kodzie można wziąć, a co trzeba dopisać, żeby rodzic wszedł z katalogu na `/symetria`, wygenerował kartę symetrii z jedną sprawdzalną odpowiedzią, zobaczył podgląd i wydrukował ją jako jedną stronę A4, także na telefonie (roadmapa S-12, US-06, FR-015). Jak karta ma wyglądać.

## Decyzje o wyglądzie (użytkownik, 2026-10-23)

Ustalone w rozmowie na makiecie, przed planem:

- **Wzór (zmienione tego samego dnia):** połowa rozpoznawalnego obiektu z katalogu szablonów (np. rakieta, robot, truskawka), z losowanymi wariantami części, dotykająca osi. To zastępuje pierwszą decyzję „kształt rosnący od osi” (przypadkowa spójna plama). PRD US-06 i Business Logic „Karta symetrii” są już zaktualizowane; liczba szablonów to PRD Open Questions 7.
- **Kolory:** osobny przełącznik rodzica, niezależny od poziomu, jako litery w kratkach z legendą; druk zostaje czarny (PRD US-09, FR-018, roadmapa S-15). Nie wchodzi do S-12, ale szablony z S-12 powinny od początku nieść kolor każdej kratki (ryzyko S-15).
- **Poziomy:** poza rozmiarem kratki różnią się położeniem obiektu względem osi, osią i podpowiedzią (PRD tabela poziomów, S-13). S-12 dalej ma jedno stałe ustawienie.
- **Kratki:** pełne, czarne (bez kreskowania).
- **Oś:** gruba, przerywana linia, lekko wystająca poza ramkę kratki.
- **Siatka:** cienkie linie w obu połowach, grubsza ramka całej kratki.
- **Polecenie u góry:** jedno zdanie nad kratką, np. „Dorysuj drugą połowę tak, jak w lustrze”.
- **Ustawienie pierwszej wersji:** jedno stałe, wiersz „5 lat” z PRD (kratka 15 mm, siatka 12×16, oś pionowa, obiekt przy osi, sylwetka bez kolorów) — rekomendacja roadmapy, nie zakwestionowana (`context/foundation/roadmap.md:92`).
- Odpowiedź nigdy nie trafia na wydruk (PRD US-06). Szary podgląd odpowiedzi z makiety nie jest zamówiony.

## Summary

- Powłoka jest gotowa do drugiego rodzaju: `GeneratorShell.astro` przyjmuje tylko `description` i slot (`src/components/GeneratorShell.astro:1-7,41`), daje link „Wszystkie karty” (`:13-35`) i jedyną regułę `@page { size: A4; margin: 0 }` (`:46-49`). Druk ukrywa `h1`, `p`, `a`, `button` i pokazuje każdy `svg` w `#worksheet-home` (`:99-112`), więc kartka symetrii jako `<svg viewBox="0 0 210 297">` wydrukuje się bez nowego CSS.
- Margines 10 mm leży wewnątrz SVG, nie w `@page` (`src/components/WorksheetGenerator.tsx:16-18`; `context/archive/2026-09-29-print-a4-maze/plan.md:23`). Kartka symetrii musi zrobić to samo.
- Polecenie u góry musi być `<text>` w SVG: HTML `<p>` w `#worksheet-home` znika w druku (`GeneratorShell.astro:99-104`).
- Maze-specyficzny jest cały `WorksheetGenerator.tsx` (stan, profil, poziomy, postać) oraz `src/lib/sheet/layout.ts`; roadmapa każe nie rozbijać go warunkami (`roadmap.md:77`). Do skopiowania wzorca nadają się: pasek z `Generuj`/`Drukuj` (`WorksheetGenerator.tsx:191-208`, `ACTION_BUTTON_CLASS` `:24-25`), `window.print()` (`:107`) i klasy SVG (`:363`).
- Wzorzec katalogu: wpis w `CARD_KINDS` (`src/lib/cards.ts:8-10`) plus statyczna miniatura w `public/thumbnails/` z `scripts/build-thumbnails.mjs` (stałe ziarno `:12`, `mulberry32` `:21-30`). Generator symetrii musi więc przyjmować `random: () => number`, tak jak `generateMaze` (`src/lib/maze/generate.ts:22`).
- Dla ustawienia „5 lat” kratka 12×15 = 180 mm na 16×15 = 240 mm mieści się w polu 190×277 mm, z miejscem na polecenie. Wszystkie cztery wiersze tabeli PRD mają parzystą liczbę kolumn i wierszy, więc oś przy tych siatkach biegnie po linii między kratkami. Reguła „nic na osi” jest wtedy spełniona przez konstrukcję, ale i tak musi ją sprawdzić walidator (PRD Business Logic).
- Testy i bramki, które trzeba dopisać: nowy plik w skrypcie `npm test` (`package.json:12`), krok `/symetria` w `scripts/smoke.mjs:14-31`, kontrakt druku dla nowego komponentu (dziś `print-contract.test.ts:29-36,52-70` czyta tylko `WorksheetGenerator.tsx`). Wyrocznia odbicia w teście nie może być kodem, który rysuje kartę (`context/foundation/test-plan.md` ryzyko 7, anty-wzorzec).

## Detailed Findings

### Powłoka i druk

- `@page` jest jeden, w `GeneratorShell.astro:46-49`; test pilnuje dokładnie jednego wystąpienia (`src/lib/sheet/print-contract.test.ts:15-22`) i braku `@page` w `global.css` (`:24-27`).
- W druku: tło `none` na `html, body` i `#worksheet-home` (`GeneratorShell.astro:78-91`, poprawka paska z iOS — `context/archive/2026-10-13-phone-worksheet/manual-checks.md:91`), `max-width: 100%; max-height: 100vh` na `svg` przy marginesach drukarki na iOS (`:106-112`).
- Klasa `has-maze` na `#worksheet-home` steruje ekranowym ściśnięciem nagłówka i ukryciem opisu (`GeneratorShell.astro:51-75`). Przełącza ją efekt w komponencie labiryntu (`WorksheetGenerator.tsx:54-62`, `:59`). Strona symetrii musi albo przełączać tę samą klasę, albo plan zmienia nazwę na ogólną (np. `has-sheet`) — wtedy zmieniają się też asercje `print-contract.test.ts:49,81`.
- Wydruk w druku: `svg` jest jedynym widocznym elementem tylko wtedy, gdy pozostałe kontrolki mają `print:hidden` albo są `button`/`a`/`p` (`GeneratorShell.astro:99-112`). Inna ikona `svg` poza przyciskiem stałaby się `display: block` w druku.

### Komponent labiryntu jako wzorzec

- Generowanie jest synchroniczne na kliknięcie (`WorksheetGenerator.tsx:64-76`), z `Math.random` (`:68`); porażka pokazuje `role="alert"` „Nie udało się ułożyć tego poziomu.” (`:21`, `:158-162`).
- Dwa stany: przed pierwszą kartą duży `Generuj` (`:210-224`), potem pasek (`:178-209`). Na telefonie `Generuj` i `Drukuj` mają `flex-1` w jednym wierszu, od `sm` szerokość treści i `Drukuj` z `sm:ml-auto` (`:196`, `:203`). To spełnia „nie nachodzą na siebie” z US-04 i powinno zostać skopiowane.
- `Drukuj` jest nieaktywny bez karty (`:202`) i woła `window.print()` (`:106-108`).
- Kartka: `<svg viewBox="0 0 210 297">` z klasami `aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0` (`:360-363`), tło `var(--card)` (`:368`), linie i tekst `var(--foreground)` (`:375`, `:387`, `:395`). Tokeny: `--foreground` w jasnym motywie to `oklch(0.329 …)` — prawie czarny, nie czysta czerń (`src/styles/global.css:8`); `--card` biały (`:9`). Czarne kratki symetrii użyją tego samego tokenu (zasada kolorów w AGENTS.md).
- Stałe strony `PAGE_WIDTH/HEIGHT/INSET` są lokalne w komponencie (`WorksheetGenerator.tsx:16-18`) i powtórzone w skrypcie miniatur (`scripts/build-thumbnails.mjs:14-16`); `layout.ts` nie ma wspólnej stałej A4.

### Profil i ostatnie parametry

- `ProfileCorner` jest renderowany wewnątrz `WorksheetGenerator` (`WorksheetGenerator.tsx:5`, `:166`), a nie w powłoce. Klucze `localStorage`: `printo-kids:last-used` (`src/lib/last-used.ts:3`, poziom walidowany jako poziom labiryntu), `printo-kids:active-profile` (`src/lib/active-profile.ts:1`), `printo-kids:child-profiles` (`src/lib/child-profiles.ts:4`).
- Roadmapa: na tej stronie profil i ostatnie parametry nie pamiętają jeszcze niczego własnego (`roadmap.md:93`, S-14). Strona symetrii nie może więc pisać do `printo-kids:last-used`, bo ten zapis ma kształt labiryntu.

### Katalog, miniatury, smoke, e2e

- `CARD_KINDS` ma jeden wpis (`src/lib/cards.ts:8-10`); `CardCatalog.astro` mapuje listę na siatkę 2/3/4 kolumn (`src/components/CardCatalog.astro:5-22`), więc druga miniatura nie wymaga zmiany katalogu.
- Miniatura labiryntu to plik z prawdziwego generatora i układu ze stałym ziarnem (`scripts/build-thumbnails.mjs:1-2,12,37-56,79-81`); skrypt `npm run thumbnails` (`package.json:15`). Miniatura symetrii powinna powstać tak samo (np. drugi plik wyjściowy `public/thumbnails/symetria.svg`).
- `scripts/smoke.mjs:14-31` sprawdza `/` i `/labirynt` po zdaniu z opisu (`:5-6`); dla `/symetria` dochodzi krok z jej zdaniem `description`. CI czeka na `/` i uruchamia smoke (`.github/workflows/ci.yml:38-39`).
- e2e (lokalnie, nie w CI — `test-plan.md`): `tests/e2e/catalog.spec.ts` przechodzi katalog → Labirynt → z powrotem (`:11-18`, `:46-52`). Analogiczny przebieg dla „Symetria” to naturalne rozszerzenie.
- `labirynt.astro` ma `<title>PrintoKids</title>` jak `/` (`src/pages/labirynt.astro:7`); przegląd F-03 odłożył zdublowany tytuł i zauważył, że S-12 doda trzecią stronę (`context/archive/2026-10-22-card-catalog-home/reviews/impl-review-phase-3.md:53`).

### Geometria kartki „5 lat”

Pole wewnątrz marginesu: 210 − 2·10 = 190 mm na 297 − 2·10 = 277 mm. Kratka 15 mm, 12 kolumn × 16 wierszy → 180 × 240 mm. Zostaje 37 mm w pionie na polecenie (tekst 7 mm, jak `SHEET_LABEL_SIZE` w `WorksheetGenerator.tsx:20`) i odstęp. Dla pozostałych wierszy PRD (S-13): 8×12 po 20 mm = 160×240, 14×20 po 12 mm = 168×240, 18×24 po 10 mm = 180×240 — każdy mieści się w 190×277 przy tym samym pasie polecenia. To arytmetyka na wartościach z tabeli PRD, nie test.

## Code References

- `src/components/GeneratorShell.astro:46-49` — jedyny `@page`
- `src/components/GeneratorShell.astro:51-75` — ekranowe reguły `.has-maze`
- `src/components/GeneratorShell.astro:77-113` — reguły druku
- `src/components/WorksheetGenerator.tsx:54-62` — przełączanie `has-maze`
- `src/components/WorksheetGenerator.tsx:178-224` — pasek i duży przycisk
- `src/components/WorksheetGenerator.tsx:339-402` — `MazeSheet`, wzorzec SVG kartki
- `src/lib/sheet/print-contract.test.ts:29-70` — kontrakt druku przywiązany do `WorksheetGenerator.tsx`
- `src/lib/cards.ts:8-10` — lista rodzajów kart
- `scripts/build-thumbnails.mjs:12-30` — stałe ziarno i PRNG miniatur
- `scripts/smoke.mjs:14-31` — kroki sprawdzianu HTTP
- `package.json:12` — lista plików `npm test`

## Architecture Insights

- Jeden rodzaj karty = strona Astro + własna wyspa React w `GeneratorShell` + wpis w `CARD_KINDS` + miniatura. Wspólne są tylko powłoka i reguły druku (`roadmap.md:77`).
- Czysta logika w `src/lib/<rodzaj>/` z wstrzykniętym `random` (jak `src/lib/maze/`), testowana runnerem Node; komponent tylko rysuje. Pasuje do wymogu roadmapy, by odpowiedź była wyliczona i sprawdzona tą samą funkcją przed pokazaniem i w testach (`roadmap.md:93`), przy czym wyrocznia testu ma być niezależna od kodu rysującego (test-plan, ryzyko 7).

## Historical Context (from prior changes)

- `context/archive/2026-09-29-print-a4-maze/plan.md:23` — 10 mm to wcięcie SVG; drugi margines na `@page` zmniejszyłby kartkę. Nadal aktualne (`GeneratorShell.astro:48`).
- `context/archive/2026-10-05-print-sheet-contract/plan.md:166,176` — inne przeglądarki sprawdzane ręcznie po zielonym Chrome, bez arkuszy per przeglądarka jako pierwszej poprawki.
- `context/archive/2026-10-13-phone-worksheet/plan-brief.md:27,73` — osobno klikalne `Generuj`/`Drukuj`, brak przewijania w bok od 360 px.
- `context/archive/2026-10-18-touch-targets/research.md:48-50` — 44 px z `ACTION_BUTTON_CLASS` poniżej `sm`.
- `context/archive/2026-10-22-card-catalog-home/plan.md:26,32-33` — id `worksheet-home` zostaje, żeby S-12 użyła powłoki; strona i miniatura symetrii odłożone do S-12.

## Related Research

- `context/changes/print-printer-margins/change.md` (status `new`) — marginesy drukarki na iOS dodają się do 10 mm; jego plan może zmienić wspólną geometrię lub reguły druku powłoki. Ryzyko kolizji z S-12, jeśli oba ruszą `GeneratorShell.astro` naraz.
- `context/changes/print-browser-coverage/change.md` (status `new`) — tylko ręczne sprawdziany przeglądarek; po S-12 obejmie też kartę symetrii.

## Open Questions

1. **Profil w rogu na `/symetria`.** US-05 mówi o tym samym układzie z profilem w rogu i o zachowaniu wybranego profilu między stronami, a S-12 mówi, że strona nie pamięta jeszcze nic własnego. `ProfileCorner` żyje dziś w komponencie labiryntu i zapisuje poziomy labiryntu. Do rozstrzygnięcia w planie: pokazać sam wybór profilu (bez zapisu poziomu) czy nie pokazywać profilu do S-14.
2. **`has-maze` czy ogólna nazwa klasy** — patrz „Powłoka i druk”. Decyzja planu.
3. ~~Algorytm „kształtu od osi”~~ — zastąpione 2026-10-23. Teraz: **format szablonu obiektu** (połowa na siatce 6×16 przy „5 lat”, kolor każdej kratki od początku pod S-15, części z wariantami) i jak walidator sprawdza, że wariant dotyka osi i mieści się w połowie. Do zaprojektowania w planie.
4. **Tytuł strony** — `<title>` zostaje „PrintoKids” czy dostaje nazwę rodzaju (odłożone F3 z F-03).
