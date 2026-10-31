# Podpis „Ulubiona postać” na liście z edycji profilu — Plan Brief

> Full plan: `context/changes/gh167-favourite-character/plan.md`

## What & Why

W edycji profilu lista postaci otwiera się bez widocznego podpisu. Tytuł „Wybierz postać” słyszy tylko czytnik ekranu, więc na ekranie nie wiadomo, do czego lista służy. Issue 167 chce w tym jednym miejscu etykietę „Ulubiona postać”.

## Starting Point

Edycja profilu i „Dodaj profil” dzielą jeden panel w `src/components/ProfileCorner.tsx`: ukryty tytuł „Wybierz postać” i wspólne wiersze postaci. Pasek karty ma własną kopię tego ukrytego tytułu. Przycisk w edycji pokazuje samą nazwę postaci i nazywa się `Postać: …`.

## Desired End State

Po otwarciu listy z edycji nad wierszami widać „Ulubiona postać”, i czytnik ogłasza te same słowa. Nie ma drugiego tytułu „Wybierz postać”. Lista przy tworzeniu profilu i lista na pasku zostają bez tego napisu.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Nazwa dla czytnika | Widoczny tytuł „Ulubiona postać” zastępuje „Wybierz postać” tylko na liście z edycji | Wzrok i czytnik dostają jedną nazwę okna |
| Zasięg | Tylko panel `favorite-list` | Issue 167 zostawia tworzenie profilu i pasek jako osobne miejsca |
| Sposób | Jeden `DialogTitle`, bez drugiego podpisu | Drugi podpis został odrzucony, bo okno miałoby dwie nazwy |
| Wygląd | Istniejący styl `DialogTitle` (`text-lg`, semibold), po zdjęciu `sr-only` | To już jest tytuł tego okna, nie nowy rodzaj etykiety |
| Dowód | Asercje Playwright w obecnych specyfikacjach profilu i paska | Te pliki już otwierają wszystkie trzy listy |
| Fazy | Jedna faza | Test jest dowodem tego samego kontraktu |

## Scope

**In scope:**

- Widoczny tytuł „Ulubiona postać” na liście otwartej z edycji profilu
- Test, że tworzenia profilu i paska ten tytuł nie dotyczy

**Out of scope:**

- Podpis przy przycisku „Postać: …” na panelu edycji
- Tytuły listy tworzenia profilu i listy paska
- Zdanie o jawnej zmianie postaci, katalog, zapis i `localStorage`

## Architecture / Approach

Warunek na `panel` rozdziela tytuł wewnątrz istniejącej gałęzi `favorite-list` / `draft-list`. Wiersze postaci zostają wspólne. `CharacterChoiceControl` się nie zmienia.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Widoczny tytuł listy z edycji | Tytuł „Ulubiona postać” tylko na liście z edycji oraz test trzech powierzchni | Wspólna gałąź z listą tworzenia profilu podpisze też ją, jeśli warunek obejmie zły panel |

**Prerequisites:** Okno profilu i pasek z jawną ulubioną są już na `main`. Nowe dane nie są potrzebne.

**Estimated effort:** Jedna krótka sesja, jedna faza.

## Open Risks & Assumptions

- Tytuł ma rozmiar obecnego `DialogTitle`, nie mniejszego podpisu w `muted-foreground`. Tak wygląda nazwa tego okna.
- Dodatkowy wiersz mieści się w przewijanym oknie. Na telefonie sprawdza to krok ręczny, nie nowy test układu.

## Success Criteria (Summary)

- W edycji profilu lista postaci pokazuje jeden tytuł „Ulubiona postać”.
- Czytnik ogłasza te same słowa, bez zostawionego „Wybierz postać”.
- „Dodaj profil” i pasek karty tego napisu nie pokazują.
