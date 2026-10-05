# Last-used character — Plan Brief

> Full plan: `context/changes/last-used-print-params/plan.md`

## What & Why

Rodzic bez profilu dziecka ma dostać ostatnią postać jako widoczną, edytowalną wartość domyślną (FR-006). Dziś odświeżenie zawsze wraca do „Bez postaci”, więc każda kolejna karta zaczyna od nowa. Do czasu poziomów trudności jedynym parametrem jest postać.

## Starting Point

Kontrolka na `/` pokazuje „Postać: …” i okno z wierszami „Bez postaci”, Samochodzik, Rakieta, Dinozaur. Wybór od razu zmienia obrazek na już wygenerowanej karcie. Wyspa jest `client:load`, a w `src/` nie ma lokalnego magazynu.

## Desired End State

Wejście na `/` pokazuje w tej samej kontrolce ostatnio klikniętą postać, zanim rodzic naciśnie Generuj. Może ją zmienić tym samym oknem. „Bez postaci” też zostaje na następną wizytę. Brak zapisu i zepsuty zapis wyglądają jak dzisiejszy start: „Postać: Bez postaci”.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Moment zapisu | Kliknięcie wiersza w oknie | Karta już podąża za wyborem bez drugiego Generuj, więc pamięć ma trzymać to, co widać na kontrolce. |
| Widok | Ta sama kontrolka, bez dopisku | Przed Generuj widać nazwę i da się ją zmienić, a FR-006 nie wymaga osobnego ostrzeżenia. |
| Pusty i zły zapis | „Bez postaci” | Tak samo jak start z S-03; nieznany identyfikator nie podstawia Samochodzika. |
| „Bez postaci” | Jest zapisywane i nadpisuje nazwaną postać | Jawny wybór bez obrazka ma wrócić przy następnej wizycie. |
| Magazyn | `localStorage`, klucz `printo-kids:last-used`, JSON `{"character":"<id>"}` | Zapis zostaje na urządzeniu; ten sam obiekt da się później rozszerzyć o poziom trudności. |
| Pierwsze malowanie | `client:only="react"` | Pierwsza etykieta kontrolki jest wartością z magazynu, a nie serwerowym „Bez postaci”. |

## Scope

**In scope:**

- Odczyt i zapis identyfikatora postaci, łącznie z `none`
- Podpięcie pod istniejące kliknięcie wiersza
- Testy kontraktu na podręczonym magazynie
- Dyrektywa wyspy `client:only="react"`

**Out of scope:**

- Poziomy trudności i profile dzieci
- Dopisek, osobny wiersz „użyj ostatniej” i pytanie przed nadpisaniem
- Przycisk czyszczenia pamięci
- Zapis labiryntu, katalog postaci, geometria karty i druk

## Architecture / Approach

`src/lib/last-used.ts` waliduje surowy tekst i rozmawia z podręczanym magazynem. Dozwolone identyfikatory przychodzą z katalogu w `WorksheetGenerator`. Zły odczyt zwraca `none` i nic nie zapisuje. Kliknięcie wiersza zapisuje wybór; Generuj i Drukuj nie zapisują. Błąd `localStorage` zostawia bieżącą wizytę działającą.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Kontrakt ostatniego wyboru | Moduł i testy reguł odczytu/zapisu | Zły kształt JSON, który test przepuści, wróci na ekranie jako czyjaś postać |
| 2. Kontrolka czyta i zapisuje postać | Start z magazynu i zapis przy kliknięciu wiersza | Odczyt po pierwszym malowaniu mignie „Bez postaci” |

**Prerequisites:** S-03 jest done; kontrolka postaci jest na `/`.
**Estimated effort:** jedna sesja, dwie fazy.

## Open Risks & Assumptions

- W trybie prywatnym magazyn może rzucić. Bieżąca wizyta działa, następna startuje od „Bez postaci”.
- Wspólne urządzenie pokaże postać poprzedniego dziecka. Zabezpieczeniem jest widoczna nazwa przed Generuj.
- `client:only` pokazuje kontrolkę dopiero po starcie JS. Nagłówek strony jest od razu.
- S-05 ma użyć innego klucza na profile. Ten klucz zostaje domyślną postacią bez profilu.

## Success Criteria (Summary)

- Po odświeżeniu kontrolka pokazuje ostatnio klikniętą postać, także gdy rodzic nie kliknął Generuj ani Drukuj.
- „Bez postaci” po nazwanej postaci zostaje „Bez postaci” przy następnej wizycie.
- Brak zapisu i identyfikator spoza zestawu dają „Postać: Bez postaci”, a Generuj oraz druk jednej strony A4 działają jak dziś.
