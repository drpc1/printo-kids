---
date: 2026-10-31
researcher: Claude
git_commit: ce54083
branch: claude/github-issues-214-210-7596e9
repository: printo-kids
topic: "GitHub 214: czy dwa testy phone-settings-rows są nadal czerwone na phone-360?"
tags: [research, e2e, phone-settings-rows, phone-360]
status: complete
last_updated: 2026-10-31
last_updated_by: Claude
---

# Research: GitHub 214, testy phone-settings-rows na phone-360

## Research Question

Dwa testy w `tests/e2e/phone-settings-rows.spec.ts` miały padać na `phone-360` (także na `main`, commit 27cd590): `sudoku symbol text lines up with Postać before Generuj` (linia 53) i `nonogram category gap matches the row above before Generuj` (linia 91). Czy zmienił się układ paska, czy test jest zbyt czuły, i czy błąd istnieje dziś?

## Summary

- Na HEAD (ce54083) obu testów z zgłoszenia nie ma. Plik ma jeden test na stronę karty (`<karta> settings row keeps its rules before and after the first card`, `tests/e2e/phone-settings-rows.spec.ts:134`), sześć testów w sumie.
- Nazwy z zgłoszenia i numery linii 53 i 91 pasują do wersji pliku z commita f0c974d (`git grep` w f0c974d). Commit 1551fcb (gh192-pages-sceleton) zastąpił je testem wspólnego wiersza kontrolek.
- Commit 27cd590 nie zawiera gh192 (`git merge-base --is-ancestor 1551fcb 27cd590` kończy się niepowodzeniem), więc zgłoszenie opisuje stan sprzed PR 207 (merge d13b480). HEAD zawiera 27cd590 i gh192.
- Odtworzenie na HEAD: `E2E_PORT=4399 npx playwright test tests/e2e/phone-settings-rows.spec.ts --project=phone-360` daje 6 passed (38,8 s), z własnym buildem, nie z cudzym serwerem na 4321.
- Wniosek: dla tej inspected ścieżki (HEAD, phone-360, ten plik) błąd się nie odtwarza. Zgłoszenie dotyczy kodu sprzed gh192; przyczyna to prawdopodobnie stary układ paska sudoku i nonogramu przed wspólnym wierszem, ale tego nie sprawdzono.

## Detailed Findings

### Spec dziś

- Test na stronę karty sprawdza dwie reguły na phone-360 przed i po pierwszej karcie: tekst pierwszej kontrolki w każdej linii zaczyna się tam, gdzie tekst „Postać”, i odstępy między liniami są równe (`tests/e2e/phone-settings-rows.spec.ts:1-8`, `:134-158`).
- Sudoku przechodzi w 6×6 z przyciskami „Kształty” (`:119-130`), nonogram z kontrolkami Postać, Poziom, Kategoria (`:131`).

### Historia

- f0c974d (phone-settings-rows p1) wprowadził dwa osobne testy o nazwach ze zgłoszenia.
- 1551fcb i fd834c7 (gh192) wprowadziły wspólny komponent strony i test na wszystkich stronach; 8772d38 dopisał znane ograniczenie testu odstępów.

## Code References

- `tests/e2e/phone-settings-rows.spec.ts:134` - test na stronę karty
- `playwright.config.ts:11` i `reuseExistingServer` - lokalnie używany jest serwer z portu 4321, jeśli już działa; `E2E_PORT` wymusza build bieżącego drzewa

## Architecture Insights

Lokalny `reuseExistingServer` może podstawić kod z innego checkoutu. Zgłoszenie mogło powstać w worktree sprzed gh192 (gałąź gh114 nie zawiera 1551fcb), co zgadza się z nazwami testów ze starej wersji pliku.

## Historical Context (from prior changes)

- `context/archive/2026-10-29-phone-settings-rows/plan.md` - pierwotny test i reguły wiersza
- `context/archive/2026-10-30-gh192-pages-sceleton/plan.md` - przebudowa na wspólny wiersz kontrolek i test na wszystkich stronach

## Related Research

`context/archive/2026-10-30-gh192-pages-sceleton/research.md`

## Open Questions

- Nie sprawdzono, czy stara wersja pliku (f0c974d) faktycznie pada na układzie z 27cd590. Wymagałoby osobnego worktree i buildu.
- Zgłoszenie podaje 253 zielone i 2 czerwone testy na pozostałych projektach Chromium; nie uruchamiano pełnego zestawu, tylko phone-360 dla tego pliku.
- Czy zamknąć #214 jako już naprawione przez gh192, czy dodać test regresji, to decyzja do planu.

## Follow-up (2026-10-31): stara wersja zweryfikowana

W tymczasowym worktree na commicie 27cd590 (detached, własny build, `E2E_PORT=4398`) komenda `npx playwright test tests/e2e/phone-settings-rows.spec.ts --project=phone-360` dała 2 failed:

- `sudoku symbol text lines up with Postać before Generuj` (linia 53): „Kształty is not the leftmost button on its line”, oczekiwane x = 183,625, jest 24. Te same liczby co w zgłoszeniu.
- `nonogram category gap matches the row above before Generuj` (linia 91): `Postać and Poziom share a line` (oczekiwane false, jest true; linia 108 starego pliku).

Wniosek (dla phone-360, pliku phone-settings-rows i tych dwóch commitów): błąd był prawdziwy na 27cd590 i nie występuje na ce54083, który zawiera gh192 (1551fcb). Zgłoszenie #214 jest naprawione przez gh192; uzupełnia to pierwsze Open Question powyżej. Nie ustalono, który konkretny commit gh192 zmienił wynik, tylko że stan przed i po różni się wynikiem. Worktree tymczasowy został usunięty.
