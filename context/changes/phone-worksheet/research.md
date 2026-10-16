---
date: 2026-10-13
researcher: Claude (Sonnet 5.5)
git_commit: 791d20e
branch: claude/pierwsze-zadanie
repository: printo-kids (drpc1/printo-kids)
topic: "Co psuje się na telefonie na stronie karty (S-09 phone-worksheet) i jak działa druk A4"
tags: [research, codebase, phone-worksheet, WorksheetGenerator, WorksheetHome, layout, print]
status: partial
last_updated: 2026-10-13
last_updated_by: Claude (Sonnet 5.5)
---

# Research: Co psuje się na telefonie na stronie karty i jak działa druk A4

**Date**: 2026-10-13
**Researcher**: Claude (Sonnet 5.5)
**Git Commit**: 791d20e (worktree, commitowany stan; bez niezacommitowanej pracy z Cursora)
**Branch**: claude/pierwsze-zadanie
**Repository**: printo-kids

## Research Question

Roadmapa (S-09) zostawia otwarte pytanie: co jeszcze na stronie psuje się na telefonie poza nachodzącymi się przyciskami i labiryntem większym niż jedna strona A4? Jak karta jest wymiarowana i drukowana oraz co z tego pokrywają testy (US-04, FR-004, FR-005, FR-013)?

## Summary

**Status: partial.** Wszystkie wnioski o wyglądzie na telefonie to rachunek z kodu (klasy Tailwind, CSS), a nie pomiar. Nie uruchamiałem aplikacji, przeglądarki ani testów (powłoka była w tej sesji zablokowana). Szerokości przycisków są szacunkiem.

1. **Najpoważniejsza usterka (kod ją potwierdza):** po wygenerowaniu labiryntu pasek ma trzy elementy w jednym rzędzie bez zawijania (`WorksheetGenerator.tsx:134-154`), a oba przyciski mają `px-12` (`:150`, `:188`) i bazowo `whitespace-nowrap shrink-0` (`button.tsx:8`, wg przeglądu klas). Szacunek: ok. 500 px treści na ok. 342 px dostępnych przy ekranie 390 px (390 px minus `px-6`). To zgadza się z opisem usterki w PRD i roadmapie.
2. **Przycisk profilu jest `fixed top-4 right-4 z-40`** (`WorksheetGenerator.tsx:487`) i może leżeć nad nagłówkiem i podglądem karty podczas przewijania. Nie zweryfikowane w przeglądarce.
3. **Podgląd karty** to jedno SVG z `viewBox`, więc mieści się w szerokości (`:793-801`). Wysokość karty (ok. 484 px przy 342 px szerokości, szacunek) jest większa niż wolne miejsce nad pierwszym ekranem, więc trzeba przewijać.
4. **Znak postaci wychodzi w margines 10 mm** dla poziomu domyślnego `lat5` z wybraną postacią: górna krawędź znaku wypada na ok. y = 1,6 mm (rachunek poniżej). Test sprawdza tylko `mark.y >= 0`.
5. **Żaden test nie dotyka szerokości okna ani telefonu.** Playwright ma jeden projekt, `Desktop Chrome`.

## Detailed Findings

### Pasek Generuj / Drukuj (stan po wygenerowaniu)

- Kontener: `flex w-full items-center justify-between gap-4 print:hidden`, bez `flex-wrap` ani wariantu `sm:` (`WorksheetGenerator.tsx:134`). Wewnątrz: lewa grupa `flex min-w-0 items-center gap-3` z przyciskiem wyboru postaci i „Generuj” (`:135-145`) oraz osobno „Drukuj” (`:146-153`).
- „Generuj” i „Drukuj” mają po `h-auto rounded-full px-12 py-3.5 text-lg` (`:150`, `:188`). Same paddingi poziomo to 96 px na przycisk.
- `min-w-0` na lewej grupie zwęża tylko kontener. Czy przyciski faktycznie nachodzą na siebie, czy wychodzą poza ekran, zależy od przeglądarki (niezweryfikowane).
- Stan początkowy (przed pierwszym generowaniem) to układ kolumnowy `flex flex-col items-center gap-6` (`:156`), więc tam nachodzenia nie ma.
- Wniosek dla planu: usterka jest wyłącznie w stanie `hasMaze === true`.

