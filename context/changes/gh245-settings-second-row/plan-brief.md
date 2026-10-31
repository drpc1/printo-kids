# Druga linia ustawień karty na komputerze (GH 245) — Plan Brief

> Full plan: `context/changes/gh245-settings-second-row/plan.md`

## What & Why

Od szerokości 640 px zawinięty pasek ustawień ma drugą linię bardziej w lewo niż pierwszą. Na telefonie reguła „pierwsza kontrolka linii zaczyna się tam, gdzie tekst Postać” już działa (#173); chcemy ją na każdej szerokości.

## Starting Point

Przyciski z chevronem mają efektywnie 12 px wcięcia (`has-[>svg]:px-3`). Przełącznik (`SettingToggle`) i przyciski Kształty/Cyfry mają to wcięcie tylko poniżej `sm`.

## Desired End State

Od 640 px każda linia paska zaczyna się w tym samym miejscu po Generuj (przed Generuj wiersz jest wyśrodkowany z założenia). Telefon bez zmian.

## Key Decisions Made

| Decision       | Choice                                                        | Why                                                              | Source |
| -------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| Gdzie poprawić | Wcięcie `px-3` w dwóch kontrolkach, bez `max-sm:`             | Jedna reguła na wszystkich szerokościach, bez zmian w `CardPage` | Plan   |
| Test           | Rozszerzyć `phone-settings-rows.spec.ts` o szerokość ≥ 640 px | Ten sam helper wyrównania, regresja pilnowana w CI               | Plan   |

## Scope

**In scope:** `SettingToggle`, `SudokuSymbolsChoice`, test e2e.

**Out of scope:** `CardPage`, `ui/button`, odstępy między liniami, układ telefonu.

## Architecture / Approach

Zdjęcie prefiksu `max-sm:` z wcięcia dwóch kontrolek; wydzielenie asercji wyrównania w teście i wywołanie jej także na szerokości ok. 700 px.

## Phases at a Glance

| Phase                           | What it delivers                 | Key risk                                    |
| ------------------------------- | -------------------------------- | ------------------------------------------- |
| 1. Wspólne wcięcie i test od sm | Wyrównane linie od 640 px + test | Test na 700 px musi naprawdę zawijać wiersz |

**Prerequisites:** brak.
**Estimated effort:** ~1 sesja, 1 faza.

## Open Risks & Assumptions

- Przyjmujemy, że wcięcie 12 px przy kontrolce w jednej linii (szeroki ekran) jest akceptowalne wizualnie.

## Success Criteria (Summary)

- Druga linia ustawień zaczyna się tam, gdzie pierwsza, na sudoku, nonogramie i dyktandzie od 640 px.
- Telefon wygląda jak dotąd; lint, typy, testy i e2e zielone.
