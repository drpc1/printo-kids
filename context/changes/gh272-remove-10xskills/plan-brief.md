# Usunięcie materiału kursu 10x z publicznego repo — Plan Brief

> Full plan: `context/changes/gh272-remove-10xskills/plan.md`
> Frame brief: `context/changes/gh272-remove-10xskills/frame.md`

## What & Why

Problemem jest cel „treść kursu niedostępna publicznie”, a nie „pliki w dwóch gałęziach”. Materiał jest w pierwszym commicie, w około 48 gałęziach, w tagu i w refach PR, więc samo usunięcie z `main` i `prod` niczego nie zabezpiecza. Repo musi zostać publiczne, więc przepisujemy historię, a pliki zostają u użytkowniczki lokalnie.

## Starting Point

Skille `10x-*` (93 ścieżki), reguła `10x-course.mdc`, prompty lekcji i pliki `.10x-cli*` są w historii od `7926d49` (2026-09-27). Wszystkie gałęzie na origin poza `prod` są zmergowane do `main`. Rulesety blokują force-push. W systemie nie ma `filter-repo` ani BFG, jest tylko `git filter-branch`.

## Desired End State

Świeży klon origin nie ma żadnego pliku kursu w historii. Na origin zostają tylko `main`, `prod` i tag, a CI odrzuca drzewo z plikami kursu. Lokalnie skille dalej działają w Cursorze i Claude Code, każdy worktree stoi na nowej historii, a stara historia jest w bundle poza repo.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Prywatne repo czy przepisanie | Przepisanie historii | Repo musi zostać publiczne (darmowe CI i rulesety na GitHub Free) | Frame |
| GitHub Support | Bez | Robimy tylko to, co da się samemu; stare PR-y zostają | Frame |
| Pliki lokalnie | Zostają na dysku, ignorowane | Użytkowniczka dalej używa skilli | Frame |
| Zakres plików | Skille `10x-*`, `10x-course.mdc`, `.10x-cli*`, cały `.cursor/prompts/` | Prompty to treść lekcji kursu | Plan |
| Import w `CLAUDE.md` | Zostaje | Działa lokalnie; w klonie wskazuje brakujący plik | Plan |
| Gałęzie na origin | Usunąć wszystkie poza `main`/`prod` | Wszystkie są zmergowane, a zawierają skille | Plan |
| gh271 | Zmergować do `main` przed kopią | Ma iść na `prod` z gh272; przepisanie obejmie je bez rebase | Plan |
| S-33 | Zostaje lokalnie, `rebase --onto` po przepisaniu; PR do `main` po wydaniu gh271 + gh272 | Ma zostać na `main` bez `prod`, a wydanie `main` → `prod` zabrałoby ją | Plan |
| Narzędzie | `git filter-branch --index-filter`, jeden przebieg dla `main`, `prod` i tagu | Jedyne dostępne; jeden przebieg zachowuje wspólne SHA merge | Plan |
| Ochrona przed powrotem | `.gitignore` + krok w CI | PR ze starej gałęzi nie przejdzie | Plan |

## Scope

**In scope:**
- Przepisanie `main`, `prod` i `v2026.11.01` bez plików kursu.
- Usunięcie zmergowanych gałęzi z origin.
- Blokada w `.gitignore` i CI.
- Przestawienie lokalnych worktree, przeniesienie S-33 i usunięcie starych gałęzi.
- Kopia zapasowa: bundle, pliki kursu i rulesety.

**Out of scope:**
- GitHub Support (`refs/pull/*`, cache).
- Prywatne repo.
- Ślady w `context/`.
- Usuwanie importu z `CLAUDE.md`.
- Hooki i `playwright-cli`.

## Architecture / Approach

Kopia poza repo, potem przepisanie w świeżym klonie w katalogu tymczasowym. Weryfikacja: brak ścieżek w historii, drzewa różnią się tylko nimi, a testy i build przechodzą. Dopiero wtedy force-push przy chwilowo wyłączonych rulesetach (przywracanych z zapisanego JSON). Na końcu lokalnie: wyjęcie plików kursu z indeksu przed resetem lub rebase, żeby zostały na dysku.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 0. gh271 na `main` | Brak otwartej pracy na origin | Push po zrobieniu kopii zostałby nadpisany |
| 1. Kopia i inwentarz | Bundle, kopia plików kursu, JSON rulesetów | Niepełna kopia, gdy brakuje `fetch --all` |
| 2. Przepisanie w klonie | Nowe `main`/`prod`/tag + commit blokady | Inna struktura merge `prod`, gdy refy są przepisywane osobno |
| 3. Publikacja | Czysty origin, rulesety z powrotem, deploy | Rulesety zostawione wyłączone |
| 4. Porządki lokalne | 11 worktree na nowej historii, S-33 przeniesiona | `reset --hard` kasuje pliki, jeśli nie zostały najpierw odśledzone |

**Prerequisites:** gh271 zmergowane do `main`; S-33 niepushowana. Prawa admina do repo (rulesety). Brak pushy od fazy 1 do końca fazy 3.
**Estimated effort:** 1–2 sesje. Faza 3 wymaga zgody użytkowniczki tuż przed force-pushem.

## Open Risks & Assumptions

- Zamknięte PR-y i linki po SHA nadal pokazują stare commity z plikami kursu (zaakceptowane).
- Wyszukiwarka kodu GitHuba może pokazywać stare wyniki przez kilka godzin.
- Po force-pushu job `changes` w CI nie znajdzie starego SHA i uruchomi pełne `ci`/`smoke`/`e2e`. To zamierzone.
- Force-push uruchamia deploy staging i produkcji. Kod aplikacji się nie zmienia.

## Success Criteria (Summary)

- Nikt bez kursu nie znajdzie skilli ani reguły kursu w gałęziach, tagu, historii ani wyszukiwaniu kodu repo.
- Aplikacja na staging i produkcji działa bez zmian, a rulesety i CI pilnują jak wcześniej.
- Użytkowniczka dalej używa skilli lokalnie, gh271 jest w `main`, a S-33 czeka lokalnie na nowej historii na PR po wydaniu.