### Przycisk profilu w rogu

- `fixed top-4 right-4 z-40 h-auto max-w-48 px-2 py-1 ... print:hidden` (`WorksheetGenerator.tsx:487`). Max szerokość 192 px.
- Po wygenerowaniu `#worksheet-home.has-maze` ma `padding-top: 2rem` i `h1` o rozmiarze 1.5rem (`WorksheetHome.astro:27-39`), więc przycisk (górny odstęp 16 px) i nagłówek są w tej samej strefie pionowej. Czy się zasłaniają, zależy od długości imienia profilu (niezweryfikowane).
- Podczas przewijania przycisk zostaje przyklejony i może leżeć nad kartą.

### Okna dialogowe: profile i lista postaci

- Oba `DialogContent` mają `max-h-[calc(100dvh-2rem)] overflow-y-auto` (`WorksheetGenerator.tsx:494`, `:712`). Lista nie jest więc trwale ucięta, tylko przewijana.
- Lista 11 postaci to kolumna wierszy z obrazkiem 40 px (`:739`, `:767`). Szacunek łącznej wysokości z paddingiem to ok. 740 px, więcej niż wysokość niskiego okna (np. poziomo). Przewijanie ratuje sytuację, ale bez wskazówki, że lista się przewija.
- Bazowy `dialog.tsx` ma `max-w-[calc(100%-2rem)]` na wąskim ekranie (wg przeglądu klas). Stopki dialogów przechodzą na `flex-col-reverse` na telefonie. To wygląda poprawnie.
- Niepewne: zachowanie `dvh` przy klawiaturze ekranowej (pole imienia).

### Strona i viewport

- `Layout.astro:16`: `<meta name="viewport" content="width=device-width" />`, bez `initial-scale=1`. Zwykle wystarcza na współczesnych telefonach, ale nie jest nigdzie omówione ani testowane.
- `WorksheetHome.astro:7`: `min-h-screen` (`100vh`, nie `dvh`) i `px-6 py-20`. Na telefonie z paskiem adresu `100vh` bywa wyższe niż widoczny obszar. Dotyczy układu przed generowaniem (`justify-center`).
- Responsywne klasy w tym pliku to tylko `sm:text-5xl` i `sm:text-xl` (`WorksheetHome.astro:10`, `:12`). Pasek akcji nie ma wariantu pod telefon.
- Nagłówek `h1` nie jest `sticky` ani `fixed` (`WorksheetHome.astro:10`).

### Wymiarowanie karty i druk

- `layoutSheet` liczy wszystko w mm: `cellSize = (210 − 2·inset)/columns`, `labelBand = (innerHeight − gridHeight)/2` (`src/lib/sheet/layout.ts:40-47`). Ramka siatki mieści się w insecie 10 mm z czterech stron dla wszystkich poziomów (to potwierdza `layout.test.ts`, wg przeglądu testów).
- Podgląd: `<svg viewBox>` z `aspect-[210/297] h-auto w-full` (`WorksheetGenerator.tsx:793-797`), skalowanie bez `transform`. Dzięki temu karta mieści się w szerokości na telefonie.
- Druk: `handlePrint` = `window.print()` (`:91-93`). `@page { size: A4; margin: 0 }` w `WorksheetHome.astro:21-24`. W `@media print` ukryte `h1`, `p`, `button`, a SVG ma `print:w-[210mm] print:h-[297mm] print:overflow-hidden` (`WorksheetGenerator.tsx:797`; `WorksheetHome.astro:46-75`).
- Ryzyko: SVG ma dokładnie 297 mm przy `@page A4` i `margin: 0`. Zachowanie mobilnego Chrome, Firefoksa, Safari i Edge przy takiej konfiguracji nie jest w kodzie ani notatkach potwierdzone. `test-plan.md` zostawia ręczny podgląd tylko dla Chrome i Edge na desktopie (wg przeglądu, linia 95).

### Znak postaci a margines 10 mm (rachunek)

Dla `lat5` (siatka 13×16), przy wybranej postaci, inset 10, strona 210×297, `markSize` 30 (wg `layout.ts:38-64`):

