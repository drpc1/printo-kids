# Labirynt liczbowy (S-49) — brief planu

> Pełny plan: [plan.md](plan.md). Makieta i decyzje: `mockups.html`, `stats.md`, PRD US-39/40, FR-049/050.

## Co budujemy

Piętnastą kartę: „Labirynt liczbowy” (`/number-maze`, id `liczby`). Kratka A4 cała wypełniona liczbami, start w lewym górnym rogu, meta w prawym dolnym. Dziecko rysuje drogę po sąsiednich kratkach (bez skosów) z kolejnymi liczbami poziomu i omija pułapki. Poziom 1–6, w profilu tylko poziom.

## Punkt wyjścia

- PRD, glosariusz i roadmapa S-49 są na `main` (PR #433); wszystkie decyzje produktowe zapadły przy makiecie.
- Makieta ma działający generator i niezależne sprawdzenie jednej drogi: 200 z 200 kart na każdym poziomie, najdłużej ok. 0,6 s (Poziom 4).
- Wzór kodu: krzyżówka matematyczna (`src/lib/math-crossword/`, tylko poziom w ustawieniach, osobny test-wyrocznia); rytm faz i rejestracja jak w S-48.

## Kluczowe decyzje

| Decyzja         | Wybór                                                                                                   | Skąd                  |
| --------------- | ------------------------------------------------------------------------------------------------------- | --------------------- |
| Poziomy         | 1–15 (5×5), 1–20 (5×6), 1–30 (6×7), 1–50 (8×9), co 2 do 60 (6×7), co 5 do 200 (7×8)                     | użytkowniczka, PRD    |
| Pułapki         | kuszące: do 3 kroków (P1–2) / 2 kroków (P3–6) od liczb drogi obok; nigdy następna liczba ani start/meta | użytkowniczka, PRD    |
| Rozwiązanie     | brak „Pokaż rozwiązanie”; bez kolorów i kategorii                                                       | użytkowniczka, PRD    |
| Nazwy           | `liczby`, `/number-maze`, `src/lib/number-maze/`, `NumberMazeCard`, `poziom1`…`poziom6`                 | glosariusz, krzyżówka |
| Domyślny poziom | Poziom 1                                                                                                | PRD                   |
| Nowa karta      | `contentKey` = poziom: zmiana poziomu układa nową kartę                                                 | `sheet-state.ts`      |
| Sprawdzenie     | kody problemów w `card.ts` plus osobna wyrocznia w teście (bez importu `card.ts`)                       | wzór krzyżówki        |
| Czas            | DFS z limitem węzłów i ponowieniem; test: najdłużej < 2 s na 200 ziarnach każdego poziomu               | makieta, NFR 5 s      |

## Fazy

| Faza                           | Co daje                                                                                                    | Kończy się                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1. Logika karty                | `src/lib/number-maze/`: poziomy, stałe druku, karta i kody, generator, silnik, układ, testy, `preview.mts` | akceptacja podglądu, `/10x-impl-review`, PR |
| 2. Strona, katalog i profil    | rejestry, `/number-maze`, arkusz SVG, miniatura, „Jak to działa”, e2e                                      | e2e na 4 projektach, smoke, PR              |
| 3. Wydruk próbny (po scaleniu) | wydruk 6 poziomów w Safari, Chrome iOS, Brave iOS; próba z dzieckiem                                       | Open Questions 20 zamknięte                 |

**Wymagania wstępne:** brak (S-49 nie ma zależności). **Szacunek:** jak S-48 — dwie sesje kodu (fazy 1–2) i wydruk.

## Czego nie robimy

Skosy, start i meta poza rogami, liczenie wstecz, działania w kratkach, kolory, kategorie, „Pokaż rozwiązanie”, ocena rysunku dziecka; Stryker (S-50), tagi (S-43).

## Ryzyka

- Czas na Poziomie 4 (droga przez 50 z 72 kratek): limit węzłów i ponowienie, test na próg 2 s.
- Czytelność liczb trzycyfrowych w kratce ok. 27 mm (Poziom 6): potwierdza wydruk w fazie 3.

## References

- PRD: US-39, US-40, FR-049, FR-050, Business Logic „Karta „Labirynt liczbowy””, Open Questions 20
- Roadmapa S-49, GitHub #421; glosariusz („Labirynt liczbowy”, droga, pułapka, krok liczenia)
- Wzory: `context/archive/2026-11-18-size-order-card/plan.md`, `src/lib/math-crossword/`
