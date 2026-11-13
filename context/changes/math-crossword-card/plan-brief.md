# Krzyżówka matematyczna (S-40) — Plan Brief

> Full plan: `context/changes/math-crossword-card/plan.md`

## What & Why

Jedenasty rodzaj karty: krzyżówka matematyczna jak w zeszytach ćwiczeń. Działania „a ○ b = c” biegną w prawo albo w dół i krzyżują się we wspólnych liczbach; każde pole jest kratką. Rodzic dostaje na żądanie nową kartę na właściwym poziomie, od dodawania do 10 dla przedszkolaka po cztery działania do 100 w klasie 3.

## Starting Point

Dziesięć kart przechodzi tę samą drogę (rejestr `CARD_KINDS`, ustawienia, silnik, podsumowanie profilu, strona, miniatura, tabele testów). Algorytm krzyżówki działa w makiecie `mockup.mts`; makiety, poziomy i puste pola zaakceptowała użytkowniczka 2026-11-13.

## Desired End State

Strona `/math-crossword` z Poziomem 1–7 (domyślnie 2), Generuj daje jedną stronę A4 z krzyżówką, w której każde puste pole da się wyliczyć bez zgadywania. „Pokaż rozwiązanie” pokazuje brakujące liczby na ekranie, nigdy na wydruku. Profil pamięta poziom, katalog ma miniaturę i plakietkę, „Jak to działa” opisuje kartę i jej poziomy.

## Key Decisions Made

| Decision             | Choice                                                                                      | Why (1 sentence)                                                       | Source  |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------- |
| Układ                | Każde pole kratką, działania krzyżują się swobodnie                                         | Tak wyglądają zeszyty ćwiczeń pokazane przez użytkowniczkę             | Makieta |
| Poziomy              | Poziom 1–7: + do 10; + − do 10; + − do 20; + − do 100; · do 30; · : do 50; wszystkie do 100 | Odpowiada umiejętnościom od przedszkola do klasy 3, jedna zmiana naraz | Makieta |
| Wielkość             | 5 → 20 działań, kratka 26 → 13,5 mm; większa kratka na Poziomach 1–2                        | Prośba użytkowniczki: miejsce na cyfry dla najmłodszych                | Makieta |
| Puste pola           | Rosną z poziomem (40% → 60%) razem z „łańcuchem” (1 → 4); bez osobnej kontrolki             | Trudność bez zgadywania, prosty pasek                                  | Makieta |
| Mnożenie i dzielenie | W tabliczce mnożenia (czynniki, dzielnik, iloraz do 10); znaki „·” i „:”                    | Polski zapis szkolny, bez działań typu 2 · 25                          | Makieta |
| Pokaż rozwiązanie    | Tak, tylko na ekranie, niezapamiętywane                                                     | Rodzic sprawdza dziecko bez liczenia; wzór z nonogramu                 | Plan    |
| Poziom domyślny      | Poziom 2                                                                                    | Największa grupa odbiorców (zerówka, klasa 1)                          | Plan    |
| Wiek pod opisem      | Brak                                                                                        | Jak wszystkie karty z M-5                                              | Plan    |
| „Jak to działa”      | Opis karty i zdanie o poziomach teraz                                                       | Strona zgodna od dnia wydania                                          | Plan    |

## Scope

**In scope:** PRD (US-31/32, FR-041/042, Business Logic, tabela profilu, „Poziomy”, katalog 11 kart) i glosariusz; moduł `src/lib/math-crossword/` z testami i niezależną wyrocznią; strona, generator, arkusz, „Pokaż rozwiązanie”; rejestracja, miniatura, plakietka, podsumowanie profilu; tabele testów i nowe specy e2e; wydruk próbny.

**Out of scope:** kontrolka liczby pustych pól, wiek pod opisem, działania z wieloma znakami, ramka „Użyj:”, kolory i kategorie, tagi katalogu (S-43), przepisanie „Jak to działa” (S-44), Stryker jako bramka.

## Architecture / Approach

Moduł karty jak `pattern-lines`: `levels.ts` i `sheet.ts` (tabela poziomów i stałe druku) → `card.ts` (typ, klucz, `chainDepth`, kody problemów) → `generate.ts` (układanie działań, wypełnianie z cofaniem, puste pola Fisher–Yates) → `layout.ts` (mm, margines 10 mm) → `engine.ts` (`CardSpec`, `VerifiedCard`). Strona na `CardPage`/`useCardPage`/`useCardSettings`, arkusz SVG z `CharacterInstruction`.

## Phases at a Glance

| Phase                       | What it delivers                           | Key risk                                                     |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| 1. Dokumenty                | PRD i glosariusz opisują kartę             | Rozjazd PRD z makietą                                        |
| 2. Logika karty             | Generator z testami, wyrocznią i podglądem | Czas generowania Poziomu 7, kod rozwiązywalny bez zgadywania |
| 3. Strona, katalog i profil | Karta w katalogu, na stronie i w profilu   | Dużo tabel w testach e2e do dopisania                        |
| 4. Wydruk próbny            | Potwierdzone wartości na papierze          | Za mała kratka na Poziomie 7                                 |

**Prerequisites:** zaakceptowane makiety (2026-11-13); `main` aktualny.
**Estimated effort:** ~3 sesje (fazy 1–3, po jednym PR), faza 4 po scaleniu.

## Open Risks & Assumptions

- Liczby działań i pustych pól są celami; przy ciasnych siatkach generator może dać mniej działań — tolerancja w `levels.ts`.
- Poziom 7 (cztery działania do 100, 20 działań) jest najcięższy dla wypełniania z cofaniem; test czasu pilnuje 5 s.
- Wartości poziomów potwierdza wydruk (nowe Open Question w PRD).
- Roadmapa M-6 nie jest jeszcze scommitowana w tym worktree, więc status S-40 nie został przestawiony.

## Success Criteria (Summary)

- Rodzic generuje i drukuje krzyżówkę na każdym z siedmiu poziomów jako jedną stronę A4, także z telefonu.
- Każde puste pole da się wyliczyć bez zgadywania, a „Pokaż rozwiązanie” pozwala to sprawdzić na ekranie.
- Profil pamięta poziom, a katalog i „Jak to działa” znają nową kartę.