- `cellSize = 190/13 ≈ 14,615`, `gridHeight = 16 · 14,615 ≈ 233,8`, `labelBand = (277 − 233,8)/2 ≈ 21,6`.
- `originY = 10 + 21,6 = 31,6`, `mark.y = originY − 30 = 1,6`.
- Znak stoi więc w pasie, który ma być marginesem, a test `layout.test.ts:50` sprawdza tylko `mark.y >= 0`. Wcześniejszy impl-review (`context/archive/2026-10-04-maze-character-choice/reviews/impl-review.md:38`) też to odnotował (wg przeglądu).
- To nie dotyczy ścian labiryntu, tylko znaku. Czy łamie to US-04 („labirynt zachowuje margines co najmniej 10 mm”), zależy od interpretacji: ściany labiryntu czy cała zawartość karty. Decyzja produktowa.

### Testy

- `layout.test.ts`: arytmetyka mm. Brak asercji o szerokości okna i kolizji przycisków.
- `print-contract.test.ts`: testy tekstowe na plikach (istnienie `@page`, klasy `print:*`, ukrywanie elementów w druku). Nie sprawdza układu paska ani widoku mobilnego.
- `tests/e2e/seed.spec.ts` (jedyny test przeglądarkowy): klika Generuj, widzi „Labirynt”, Start i Meta. Komentarz w pliku mówi, że nie dowodzi jednej wydrukowanej strony.
- `playwright.config.ts:26-31`: jeden projekt `chromium` z `Desktop Chrome`, bez emulacji telefonu.

### Pomiar na żywo (dopisane 2026-10-13, okno 375x812, `npm run dev`, commit 791d20e)

Warunki: wbudowana przeglądarka z emulacją telefonu 375x812, jedna próba, poziom tymczasowo przestawiony na `lat6` (patrz niżej; zmiana cofnięta, `git diff` pusty). Pomiar `getBoundingClientRect` po wygenerowaniu labiryntu:

- **Przyciski nachodzą na siebie (potwierdzone):** „Generuj” zajmuje x = 221-384, a „Drukuj” x = 199-351, czyli „Drukuj” zakrywa „Generuj” na ok. 130 px szerokości. Pasek postaci x = 24-209 też nachodzi na „Drukuj”. Na zrzucie widać tylko „Drukuj”.
- **Poziomy overflow strony (potwierdzone):** `scrollWidth` = 384 przy `innerWidth` = 375 (9 px poza ekranem). Prawy brzeg „Generuj” (384) wychodzi poza ekran.
- **Karta mieści się w szerokości:** SVG x = 24-351 (327 px), wysokość 463 px, początek 161 px od góry.
- **Przycisk profilu i nagłówek:** „Profil” x = 314-368, y = 16-48; `h1` x = 133-242, y = 32-64. Dla tej nazwy nie nachodzą poziomo. Dłuższe imię profilu nie było sprawdzane.
- **Przed generowaniem** (kolumna): nic nie nachodzi, `scrollWidth` = 375.

### Znalezisko poza zakresem S-09: Generuj nic nie robi na poziomie domyślnym

- Na commicie 791d20e `mazeForSheet(generateMaze(id, Math.random), id)` zwraca `null` dla `lat5` (domyślny, `levels.ts:1`) i `nastolatek` w 0 z 20 prób. Dla `lat3`, `lat4`, `lat6`, `lat7` wynik to 20 z 20 (jedna seria pomiarów w przeglądarce).
- `handleGenerate` przy `null` nic nie robi (`WorksheetGenerator.tsx:86-88`), więc kliknięcie „Generuj” po cichu nie zmienia strony i nie ma błędu w konsoli. To dokładnie opis zmiany `silent-generate-click` (status `preparing`).
- Warunki `lat5`: `pathMin` 56, `pathMax` 96, `spurMax` 4 (zmierzone z `levelById('lat5')`). Który warunek odrzuca labirynt, nie sprawdzano.
- Hipoteza, niezweryfikowana: poprawka jest w niezacommitowanej pracy nad generatorem w głównym folderze (`generate.ts`). Tego pliku nie czytałem.
- Skutek dla S-09: na `main` w stanie 791d20e nie da się obejrzeć paska Generuj/Drukuj na domyślnym poziomie, więc test telefonu wymaga najpierw działającego generatora.

## Code References

