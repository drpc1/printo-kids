# Phone settings rows — Plan Brief

> Full plan: `context/changes/phone-settings-rows/plan.md`

## What & Why

Na telefonie wiersze ustawień sudoku i nonogramu nie trzymają linii (GitHub issue #173). Napis „Kształty” / „Cyfry” zaczyna się bardziej w lewo niż „Postać” i „Rozmiar”. Zanim nonogram pokaże kartkę, odstęp nad „Kategorią” jest większy niż odstęp między „Postacią” a „Poziomem”, gdy te dwa schodzą na osobne linie.

## Starting Point

Przycisk z chevronem ma napis 12 px od lewej, bo domyślny `Button` dokłada `has-[>svg]:px-3`. Przyciski symboli nie mają ikony i zostają przy `px-2` (8 px). Nonogram przed kartką trzyma „Postać” i „Poziom” w rzędzie `gap-2`, a „Kategorię” w kolumnie `gap-6` razem z notatką i „Generuj”.

## Desired End State

Poniżej 640 px napis „Kształty” zaczyna się tam gdzie „Postać”. Przed kartką nonogramu odstęp nad „Kategorią” jest taki sam jak odstęp między zawiniętymi „Postacią” i „Poziomem”. Od 640 px oba układy zostają jak dziś. Odstęp nad „Generuj” zostaje szerszy.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Inset symboli | `px-2 max-sm:px-3` na przyciskach, nie na wrapperze | Napis z chevronem ma już 12 px; ramki przycisków się pokrywają, rozjazd jest w napisie |
| Odstęp nonogramu | Własna kolumna `gap-6 max-sm:gap-2` wokół rzędu i „Kategorii” | Trzy linie dostają `gap-2`, a odstęp do „Generuj” zostaje `gap-6` |
| Dwie linie na telefonie | Też `gap-2` nad „Kategorią” | Ten sam rytm poniżej `sm`, bez warunku „czy rząd się zawinął” |
| Po „Generuj” w nonogramie | Bez zmian | Issue dotyczy stanu przed kartką; tam belka jest już jednym rzędem `gap-3` |
| Lewa krawędź nonogramu | Zostaje wyśrodkowana | Issue wyrównuje odstępy, nie krawędź rzędu |
| Fazy | Jedna | Obie poprawki to klasy i jeden spec |
| Test | Bounding box tylko na `phone-360` | Zawinięcie z issue jest na 360 px; pozostałe projekty tylko otwierają strony |

## Scope

**In scope:**

- `src/components/SudokuSymbolsChoice.tsx`
- Gałąź nonogramu przed kartką w `src/components/NonogramGenerator.tsx`
- `tests/e2e/phone-settings-rows.spec.ts`

**Out of scope:**

- Belka nonogramu po „Generuj”, przełączniki, inne karty
- `Button` i `px-2` przycisków z chevronem
- Dosunięcie rzędu nonogramu do lewej

## Architecture / Approach

Klasy zostają w istniejących komponentach. Spec na `phone-360` porównuje tekst „Kształty” z pierwszym `span` „Postać” po wyborze 6×6 oraz dwa odstępy pionowe nonogramu przed „Generuj”. Inne projekty Playwright tylko otwierają strony.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Wiersze ustawień na telefonie | Inset 12 px symboli poniżej `sm`, `gap-2` nad „Kategorią” poniżej `sm`, spec geometrii | Na 360 px „Kształty” musi być pierwsze w linii pod „Postacią”; pomiar ramek zamiast napisu przejdzie bez poprawki |

**Prerequisites:** Brak. Inset 12 px przycisku z chevronem jest już w `Button`.
**Estimated effort:** Jedna sesja, jedna faza.

## Open Risks & Assumptions

- Domyślna postać „Dinozaur” i rozmiar 6×6 na 360 px zawijają „Kształty” do linii, której jest pierwszym przyciskiem. Jeśli nie, spec ma zostać czerwony, a nie pominięty.
- „Poziom: łatwy” na 360 px nie mieści się obok „Postać: Dinozaur”, więc nonogram ma trzy linie. To założenie specu, nie osobny warunek produktu.
- Poniżej `sm`, gdy „Postać” i „Poziom” są w jednej linii, odstęp nad „Kategorią” też spada z 24 px do 8 px.

## Success Criteria (Summary)

- Na telefonie napis „Kształty” zaczyna się tam gdzie „Postać”.
- Na telefonie, przed kartką nonogramu, trzy linie ustawień mają jeden odstęp, a odstęp nad „Generuj” zostaje szerszy.
- Od 640 px padding symboli i odstęp nad „Kategorią” zostają jak dziś.
