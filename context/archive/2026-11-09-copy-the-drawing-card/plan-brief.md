# S-35 Karta „Skopiuj rysunek na kratce” — Plan Brief

> Full plan: `context/changes/copy-the-drawing-card/plan.md`
> Research: `context/changes/copy-the-drawing-card/research.md`

## What & Why

Dokładamy dziewiąty rodzaj karty: dwie kratki tej samej siatki obok siebie, w lewej czarna sylwetka obiektu z katalogu szablonów, prawa pusta; dziecko przerysowuje sylwetkę. Rodzic wybiera poziom (łatwy / średni / trudny) i kategorię, a profil pamięta oba ustawienia. To roadmapa S-35 (US-27, US-28, FR-037, FR-038).

## Starting Point

Sylwetkę daje gotowy `nonogramImage` na obiektach katalogu szablonów, a pipeline karty (kontrakt, silnik, `CardPage`, ustawienia profilu) jest sprawdzony na S-34 i nonogramie. Brakuje układu dwóch siatek na A4.

## Desired End State

Na `/copy-drawing` Generuj daje kartę A4 z poleceniem w dymku postaci i dwiema kratkami (10 / 7 / 5 mm), z marginesem 10 mm i bez numerów. Karta jest w katalogu z miniaturą i plakietką poziomu, a „Jak to działa” ją opisuje.

## Key Decisions Made

| Decision        | Choice                                                      | Why (1 sentence)                                                    | Source                    |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| Układ kratek    | Obok siebie na każdym poziomie                              | Wiersze obu kratek są na jednej wysokości, a 10/7/5 mm się mieszczą | Plan (makieta 2026-11-09) |
| Numery          | Brak                                                        | Czyste kratki, trudny zostaje przy 5 mm                             | Plan (makieta)            |
| Trudny          | Siatka 18×24, kratka 5 mm                                   | Mieści się dokładnie w 190 mm; zapas: 12×15 po wydruku              | Plan (makieta)            |
| Źródło sylwetki | `nonogramImage` + `symmetryTemplatesFor`                    | Bez zmian w katalogu współdzielonym                                 | Research                  |
| Ustawienia      | `level` i `category`, bez kolorów i bez „Pokaż rozwiązanie” | PRD US-27 i US-28                                                   | PRD                       |
| Id i strona     | `kopiuj`, `/copy-drawing`                                   | Wzorzec `niepasuje` i `/odd-one-out`                                | Research                  |

## Scope

**In scope:** PRD (Open Questions 13), moduł `src/lib/copy-drawing/`, strona i island, rejestracja w katalogu i profilu, miniatura, testy jednostkowe i e2e.

**Out of scope:** numery wierszy i kolumn, inne układy, ocena rysunku dziecka, zmiany w katalogu szablonów, opis poziomów w „Jak to działa” (S-37).

## Architecture / Approach

Karta niesie `pattern` (`boolean[][]`) i zapisany szablon z wariantami; `problems` sprawdza rozmiar siatek, niepustość i zgodność z `nonogramImage`. Generator losuje szablon i warianty (≤ 20 prób, potem `CardExhausted`). `layout.ts` i `sheet.ts` dają pozycje dwóch siatek, wspólne dla strony i miniatury.

## Phases at a Glance

| Phase                       | What it delivers                                   | Key risk                                           |
| --------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| 1. PRD zgodne z makietą     | Zamknięte Open Questions 13, status `planning`     | Prettier przeformatuje tabelę roadmapy             |
| 2. Logika karty             | `src/lib/copy-drawing/` z testami, bez rejestracji | Trudny na granicy 190 mm (błąd zmiennoprzecinkowy) |
| 3. Strona, katalog i profil | Karta w produkcie, miniatura, e2e, wydruk          | Kratka 5 mm na papierze i wysokość druku na iOS    |

**Prerequisites:** brak (S-33 i S-34 są w `main`).
**Estimated effort:** ~3 sesje, po jednej na fazę.

## Open Risks & Assumptions

- Kratka 5 mm na trudnym może być za mała na papierze; wtedy trudny wraca do planu jako 12×15.
- Szerokie obiekty zajmowałyby górną część siatki, więc karta wyśrodkowuje sylwetkę w pionie (decyzja z przeglądu planu); na papierze potwierdza to wydruk.
- Generator musi poddawać się szybko przy wyczerpanej kategorii (limit 5 s z PRD).

## Success Criteria (Summary)

- Rodzic generuje, podgląda i drukuje kartę z dwiema kratkami na jednej stronie A4, także z telefonu.
- Profil pamięta poziom i kategorię; katalog pokazuje miniaturę i plakietkę.
- Wszystkie bramki (`npm test`, lint, depcruise, `astro check`, build, smoke, e2e) są zielone.