- `src/components/WorksheetGenerator.tsx:134-154` - pasek Postać / Generuj / Drukuj po wygenerowaniu (bez zawijania)
- `src/components/WorksheetGenerator.tsx:150`, `:188` - `px-12 py-3.5 text-lg` na Drukuj i Generuj
- `src/components/WorksheetGenerator.tsx:156` - układ kolumnowy przed generowaniem
- `src/components/WorksheetGenerator.tsx:487` - przycisk profilu `fixed top-4 right-4 z-40`
- `src/components/WorksheetGenerator.tsx:494`, `:712` - `DialogContent` z `max-h-[calc(100dvh-2rem)] overflow-y-auto`
- `src/components/WorksheetGenerator.tsx:793-801` - SVG karty z `viewBox` i klasami druku
- `src/components/WorksheetHome.astro:7`, `:10`, `:12` - `min-h-screen`, `px-6 py-20`, jedyne warianty `sm:`
- `src/components/WorksheetHome.astro:21-24`, `:46-75` - `@page` i `@media print`
- `src/layouts/Layout.astro:16` - meta viewport
- `src/lib/sheet/layout.ts:38-75` - `layoutSheet`
- `playwright.config.ts:26-31` - jedyny projekt Playwright

## Architecture Insights

- Karta jest rysowana w jednostkach strony (mm w `viewBox`), więc skala na ekranie i w druku wynika z szerokości kontenera i klas `print:`. Naprawa telefonu leży w układzie wokół karty (pasek akcji, przycisk profilu, nagłówek), a nie w geometrii labiryntu.
- `@page` ma zostać w `WorksheetHome.astro` (`AGENTS.md`), a kolory z tokenów. Nowe elementy mają używać `cn()` i kontrolek z `src/components/ui`.
- JS przełącza klasy na `#worksheet-home` z poziomu React (`WorksheetGenerator.tsx:69-78`), więc układ strony i komponentu są sprzężone przez `.has-maze`.

## Historical Context (from prior changes)

- `context/foundation/roadmap.md:215-227` - S-09 `ready`, zależy tylko od S-02, równolegle z S-07 i S-08; dwa pytania otwarte (przeglądarki mobilne, co jeszcze się psuje), oba bez blokady.
- `context/foundation/prd.md:95-108` (US-04) i FR-013 - wymagania telefonu.
- `context/changes/maze-difficulty-levels/plan.md:44`, `plan-brief.md:38,58` - świadome odłożenie telefonu do S-09, bez zmian insetu i `@page`.
- `context/archive/2026-10-05-print-sheet-contract/plan.md:35` - wyłączenie Playwrighta i snapshotów pikseli z testu kontraktu wydruku. `test-plan.md:137` - ręczny podgląd w czterech przeglądarkach zostaje ręczny.

## Related Research

Brak research.md dla S-09. `context/changes/maze-difficulty-levels/research.md:64` zaznacza, że rachunek insetu jest wyliczeniem z `layout.ts`, a nie pomiarem w Chrome ani na telefonie.

## Open Questions

1. ~~Pomiar na żywo~~ Rozstrzygnięte: przyciski nachodzą na siebie, a strona ma poziomy overflow o 9 px (sekcja „Pomiar na żywo”).
1a. **Generator na poziomie domyślnym:** czy poprawka z niezacommitowanej pracy w Cursorze wejdzie przed S-09? Od tego zależy, jak S-09 jest testowany.
2. **Druk z telefonu:** jak mobilne Chrome, Firefox, Safari i Edge obsługują `@page { size: A4; margin: 0 }` i 297 mm? Ręczne sprawdzenie, nie do wyczytania z kodu.
3. **Znak postaci w marginesie:** czy „margines 10 mm” obejmuje znak postaci? Decyzja produktowa (właściciel: użytkownik).
4. **Zakres przeglądarek mobilnych:** roadmapa rekomenduje Chrome, Edge, Firefox i Safari. Wymaga potwierdzenia przez użytkownika.
5. **Konflikty z pracą w Cursorze:** niezacommitowane zmiany w `WorksheetGenerator.tsx` w głównym folderze nie są częścią tego research. Numery linii tutaj pochodzą z commitowanego stanu `791d20e` i mogą się różnić po scaleniu.
