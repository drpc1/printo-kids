# Ręczne sprawdzenia: strona karty na telefonie (S-09, faza 6)

> Plan: `context/changes/phone-worksheet/plan.md` (Faza 6). Wersja: `main` po scaleniu drpc1/printo-kids#33 (`2605e3d`), strona produkcyjna albo `npm run preview`.
>
> Wpis w komórce: `ok`, `błąd: <opis>` albo `nie sprawdzono: <powód>`. `—` znaczy, że kryterium nie dotyczy tej przeglądarki.

## Jak drukować

- **Komputer:** Generuj → Drukuj (albo Ctrl+P / Cmd+P). Marginesy: domyślne. Nagłówki i stopki: wyłączone. Rozmiar papieru: A4. Zapis do PDF wystarczy.
- **Android (Chrome, Edge, Brave):** Drukuj na stronie → systemowe okno druku → drukarka „Zapisz jako PDF”, papier A4.
- **Android (Firefox):** Drukuj na stronie albo menu ⋮ → Drukuj → „Zapisz jako PDF”, papier A4.
- **iOS (Safari, Chrome, Brave):** Drukuj na stronie → okno druku iOS. Podgląd: rozsuń palcami miniaturę strony, potem Udostępnij → Zapisz w Plikach, żeby mieć PDF.

## Kryteria druku

1. **Jedna strona:** podgląd lub PDF ma dokładnie jedną stronę A4.
2. **Nieobcięty:** cały labirynt jest na stronie, łącznie z „Meta” i startem.
3. **10 mm:** co najmniej 10 mm białego pasa między krawędzią kartki a ścianami i ramką labiryntu. Znak postaci może wejść w ten pas (PRD, US-04).
4. **Fakty kartki:** „Meta” przy wyjściu, wybrana postać przy starcie. Na kartce nie ma paska, przycisków ani nagłówka.

## Kryteria układu (tylko telefon)

5. **Przyciski:** Generuj i Drukuj są osobno klikalne i nie nachodzą na siebie.
6. **Bez przewijania w bok:** strony nie da się przesunąć w poziomie, przed generowaniem i po nim.
7. **Profil:** przycisk Profil (także z długim imieniem) nie zasłania nagłówka, a po przewinięciu nie leży nad kartą, pionowo i poziomo.
8. **Pasek adresu:** strona przed generowaniem nie przewija się w pionie przy widocznym pasku adresu (`min-h-dvh`).

## Druk

| Platforma        | Przeglądarka | 1. Jedna strona                   | 2. Nieobcięty                     | 3. 10 mm                               | 4. Fakty kartki                                                    | Uwagi                                                                                                                         |
| ---------------- | ------------ | --------------------------------- | --------------------------------- | -------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Komputer         | Chrome       | ok                                | ok                                | ok                                     | ok                                                                 | 2026-10-20, użytkowniczka                                                                                                     |
| Komputer         | Edge         | ok                                | ok                                | ok                                     | ok                                                                 | 2026-10-20, użytkowniczka                                                                                                     |
| Komputer         | Brave        | ok                                | ok                                | ok                                     | ok                                                                 | 2026-10-20, użytkowniczka                                                                                                     |
| Komputer         | Firefox      | nie sprawdzono: poza archiwizacją | nie sprawdzono: poza archiwizacją | nie sprawdzono: poza archiwizacją      | nie sprawdzono: poza archiwizacją                                  | 2026-10-20                                                                                                                    |
| Komputer (macOS) | Safari       | nie sprawdzono: brak Maca         | nie sprawdzono: brak Maca         | nie sprawdzono: brak Maca              | nie sprawdzono: brak Maca                                          | 2026-10-20                                                                                                                    |
| Android          | Chrome       | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia        | nie sprawdzono: brak urządzenia                                    | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku)                                           |
| Android          | Edge         | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia        | nie sprawdzono: brak urządzenia                                    | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku)                                           |
| Android          | Brave        | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia        | nie sprawdzono: brak urządzenia                                    | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku)                                           |
| Android          | Firefox      | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia   | nie sprawdzono: brak urządzenia        | nie sprawdzono: brak urządzenia                                    | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku)                                           |
| iOS              | Safari       | ok                                | ok                                | ok (szerszy, patrz Znane ograniczenia) | ok (adres i numer strony dokłada Safari, patrz Znane ograniczenia) | 2026-10-20 błąd: beżowe pasy tła strony → poprawka w `@media print` (e8e062d); 2026-10-21 powtórzone: jedna strona, bez pasów |
| iOS              | Chrome       | ok                                | ok                                | ok (szerszy, patrz Znane ograniczenia) | ok                                                                 | 2026-10-20, użytkowniczka                                                                                                     |
| iOS              | Brave        | ok                                | ok                                | ok (szerszy, patrz Znane ograniczenia) | ok                                                                 | 2026-10-20, użytkowniczka                                                                                                     |

## Układ na telefonie

