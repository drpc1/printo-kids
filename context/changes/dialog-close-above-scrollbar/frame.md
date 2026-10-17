# Frame Brief: X nad paskiem przewijania

> Framing step before /10x-plan. This document captures what is *actually*
> at issue, separated from what was initially assumed.

## Reported Observation

Chce poprawić małą rzecz - umiejscowienie paska przewijania względem przycisku X. X powinien być bezpośrednio nad scrollem.

## Initial Framing (preserved)

- **User's stated cause or approach**: X i pasek nie stoją w jednej kolumnie.
- **User's proposed direction**: X ma być bezpośrednio nad scrollem.
- **Pre-dispatch narrowing**: Jedna obserwacja, sprzed naprawy, bez wskazania jednego ekranu. Pytania o zakres zostały zamknięte bez odpowiedzi; użytkownik potwierdził, że chodzi o stan przed zmianą w pliku, i kazał iść dalej.

## Dimension Map

The observation could originate at any of these dimensions:

1. **Wspólny róg okna** — prawy odstęp treści i przypięty X nie dzielą jednej kolumny, więc pasek wewnętrznego przewijania stoi na lewo od X. ← initial framing
2. **Jedno okno** — tylko profil albo tylko wybór postaci dokłada własny odstęp, overflow albo scroller.
3. **Dwa pudła** — X jest absolutny na zewnętrznym dialogu, a pasek należy do wewnętrznego diva, więc sam odstęp zewnętrzny nie może ich złożyć w jedną kolumnę.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Wspólny róg: na HEAD `pt-14 pr-14` przy X `absolute top-4 right-4` i wewnętrznym `overflow-y-auto` | `src/components/ui/dialog.tsx:52`, `:57`, `:62` w HEAD. `pr-14` (3.5rem) jest szerszy niż `right-4` (1rem), więc prawa krawędź scrollera jest na lewo od X. | STRONG |
| Jedno okno dokłada własny układ paska | `WorksheetGenerator.tsx:220` i `ProfileCorner.tsx:296-297` dają tylko `max-h-[calc(100dvh-2rem)]`. Brak własnego overflow i `pr-*`. | NONE |
| Dwa pudła uniemożliwiają wspólną kolumnę | Struktura jest: X to rodzeństwo scrollera (`dialog.tsx:58-68`). Prawa krawędź scrollera i tak wynika z `padding-right` zewnętrznego dialogu. | WEAK |

## Narrowing Signals

Step 3 znalazł mocny ślad dla wspólnego rogu i żaden dla jednego okna. Pytania z kroku 4 pominięte.

- Oba przewijane okna biorą ten sam `DialogContent`.
- Pasek pojawia się dopiero, gdy treść przekracza `max-h` wołającego. Krótkie okno nie ma paska, więc obserwacja dotyczy kolumny przy przewijaniu, nie samego rogu bez paska.

## Cross-System Convention

Niezależne szukanie bez podanej przyczyny wskazało ten sam HEAD: wewnętrzny scroller i X na zewnętrznej skorupie z `pr-14`. Wcześniejsza zmiana `dialog-close-button` (`context/archive/2026-10-16-dialog-close-button/plan.md:19`, `:45`, `:115`) przypięła X do rogu na czas przewijania i zabrała `overflow-y-auto` z elementu, który pozycjonuje X, żeby krzyżyk nie odjeżdżał z listą i nie zasłaniał pierwszego wiersza, ołówka ani kosza. Nie ustawiała paska pod X. Szerszy prawy odstęp jest skutkiem tego przypięcia.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: we wspólnym dialogu pasek przewijania stoi na lewo od przypiętego X, bo treść jest wcięta szerzej niż kolumna krzyżyka.

The initial framing was correct — proceed with the originally proposed direction. X ma być bezpośrednio nad tym paskiem. To nie jest usterka jednego ekranu. Wcześniejszy kontrakt zostaje: X nie jedzie z listą i nie zasłania pierwszego wiersza, ołówka ani kosza.

## Confidence

**HIGH** — mocny ślad w HEAD, oba wołające są symetryczne, a wcześniejszy plan tłumaczy, czemu odstęp jest szerszy niż kolumna X.

## What Changes for /10x-plan

Plan dotyczy wspólnej kolumny w `DialogContent` dla każdego okna, które się przewija. Zostawia przypięcie X i odstęp od pierwszego wiersza z `dialog-close-button`. Nie wraca do napisu „Zamknij” ani do potwierdzenia usunięcia. W drzewie roboczym jest już niezacommitowana zmiana `pr-14` na `pr-4`; plan startuje od zachowania z HEAD i ma tę edycję uwzględnić, a nie traktować jej jako rozstrzygnięcie.

## References

- Source files: `src/components/ui/dialog.tsx:51-68` (HEAD: `:52` `pr-14`, `:57` scroller, `:62` X); `src/components/WorksheetGenerator.tsx:220`; `src/components/ProfileCorner.tsx:296-297`
- Related research: brak
- Investigation tasks: 53a5224a-0167-47e6-977d-aa9a4324572d, f0c7cf37-5239-448b-a67a-7abc6881dd03, e99af627-d5b5-4435-be0e-935fb199caaa, 88e6e84c-4b10-44b8-ae19-89f6b1dfe9c4
