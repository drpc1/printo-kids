# Usunięcie znaku zapytania z nazwy „Kto ma więcej” — skrót planu

> Pełny plan: `context/changes/gh383-kto-ma-wiecej/plan.md`

## What & Why

Nazwa karty pieniędzy traci znak zapytania. Rodzic ma widzieć „Kto ma więcej” w katalogu, na „Jak to działa”, w profilu i na stronie karty. Ta sama pisownia wchodzi do żywego opisu produktu, żeby następna praca nie wróciła do starej nazwy z PRD. Zgłoszenie: GitHub #383.

## Starting Point

Tytuł rodzaju `pieniadze` w `src/lib/cards.ts` zasila katalog, listę rodzajów, okno profilu, nagłówek `/money` i tytuł przeglądarki. Trzy napisy są obok, na sztywno: akapit poziomów, opis strony i `aria-label` arkusza. Profil nie zapisuje tytułu. Polecenie na kartce to inne zdanie: „Gdzie jest więcej pieniędzy?”.

## Desired End State

W aplikacji i w żywym kontrakcie karta nazywa się „Kto ma więcej”. Kartka, miniatura, komentarze, archiwum i zdania historyczne (wejście do zakresu 2026-11-01, zamknięte M-5, wynik Strykera) zostają przy starej pisowni. Kolejność w katalogu się nie zmienia.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Złożoność | LOW, jedno pytanie | Napis w czterech miejscach źródła, bez modelu danych |
| Dokumentacja | Żywy kontrakt | PRD, glosariusz, pytanie 6 roadmapy i ryzyko 10 mają nie odstawać od ekranu |
| Polecenie na kartce | Zostaje ze znakiem zapytania | To instrukcja dla dziecka, nie nazwa karty |
| Historia | Zostaje | Archiwum, M-5, S-33, wpis z 2026-11-01 i §5a są świadectwem tamtej pisowni |
| Kolejność prac | Najpierw ekran, potem dokumenty | Ekran da się sprawdzić testem, zanim ktoś ruszy pliki, w których historia sąsiaduje z kontraktem |

## Scope

**In scope:**

- `title` w `src/lib/cards.ts` i trzy napisy na sztywno (`how-it-works.astro`, `money.astro`, `MoneyGenerator.tsx`)
- Testy, które asertują nazwę karty
- Żywe zdania PRD, wiersz glosariusza, otwarte pytanie 6 roadmapy, ryzyko 10 planu testów

**Out of scope:**

- Polecenie na kartce i miniatura
- Komentarze w kodzie
- Archiwum, shape-notes, snapshot domeny, historia M-5 / S-33, zamknięte pytanie 13, §5a planu testów

## Architecture / Approach

Ekrany, które czytają `kind.title`, zmieniają się same. Trzy kopie na sztywno i ich testy idą razem z rejestrem. W PRD, roadmapzie i planie testów zamiana jest wybiórcza: te same pliki trzymają żywy kontrakt i historię.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Nazwa w aplikacji | Nowa nazwa na ekranach i zielone testy, które ją trzymają | Hurtowa zamiana w teście postaci ruszyłaby polecenie na kartce |
| 2. Żywy kontrakt | PRD, glosariusz, pytanie 6 i ryzyko 10 bez znaku zapytania | Hurtowa zamiana w tych plikach starłaby historię |

**Prerequisites:** `main` z kartą już w katalogu. Brak migracji danych.
**Estimated effort:** jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Sąsiedztwo w katalogu sprawdzone na `localeCompare` Node z `"pl"`, nie w przeglądarce. O kolejności decydują litery przed znakiem zapytania, więc przeglądarka nie powinna przesunąć karty.
- W glosariuszu cudzysłów zamykający jest prosty (`"`). Plan zdejmuje tylko `?`.

## Success Criteria (Summary)

- Rodzic nie widzi znaku zapytania w nazwie karty na stronie głównej, na „Jak to działa”, w profilu ani na `/money`.
- Polecenie na wygenerowanej kartce nadal brzmi „Gdzie jest więcej pieniędzy?”.
- US-23 i glosariusz używają nowej nazwy, a akapit z 2026-11-01 zostaje przy starej.
