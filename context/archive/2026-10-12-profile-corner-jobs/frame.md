# Frame Brief: Okno profili miesza zadania

> Framing step before /10x-plan. This document captures what is *actually*
> at issue, separated from what was initially assumed.

## Reported Observation

Nie podoba mi się jak wygląda okno z profilami. Mamy tam różne funkcje, różne tematy. Wygląd okna jest nieintuicyjny.

Na zrzucie jest menu jednego dziecka: imię jako tytuł, wiersz postaci, „Zapisz”, „Usuń”, „Dodaj profil”.

## Initial Framing (preserved)

- **User's stated cause or approach**: W jednym oknie siedzą różne funkcje i różne tematy, dlatego wygląd jest nieintuicyjny.
- **User's proposed direction**: Oddzielić listę profili od edycji. Modyfikacja i „Usuń” mają być poza listą wszystkich profili. Dodawanie innego profilu w oknie edycji wygląda źle. Może inne miejsce albo inne okno.
- **Pre-dispatch narrowing**: Zgrzyt jest w oknie z prawego górnego rogu. Naraz widać kilka rzeczy, bez jednego głównego starcia. Modyfikacja jednego profilu i dodawanie innego w tym samym oknie wyglądają źle. Modyfikacja i „Usuń” mają być oddzielone od listy wszystkich profili.

## Dimension Map

The observation could originate at any of these dimensions:

1. **Menu rogu** — jeden widok `menu` układa listę (przy dwóch i więcej), edycję ulubionej, „Usuń” i „Dodaj profil”. ← initial framing
2. **Jeden przycisk rogu** — wybór dziecka do kartki i zarządzanie profilami wchodzą tym samym przyciskiem i tym samym dialogiem.
3. **Waga kontrolek** — „Usuń” i „Dodaj profil” wyglądają jak ten sam rodzaj wiersza, a „Zapisz” jest przyciskiem głównym.
4. **Wcześniejszy kontrakt** — osobna strona profili i lista dzieci na stronie labiryntu zostały świadomie odrzucone; zapis i usunięcie doklejono do tego samego menu.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Menu składa cztery zadania rodzica | `ProfilePanel` w `src/components/WorksheetGenerator.tsx:42`. Widok `menu` (`:566-649`): przy dwóch i więcej lista imion, przy jednym tytuł z imienia, potem edycja postaci i „Zapisz” (`:614-629`), „Usuń” (`:632-640` albo kosz w wierszu `:588-601`), „Dodaj profil” (`:642-649`). Formularz, potwierdzenie, przełączenie i lista postaci podmieniają treść tego samego `DialogContent` (`:480-682`). | STRONG |
| Jeden róg obsługuje wybór i zarządzanie | `ask` otwiera ten sam dialog (`:217`, `child-profiles.ts:93-96`). PRD FR-007–FR-010 (`context/foundation/prd.md` ok. 127–136) rozdziela utworzenie, wybór, jawny zapis i usunięcie, ale nie każe składać ich na jednym ekranie. Plany S-05 i S-06 włożyły oba zadania w róg. | STRONG |
| Zgrzyt to sama waga przycisków | „Zapisz” jest przyciskiem domyślnym (`:622-629`). „Usuń” i „Dodaj profil” są tym samym ghostem (`:632-649`). To wzmacnia mieszanie, ale nie tłumaczy prośby o osobne miejsce listy i edycji. | WEAK |
| Osobna strona jest już zamkniętą odpowiedzią | `context/archive/2026-10-06-child-profile-create-select/plan.md` „What We're NOT Doing”: lista dzieci na stronie labiryntu, osobna strona profili. `context/archive/2026-10-08-child-profile-save-delete/plan.md` ok. 38 i 47: „Zapisz” i „Usuń” zostają w menu rogu; potwierdzenie jest kolejnym widokiem tego samego dialogu. Osobne okno potwierdzenia jest poza zakresem. | STRONG jako ograniczenie, nie jako przyczyna wyglądu |

## Narrowing Signals

Step 3 potwierdził złożone menu, a doprecyzowanie sprzed badania już nazwało, które zadania się gryzą. Drugiej rundy pytań nie było.

- Zrzut to menu jednego dziecka: nie ma listy, a i tak widać edycję, usunięcie i dodanie.
- Przy dwóch i więcej ta sama powierzchnia dokłada listę imion nad edycją aktywnego dziecka.
- Użytkownik odrzuca naraz edycję z dodawaniem oraz edycję i „Usuń” na liście. Zakres to tylko róg.

## Cross-System Convention

S-05 zrobił z rogu jedno okno: menu albo formularz. S-06 dołożył do tego menu zapis ulubionej i usunięcie, a potwierdzenie i ostrzeżenie przy przełączeniu zostały kolejnymi widokami tego samego dialogu. Osobna strona profili i lista dzieci na labiryncie zostały odrzucone. PRD nie wymaga jednego ekranu; wymaga czterech osobnych możliwości.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: menu rogu pokazuje naraz zadania, które produkt już rozdziela — wybór dziecka, zmianę jego ulubionej postaci, usunięcie i dodanie.

Sam podział „lista albo edycja” obejmuje przypadek dwóch i więcej dzieci. Zrzut jednego dziecka nie ma listy, a nadal miesza edycję, „Usuń” i „Dodaj profil”. Inna strona albo lista na labiryncie nie wynika z tej obserwacji: te miejsca zostały wcześniej odrzucone, a zgrzyt użytkownik widzi tylko w rogu.

## Confidence

**HIGH** — menu naprawdę składa te zadania, użytkownik nazwał ten stos, a wcześniejsze plany tłumaczą, czemu stos powstał i czego nie otwierać na nowo.

## Discussion decision

Lista przy jednym dziecku zachowuje się tak samo jak przy większej liczbie. Wiersz zostaje wyborem dziecka. Przed ikoną kosza jest ikona edycji z tooltipem „Edytuj”. Kosz dalej otwiera potwierdzenie usunięcia i nie wybiera dziecka. Ikona edycji otwiera następny widok tego samego rogu i pokazuje tylko ten profil.

Na liście nie ma postaci ani „Zapisz”. Nie ma widoku, na którym widać naraz kilka profili i edycję jednego z nich.

## What Changes for /10x-plan

Plan rozdziela listę i edycję tak, jak w „Discussion decision”: ta sama lista od jednego dziecka w górę, ikona edycji z tooltipem „Edytuj” przed koszem, osobny widok jednego profilu, lista bez edytora. Nie przenosi kosza z wiersza. Nie zakłada osobnej strony profili ani listy dzieci na labiryncie.

## References

- Source files: `src/components/WorksheetGenerator.tsx:42`, `:217`, `:480-682`; `src/lib/child-profiles.ts:87-97`; `context/foundation/prd.md` FR-007–FR-010
- GitHub issue: #28. Bez etykiety `roadmap-slice`. PRD i roadmapy bez zmian.
- Related research: brak
- Investigation tasks: 075da51f-0b16-4b70-9d2e-5e9c0ea1ee72, f0d2a659-65f3-45f9-be37-5030686fbfe6, 80e06fb7-a17f-4530-b538-4615a2f6ee93, f0578502-d12f-4068-a59e-da4535385a97