Na iOS Chrome i Brave używają silnika Safari, więc układ sprawdzamy tylko w Safari.

| Platforma | Przeglądarka | 5. Przyciski                    | 6. Bez przewijania w bok        | 7. Profil (pion / poziom)       | 8. Pasek adresu                 | Uwagi                                                                               |
| --------- | ------------ | ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| Android   | Chrome       | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku) |
| Android   | Edge         | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku) |
| Android   | Brave        | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku) |
| Android   | Firefox      | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | nie sprawdzono: brak urządzenia | 2026-10-20; emulacja: Playwright phone-360 i pixel-7 (bez paska adresu i bez druku) |
| iOS       | Safari       | ok                              | ok                              | ok / ok                         | ok                              | 2026-10-20, użytkowniczka                                                           |

## Dialogi na telefonie

| Platforma | Przeglądarka | Pole imienia widoczne nad klawiaturą | Lista postaci przewija się do wszystkich 11 i „Bez postaci” | Widoczny pasek przewijania przy liście profili (≥ 12 profili) i liście postaci | Uwagi                                                                    |
| --------- | ------------ | ------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Android   | Chrome       | nie sprawdzono: brak urządzenia      | nie sprawdzono: brak urządzenia                             | nie sprawdzono: brak urządzenia                                                | 2026-10-20                                                               |
| iOS       | Safari       | ok                                   | ok                                                          | ok                                                                             | 2026-10-20, użytkowniczka; pasek przewijania potwierdzony też 2026-10-18 |

## Automatyczny przebieg iPhone (WebKit)

| Data       | Przebieg                                                      | Wynik                                                               |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| 2026-10-16 | https://github.com/drpc1/printo-kids/actions/runs/38886623006 | ok: 19 passed, 1 skipped (desktop z myszą), w tym 4 testy iphone-13 |

## Znane ograniczenia

Błąd druku, którego nie da się naprawić w `@media print` w `src/components/WorksheetHome.astro` bez zmiany `@page` ani geometrii karty, wpisujemy tutaj z nazwą nowej zmiany (`/10x-new`).

- 2026-10-16, iOS (Chrome): wydruk na jednej stronie, ale z szerokim białym pasem (szacunek dla Letter: ok. 26 mm z boków, 35–40 mm u góry i u dołu). Przyczyna: margines drukarki iOS nakłada się na własny margines karty 10 mm. Usunięcie wymaga zmiany geometrii karty, poza S-09 → nowa zmiana `context/changes/print-printer-margins/`.
- 2026-10-20, iOS (Safari): Safari dokłada w marginesie drukarki adres strony i numer strony. CSS ich nie wyłącza, a okno druku iOS nie ma takiej opcji → dopisane do `context/changes/print-printer-margins/`.
- 2026-10-20, Android (Chrome, Edge, Brave, Firefox) oraz komputer Firefox i Safari (macOS): nie sprawdzono przed archiwizacją S-09. Układ Androida pokrywa emulacja Playwright (`phone-360`, `pixel-7`, `tablet-768`), druku i klawiatury ekranowej nie → nowa zmiana `context/changes/print-browser-coverage/`.

## Otwarte

- (brak)

## Poprawki w trakcie fazy 6

- 2026-10-16: druk na iOS (Chrome) na dwie strony → karta zmniejsza się do obszaru druku. **Powtórzyć druk na iOS w Safari, Chrome i Brave.**
- 2026-10-16: niewidoczne przewijanie listy profili → cień przy krawędzi w oknie profili i na liście postaci.
- 2026-10-16: cień był za słaby na beżowym tle → kolor `--primary` (zielony) z kryciem 55%, wysokość 20 px.
- 2026-10-16: na iPhonie cienia nadal nie było widać (iOS nie obsługuje `background-attachment: local` w przewijanym oknie) → hook `useScrollEdges` ustawia `data-more-above` / `data-more-below`, a `scroll-shadow` rysuje wewnętrzny `box-shadow`. Test Playwright sprawdza atrybuty, także na WebKit w workflow.
- 2026-10-16: kolor cienia bez `color-mix()` (`--scroll-edge: var(--primary)`), na wypadek iOS starszego niż 16.2.
- 2026-10-16: po scaleniu drpc1/printo-kids#34 przewija się środek okna w `ui/dialog.tsx`, więc cień i hook są tam (wszystkie okna). Przegląd fazy 6: odstęp `-m-1 p-1` dla obwódek fokusu, hook obserwuje też rozmiar dzieci.
- 2026-10-18: cień był widoczny na iPhonie, ale użytkowniczka woli zamiast niego widoczny pasek przewijania → własna szyna z suwakiem (`--muted` / `--muted-foreground`) na ekranach dotykowych, natywny pasek w kolorze `--muted-foreground` na komputerze; cień usunięty.
- 2026-10-20: Safari na iOS drukował beżowe tło strony wokół zmniejszonej karty → `background: none` dla `html`, `body` i `#worksheet-home` w `@media print`; asercja w `print-contract.test.ts`.
