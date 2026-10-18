# Poprawki paska poziomu — Plan Brief

> Full plan: `context/changes/level-bar-fixes/plan.md`

## What & Why

Po wdrożeniu poziomów (PR #40) zmiana poziomu przy gotowej kartce chowa labirynt i wraca do strony startowej, a na komputerze Drukuj spada do drugiego rzędu, bo pasek z nową kontrolką „Poziom:” nie mieści się w kolumnie 576 px. Użytkowniczka oczekuje, że poziom zachowuje się jak postać: kartka zostaje i przegenerowuje się do nowego poziomu, a Generuj i Drukuj stoją razem.

## Starting Point

`applyLevel` w `WorksheetGenerator.tsx` zeruje labirynt przy każdej zmianie poziomu, a cały widok kartki zależy od tego, czy labirynt istnieje. Pasek to jeden zawijany wiersz ok. 670–750 px na komputerze; na telefonie już dziś ma dwa rzędy.

## Desired End State

Przy widocznej kartce każda zmiana poziomu (pasek, profil) od razu pokazuje labirynt nowego poziomu, z aktywnym Drukuj. Gdy ułożenie się nie uda, kartka znika, pasek zostaje z komunikatem, a Drukuj jest wyszarzony. Na komputerze pasek ma rząd Postać + Poziom i pod nim Generuj + Drukuj, dla każdej postaci i poziomu.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Zmiana poziomu przy kartce | Przegenerowanie do nowego poziomu | Poziom ma działać jak postać, a na ekranie i w druku jest zawsze labirynt wybranego poziomu. |
| Nieudane ułożenie po zmianie | Kartka znika, komunikat, Drukuj wyszarzony, pasek zostaje | Nie da się wydrukować labiryntu innego poziomu niż na pasku, a strona nie skacze do startu. |
| Zmiana poziomu przez profil | Też przegenerowuje | Jedno zachowanie dla wszystkich źródeł zmiany poziomu. |
| Pasek na komputerze | Dwa rzędy: selektory, pod nimi Generuj i Drukuj | Mieści się przy najdłuższych nazwach bez obcinania, zmiany kolumny i rozmiaru przycisków. |
| Zakres | Dwie fazy, wybór poziomu w profilu osobno | Małe poprawki paska wchodzą od razu; profil to zmiana kontraktu FR-007/FR-009. |

## Scope

**In scope:**
- Przegenerowanie kartki przy zmianie poziomu z paska i przez profil
- Stan nieudanego ułożenia z wyszarzonym Drukuj
- Dwa rzędy paska na komputerze
- Testy Playwright i aktualizacja kontraktu druku

**Out of scope:**
- Wybór poziomu w profilu dziecka
- Szerokość kolumny, rozmiary przycisków, napisy na pasku
- Układ na telefonie, generator, zapis w `localStorage`

## Architecture / Approach

Widok kartki staje się osobnym stanem obok labiryntu: włącza go pierwsze udane Generuj, a `applyLevel` — jedyne miejsce zmiany poziomu — przy widocznej kartce od razu układa labirynt nowego poziomu. Pasek desktopu przejmuje podział na dwa rzędy, który telefon ma już dziś.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Przegenerowanie przy zmianie poziomu | Kartka zostaje i dostaje labirynt nowego poziomu; stan nieudany z wyszarzonym Drukuj | Ścieżka nieudanego ułożenia jest nieosiągalna normalnie — sprawdzenie ręczne z wymuszonym `null` |
| 2. Pasek w dwóch rzędach na komputerze | Generuj i Drukuj zawsze razem pod selektorami | Regresja układu telefonu — pilnują go istniejące testy Playwright |

**Prerequisites:** brak; worktree od `origin/main` po PR #40.
**Estimated effort:** mała — jeden komponent, jeden nowy plik testu e2e, jedna linia kontraktu druku.

## References

- Zarchiwizowany plan poziomów: `context/archive/2026-10-11-maze-difficulty-levels/plan.md`
- Pasek i zmiana poziomu: `src/components/WorksheetGenerator.tsx:82-187`
