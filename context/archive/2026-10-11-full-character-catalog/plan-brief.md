# Pełny katalog postaci — Plan Brief

> Full plan: `context/changes/full-character-catalog/plan.md`

## What & Why

Rodzic ma wybrać dowolną postać z katalogu jedenastu, na karcie i przy profilu. Dziś lista ma trzy postacie, a okno profilu wkleja całą kolumnę wierszy. Poziom trudności i kolejne ustawienia dojdą w następnych plasterkach, więc profil nie może rosnąć o każdą opcję.

## Starting Point

`CHARACTER_CHOICES` ma „Bez postaci”, Samochodzik, Rakietę i Dinozaura. Osiem PNG leży w `public/characters/` i nie wchodzi do katalogu. Pasek jest jedną kontrolką bez limitu wysokości dialogu. Profil pokazuje wszystkie wiersze naraz, a nowy profil startuje od postaci z paska. Zapis ostatniej postaci i profilu bierze dozwolone id z katalogu.

## Desired End State

Na pasku i w profilu rodzic otwiera jedną listę: „Bez postaci” i jedenaście postaci. Na oknie o wysokości telefonu dochodzi do Wróżki przewinięciem tej listy. W profilu na wejściu widać zapisaną ulubioną albo, przy nowym profilu, „Bez postaci”. Utworzenie bez zmiany kontrolki zapisuje brak postaci i pasek karty przechodzi na „Bez postaci”.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Lista na wejściu | Jedna kontrolka, lista przewija się po otwarciu | Okno profilu nie może rosnąć z katalogiem ani z przyszłym poziomem |
| Nowy profil | Start od „Bez postaci” | Nic nie jest jeszcze zapisane, więc postać z paska nie wchodzi do szkicu |
| Testy | Faza 1 przez `/10x-tdd`, faza 2 przez `/10x-implement` | Kontrakt id i plików da się zbadać na czerwono, a widoczność listy nie ma taniego testu w `npm test` |
| Kolejność | Kolejność z PRD, „Bez postaci” pierwsza | Nazwy i porządek są w US-03 |
| Zapis lokalny | Moduły `last-used` i `child-profiles` bez zmian | Już przyjmują id przekazane z katalogu |
| Poziom trudności | Zostaje w S-07 | Ten plasterek tylko zostawia krótkie wejście profilu |

## Scope

**In scope:**

- Dwanaście wierszy katalogu i osiem istniejących PNG
- Czerwony test id, etykiet, ścieżek i obecności plików
- Jedna kontrolka na wejściu profilu, przy ulubionej i przy tworzeniu
- Przewijanie otwartej listy na pasku i w profilu
- Szkic nowego profilu równy „Bez postaci”

**Out of scope:**

- Poziom trudności (S-07) i telefon poza samą listą postaci (S-09)
- Własny obrazek rodzica (US-02)
- Playwright, migawka pikseli, zmiana testów czterech id w zapisie lokalnym
- Znacznik 30 na 30, geometria karty, druk

## Architecture / Approach

Jedna tablica `CHARACTER_CHOICES` zasila pasek, panel profilu i listę dozwolonych id. Lista w profilu wchodzi w panel tego samego dialogu, bez drugiego dialogu w środku. Dialog paska dostaje limit wysokości, który okno profilu już ma.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Katalog jedenastu, test-first | Dwanaście wierszy i zielony kontrakt plików | Po tej fazie profil nadal pokazuje kolumnę, a dialog paska może ucinać listę |
| 2. Jedna kontrolka i przewijana lista | Krótkie wejście profilu i lista, która dochodzi do Wróżki | Utworzenie profilu bez zmiany kontrolki przełącza pasek na „Bez postaci” |

**Prerequisites:** S-04 i S-06 są done. PNG są na dysku. `npm test` odpala `node --test`.
**Estimated effort:** około dwóch sesji, jedna na fazę.

## Open Risks & Assumptions

- Prawa do publikacji szerszego katalogu zostają otwartym pytaniem PRD. Planowanie ich nie czeka.
- Zgodność obrazka z etykietą (czy `kot.png` jest kotem) wychodzi dopiero przy ręcznym spojrzeniu. Test pilnuje ścieżki, nie pikseli.
- Faza 1 nie domyka widoku profilu. Plasterek jest gotowy po fazie 2.

## Success Criteria (Summary)

- Rodzic wybiera dowolną z jedenastu postaci na pasku, a na karcie stoi właśnie ta postać.
- W profilu na wejściu widać jedną zapisaną postać albo „Bez postaci”, a do Wróżki dochodzi przewinięciem otwartej listy.
- Ostatnio użyta postać i ulubiona profilu przyjmują nowe id. Id spoza katalogu wraca do „Bez postaci”.
