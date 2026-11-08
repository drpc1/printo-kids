---
date: 2026-11-08T23:25:16+01:00
researcher: Claude (sesja gh265)
git_commit: d4fc2bf
branch: claude/gh265-ktory-nie-pasuje-b493fc
repository: drpc1/printo-kids
topic: "Jak dołożyć kartę „Który nie pasuje” (S-34, GitHub 265) na wzorcu istniejących kart"
tags: [research, card-kinds, odd-one-out, card-contract, sudoku-shapes, symmetry-templates]
status: complete
last_updated: 2026-11-08
last_updated_by: Claude (sesja gh265)
---

# Research: karta „Który nie pasuje” (S-34)

## Research Question

Co trzeba dotknąć, żeby dodać ósmy rodzaj karty (`CARD_KINDS` ma dziś siedem) „Który nie pasuje” (US-25, US-26, FR-035, FR-036), z czego można skorzystać (kształty sudoku, kredki, sylwetki z katalogu szablonów) i czy coś w M-5 musi wejść wcześniej.

## Summary

- **Kolejność w M-5**: S-33 („Kto ma więcej?”) ma status `done` (`context/foundation/roadmap.md:44`), a jego faza 1 zamieniła liczbę kart w testach na liczbę z katalogu (`context/archive/2026-11-01-coins-who-has-more/plan.md`, „Faza 1”). S-34 nie ma innych warunków wstępnych (roadmap `:88`).
- **Wzorzec karty** to „Kto ma więcej?” (ostatnia dodana karta, z poziomami i przełącznikiem kolorów): moduł `src/lib/money/` (`levels.ts`, `rules.ts`, `generate.ts`, `engine.ts`, `layout.ts`, `sheet.ts`, `colors.ts` + testy), strona `src/pages/money.astro`, island `src/components/MoneyGenerator.tsx` na `CardPage`/`useCardPage`/`useCardSettings` i `sheet-state`.
- **Ograniczenie z katalogu**: do reguły „kategoria” nadaje się 26 obiektów z jedną kategorią (Zwierzęta 5, Jedzenie 6, Przyroda 4, Kosmos 7, Domy 4; tyle samo na każdym rozmiarze szablonu). Żaden obiekt nie ma dziś kilku kategorii. Rząd trudnego poziomu ma 6 obrazków, więc wymaga 5 obiektów z jednej kategorii: Przyroda i Domy mają tylko 4 różne obiekty, więc albo rząd kategorii bierze większość tylko z Zwierząt, Jedzenia i Kosmosu, albo dopuszcza ten sam obiekt w innym wariancie części. To decyzja do makiety/planu.

## Detailed Findings

### Miejsca, które dotyka nowa karta (ścieżka „pieniadze”, zbadana grepem `pieniadze|money` poza `context/`)

- Rejestr: `src/lib/cards.ts:10-66` (`CARD_KINDS`, z `description` dla „Jak to działa”; katalog i `/how-it-works` czytają tę listę same).
- Ustawienia: `src/lib/card-settings.ts:37-92` (interfejs `MoneySettings {level, colors}`, `CardSettingsMap`, `CARD_SETTINGS_IDS`, `DEFAULTS`) oraz `parseCard`/`normalizeCard` (`card-settings.ts:198-206`).
- Silniki: `src/lib/card-engines.ts` (`CardTypeMap`, `CARD_ENGINES` z `satisfies` — brak silnika dla id z katalogu to błąd kompilacji).
- Kontrakt: `src/lib/card-contract.ts` (`CardSpec` z `problems`, `keyOf`, `contentKey`, `knownBad`; `VerifiedCard.require/check`; `CardExhausted`). Wzór silnika próbkującego: `src/lib/money/engine.ts` (generator zwraca `null` → `CardExhausted`; `contentKey` = sam poziom, kolory to ozdoba).
- Podsumowanie profilu i plakietka: `src/lib/card-summary.ts:95-110` (case `pieniadze`, „kolory” w extras).
- Druk: `src/lib/sheet/print-contract.test.ts:18,181-197` (SVG 210×297 mm, kontrolki ukryte w druku, strona na wspólnym shellu).
- Granice zależności: `.dependency-cruiser.cjs:139` (lista modułów `generate.ts`).
- Miniatura: `scripts/build-thumbnails.mjs:439-490` (z prawdziwego generatora i stałych `sheet.ts`).
- Testy: lista plików w `package.json` (`test`), e2e `tests/e2e/money.spec.ts`, `money-reprint.spec.ts`, oraz tabele kart w `card-settings.spec.ts:69`, `profile-summary.spec.ts:26`, `phone-layout.spec.ts:579`, `phone-settings-rows`, `phone-toggle-align`, `character-speaks`.
- Sprawdzian HTTP: `scripts/smoke.mjs` (po S-33 bierze adresy kart z katalogu).

### Co da się wziąć gotowe

- Kształty: `src/lib/sudoku/shapes.ts` — `sudokuShapePath(id, cx, cy, size)` rysuje zamknięty obrys w mm; `SUDOKU_SHAPES_4` = koło, kwadrat, trójkąt, serce, krzyżyk (dokładnie lista z PRD dla reguły kształtu).
- Kredki: `src/lib/sudoku/colors.ts` — przypisanie kształt→kredka i `var(--symmetry-*)` (9 tokenów w `src/styles/global.css:60-68`). Reguła „kolor” potrzebuje koloru niezależnego od kształtu, więc karta wybiera kredkę z tej samej dziewiątki, a nie z mapy kształt→kolor.
- Sylwetki: `symmetryTemplatesFor(level, category)` (`src/lib/symmetry/templates.ts:53`) + `nonogramImage(template, variants, size)` (`src/lib/nonogram/clues.ts:16`) dają bitmapę całej sylwetki; `template.categories` daje kategorię.
- Postać przy poleceniu: `CharacterInstruction` (`src/components/SpeechBand.tsx`), jak w `MoneyGenerator.tsx`.
- Dwuznaczność „względem całej listy reguł”: wzór z sekwencji (`src/lib/sequence/rules.ts`), tu prostszy, bo każdy obrazek to wektor cech (kształt, rozmiar, liczba, kolor, kategoria), a rząd jest jednoznaczny, gdy dokładnie jedna cecha ma dokładnie jeden odstający obrazek, a pozostałe cechy nie wskazują żadnego pojedynczego obrazka.

## Code References

- `src/lib/money/engine.ts` — wzór `CardSpec` + `knownBad` + silnik.
- `src/components/MoneyGenerator.tsx` — wzór island z poziomem i przełącznikiem „Kolory”.
- `src/lib/money/sheet.ts` — wzór stałych rysunku w mm.
- `scripts/money-mockup.mjs` — wzór makiety z prawdziwych stałych.

## Open Questions (do makiety i planu)

1. Rząd kategorii na trudnym (6 obrazków): większość tylko z kategorii mających ≥5 obiektów, czy powtórzony obiekt w innym wariancie?
2. Jak wygląda „liczba” (kropki w kółku? kilka małych kształtów?) i „rozmiar” (duży/mały: stosunek wielkości) — rozstrzyga makieta.
3. Reguła „kolor” na średnim bez włączonych kolorów odpada; czy średni bez kolorów ma wtedy tylko kształt, rozmiar i liczbę (tak wynika z PRD).
