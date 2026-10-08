# Frame Brief: Otwarta lista postaci w formularzu profilu

> Framing step before /10x-plan. This document captures what is *actually*
> at issue, separated from what was initially assumed.

## Reported Observation

Jak dodajemy profil to mamy imię i listę potencjalnych postaci — otwartą. Tak być nie może.

## Initial Framing (preserved)

- **User's stated cause or approach**: Tak nie może zostać, bo postaci będzie więcej, a docelowo rodzic doda też własną.
- **User's proposed direction**: Zamiana tej listy na typeahead. Nie jest rozstrzygnięte, czy to ten plasterek, czy kolejny.
- **Pre-dispatch narrowing**: Tylko formularz dodawania profilu. Problem jest już przy czterech postaciach. Który plasterek — nierozstrzygnięte.

## Dimension Map

The observation could originate at any of these dimensions:

1. **Wspólna lista z paskiem Postać** — formularz dostał otwarte wiersze, bo plan kazał użyć tej samej listy co kontrolka kartki.
2. **Cztery wiersze są już całym zestawem** — formularz od razu pokazuje każdą dostarczoną postać, więc lista jest otwarta zanim katalog urośnie.
3. **Przyszły katalog i własny obrazek** — typeahead należy do późniejszego zestawu albo do US-02, a nie do bieżącego formularza. ← initial framing
4. **Który plasterek jest właścicielem formularza** — S-05 zapisał otwarte cztery wiersze; S-06 jest zapisem i usunięciem; US-02 jest zaparkowane.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Formularz reuse'uje otwarte wiersze Postaci | `plan.md` faza 2: „te same cztery wiersze postaci co kontrolka Postać”. `WorksheetGenerator.tsx` `CharacterChoiceRows` (ok. 356–383) jest w formularzu (ok. 284) i w pasku (ok. 341–350). | STRONG |
| Przy czterech pozycjach lista jest już całym zestawem | `CHARACTER_CHOICES` to `none`, `samochodzik`, `rakieta`, `dinozaur` (`WorksheetGenerator.tsx` 18–23). Brak zwinięcia albo filtra. Desired End State, `plan.md` ok. 17: okno z imieniem i czterema wierszami. | STRONG |
| To luka przyszłego katalogu albo własnego obrazka | S-05 w „What We're NOT Doing” wyłącza „zmiana katalogu postaci”. US-02 w PRD (ok. 63–71 i 142) i w roadmapie (zaparkowane, ok. 210) jest poza MVP, po katalogu dostarczonym. W roadmapie nie ma plasterka „więcej postaci”. | NONE |
| S-06 jest miejscem na inną listę postaci | S-06, roadmapa ok. 51 i 174: jawny zapis ustawień i usunięcie po potwierdzeniu. Brak picker'a. | NONE |

## Narrowing Signals

Step 3 was conclusive on the slice question, so Step 4 was skipped.

- Użytkownik widzi problem tylko w formularzu dodawania, nie na pasku Postać.
- Użytkownik widzi problem już przy czterech postaciach, nie dopiero przy większym katalogu albo własnym pliku.
- Otwarta lista jest zdaniem kontraktu S-05, nie brakiem S-06 ani US-02.

## Cross-System Convention

Kontrolka kartki od S-03 / S-04 jest zamkniętym przyciskiem „Postać: …”, a po kliknięciu otwiera te same cztery wiersze (`context/archive/2026-10-05-last-used-print-params/plan.md`). Formularz profilu skopiował te wiersze w stan zawsze widoczny. Własny obrazek jest osobno zaparkowany jako `parent-supplied-maze-image` i nie zmienia tego formularza.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: formularz utworzenia profilu pokazuje od razu cały dostarczony zestaw postaci, i tak został zapisany w kontrakcie bieżącego plasterka.

Cztery wiersze są już całym zestawem, więc czekanie na więcej postaci albo na własny obrazek nie tłumaczy tej listy. S-06 nie rusza wyboru postaci. Poprawka dotyczy tego, jak w tym formularzu wskazuje się jedną ulubioną, bez zakładania z góry typeahead.

## Confidence

- **HIGH** — kod, kontrakt S-05 i zaparkowane US-02 mówią to samo, a odpowiedzi użytkownika odcinają pasek Postać oraz „dopiero gdy postaci będzie więcej”.

## What Changes for /10x-plan

2026-10-08: nie planować tej korekty. Formularz zostaje przy otwartych czterech wierszach. Późniejsza przeróbka listy przy tworzeniu profilu i w podglądzie profilu jest US-03. Wygląd nie jest ustalony. Pasek „Postać” na kartce zostaje.

## References

- Source files: `src/components/WorksheetGenerator.tsx` (katalog ok. 18–23, formularz ok. 284, wiersze ok. 356–383)
- Plan: `context/changes/child-profile-create-select/plan.md` (Desired End State ok. 17, poza zakresem ok. 37, kontrakt fazy 2 ok. 123)
- PRD: `context/foundation/prd.md` US-02, FR-002, FR-007, non-goal własnego obrazka
- Roadmap: `context/foundation/roadmap.md` S-05, S-06, zaparkowane US-02
- Investigation tasks: fc32a4b8-ab97-41a5-80b9-13f39e3993ee, e7c27361-3271-4da0-a94b-f3342233d1cf, 5eb720f7-7901-405d-81d4-ea5b346e19b9
