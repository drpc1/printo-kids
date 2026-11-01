# Usunięcie materiału kursu 10x z publicznego repo — plan implementacji

## Overview

Wycinamy materiał kursu 10xDevs z całej historii `main`, `prod` i tagu `v2026.11.01` w publicznym repo `drpc1/printo-kids`, usuwamy z origin pozostałe (zmergowane) gałęzie i blokujemy powrót tych plików. Wszystko zostaje u użytkowniczki lokalnie. Bez prośby do GitHub Support (decyzja 2026-11-01). Źródło ujęcia: `frame.md`.

## Current State Analysis

- Materiał kursu jest w pierwszym commicie `7926d49` (2026-09-27) i w trzech kolejnych (`a85113a`, `0149e01`, `e6a5e94`). W historii `main`/`prod` są 93 ścieżki `.cursor/skills/10x-*` i 9 innych plików kursu. Innych nazw (przemianowanych, starych) nie ma.
- Wszystkie gałęzie na origin poza `prod` są zmergowane do `main` (`git branch -r --no-merged origin/main` → tylko `origin/prod`). `prod` jest 2 commity przed i 4 za `main`. Tag `v2026.11.01` wskazuje `f20d86a` na `prod`.
- Rulesety: `25797959` „main: checki, pominiecie tylko przy pull request” i `26293197` „prod: PR, checki, merge commit”. Blokują force-push.
- Narzędzia: brak `git filter-repo`, Pythona i Javy (więc też BFG). Jest wbudowany `git filter-branch`.
- Lokalnie jest 11 worktree. Otwarta praca:
  - `claude/s32-coins-comparison-494c51` (S-33 „Kto ma więcej?”): 8 commitów, gotowe, lokalna (nigdy niepushowana). Ma trafić na `main`, ale na razie nie na `prod`.
  - gh271 (`claude/gh271-web-analytics-cc1c9b`): 2 commity, gotowe do PR.
  - Kilka starych, niezmergowanych gałęzi lokalnych (`chore/archive-gh180-no-character`, `gh180-no-character`, `sequence-shape-colors`…).
- Kopia skilli poza repo już istnieje: `C:\Users\agapp\.claude\skills\` ma wszystkie 28 skilli `10x-*` i `playwright-cli`.
- `CLAUDE.md` importuje `@.cursor/rules/10x-course.mdc`. `.gitignore:42-44` ignoruje junction `.claude/skills`.

## Desired End State

- `git log --all -- <ścieżki kursu>` na świeżym klonie origin zwraca pusto. Origin ma tylko `main`, `prod` i tag `v2026.11.01`.
- Drzewo `main` i `prod` po przepisaniu różni się od starego tylko brakiem ścieżek kursu, plus jeden commit na `main` (`.gitignore` i krok CI).
- CI odrzuca każde drzewo, w którym są pliki kursu, więc gałąź ze starą historią nie wróci przez PR.
- Rulesety działają jak przed zmianą. Staging i produkcja deployują się z nowych SHA.
- Lokalnie pliki kursu są na dysku (nieśledzone, ignorowane). Każdy worktree stoi na nowej historii; gh271 jest w `main`, a S-33 jest przeniesiona na nowy `main` i czeka lokalnie na PR (po wydaniu gh271 + gh272 na `prod`). Pełna stara historia jest w bundle poza repo.

### Key Discoveries:

- `.github/workflows/ci.yml:20-34`: job `changes` czyta `scripts/context-only-diff.mjs` z `github.event.before`. Po force-pushu stary SHA nie jest w klonie, krok się wywali i `ci`/`smoke`/`e2e` uruchomią się w całości (`if: always() && needs.changes.result != 'success'`). To jest zamierzone zachowanie, a nie błąd do naprawy.
- Ścieżka `.claude/skills` jest już w `.gitignore`; nowe wpisy idą obok niej.
- `.cursor/skills/playwright-cli/` nie jest w `.cursor/.10x-cli-manifest.json`, więc zostaje w repo.

## What We're NOT Doing

- Bez GitHub Support. Zamknięte PR-y (`refs/pull/*`) i linki po SHA nadal pokazują stare commity z plikami kursu; to znane, zaakceptowane ograniczenie.
- Nie ustawiamy repo jako prywatnego (musi być publiczne; patrz `frame.md`).
- Nie ruszamy śladów w `context/` (35 plików wspomina nazwy skilli, żaden nie cytuje ich treści).
- Nie usuwamy importu `@.cursor/rules/10x-course.mdc` z `CLAUDE.md` (decyzja: zostaje, działa lokalnie).
- Nie usuwamy `.cursor/hooks/`, `.claude/hooks/`, `commit-pr-moments.mdc` ani `playwright-cli`.
- Nie przepisujemy starych gałęzi, tylko je usuwamy z origin.

## Implementation Approach

Przepisanie robimy w świeżym klonie w katalogu tymczasowym poza repo, a nie w checkoutcie z worktree, żeby niczego lokalnego nie ruszyć przed weryfikacją. Jeden przebieg `git filter-branch --index-filter` dla `main`, `prod` i tagu naraz, żeby wspólne commity (merge z `main` do `prod`) dostały te same nowe SHA. Publikacja jest osobną fazą z jawną zgodą użytkowniczki tuż przed force-pushem. Porządki lokalne idą na końcu: najpierw wyjęcie plików kursu z indeksu, potem reset lub rebase, żeby `git reset --hard` nie skasował plików z dysku.

**Ścieżki do usunięcia (jedna lista dla filtra, `.gitignore` i kroku CI):**

- `.cursor/skills/10x-*`
- `.cursor/rules/10x-course.mdc`
- `.cursor/prompts/` (cały katalog: `m1l5-*`, `m3l2-ad-hoc-testing.md`, `skill-explainer.md`)
- `.10x-cli.json`
- `.cursor/.10x-cli-manifest.json`

## Critical Implementation Details

- **Kolejność w fazie 3.** Najpierw zapisz rulesety, potem je wyłącz, zrób force-push, usuń gałęzie i dopiero wtedy przywróć rulesety. Nie zostawiaj repo z wyłączonymi rulesetami po zakończeniu sesji. Ruleset przywraca się dokładnie z zapisanego JSON, a nie z pamięci.
- **Zamrożenie pushy.** Od zrobienia bundle (faza 1) do końca fazy 3 nic nie trafia na origin, bo zostałoby nadpisane. gh271 musi być zmergowane do `main` przed fazą 1. S-33 nie jest pushowana do końca fazy 4.
- **Reset lokalny.** Przed `reset --hard` albo `rebase` w każdym worktree najpierw `git rm -r --cached --ignore-unmatch <ścieżki>`, żeby pliki stały się nieśledzone. Wtedy reset ich nie usunie, a nowy `.gitignore` je ukryje.

## Phase 0: Warunek wstępny — gh271 na `main`

### Overview

gh271 (2 commity) jest gotowe i ma pójść na `prod` razem z gh272, więc wchodzi do `main` zwykłym PR przed kopią. S-33 (`claude/s32-coins-comparison-494c51`) ma zostać na `main` bez wydania na `prod`, więc NIE wchodzi teraz do `main`: inaczej następne wydanie `main` → `prod` zabrałoby ją razem z gh271 i gh272. Zostaje lokalnie i jest przenoszona w fazie 4.

### Changes Required:

#### 1. gh271

**File**: worktree `competent-gould-c2ba22` (`claude/gh271-web-analytics-cc1c9b`)

**Intent**: Push, PR do `main` i merge normalną ścieżką (CI zielone).

**Contract**: Po merge `git branch -r --no-merged origin/main` zwraca tylko `origin/prod`, a `git rev-list --count origin/main..claude/gh271-web-analytics-cc1c9b` = 0.

### Success Criteria:

#### Automated Verification:

- PR gh271 zmergowany do `main`, CI zielone
- Na origin brak niezmergowanych gałęzi poza `prod`: `git fetch && git branch -r --no-merged origin/main`

#### Manual Verification:

- Użytkowniczka potwierdza, że nie ma innych zmian do wypchnięcia przed zamrożeniem

---

## Phase 1: Kopia i inwentarz

### Overview

Pełna kopia starej historii i plików kursu poza repo, zanim cokolwiek zostanie przepisane.

### Changes Required:

#### 1. Bundle całej historii

**File**: `C:\Users\agapp\printo-kids-backup\printo-kids-pre-gh272.bundle` (poza repo)

**Intent**: Zachować wszystkie lokalne i zdalne refy w jednym pliku, z którego da się odtworzyć stan sprzed zmiany (rollback i dostęp do starych gałęzi lokalnych).

**Contract**: `git fetch --all --tags`, potem `git bundle create … --all` z głównego checkoutu `C:\Users\agapp\printo-kids`; `git bundle verify` przechodzi.

#### 2. Kopia plików kursu

**File**: `C:\Users\agapp\printo-kids-backup\course-files\` (poza repo)

**Intent**: Kopia plików z listy ścieżek w obecnej wersji, niezależnie od `~/.claude/skills`.

**Contract**: Ta sama struktura katalogów co w repo; liczba plików = `git ls-files <ścieżki> | wc -l` (102).

#### 3. Zapis rulesetów

**File**: `C:\Users\agapp\printo-kids-backup\rulesets\25797959.json`, `26293197.json`

**Intent**: Dokładna kopia konfiguracji do przywrócenia w fazie 3.

**Contract**: `gh api repos/drpc1/printo-kids/rulesets/<id>` zapisane w całości.

### Success Criteria:

#### Automated Verification:

- `git bundle verify` na bundle przechodzi i wylicza refy `main`, `prod`, tag i wszystkie gałęzie
- Liczba plików w `course-files` równa liczbie z `git ls-files` dla listy ścieżek
- Oba pliki JSON rulesetów istnieją i zawierają `"rules"`

#### Manual Verification:

- Użytkowniczka widzi folder `printo-kids-backup` i potwierdza, że od tej chwili nie pushuje

---

## Phase 2: Przepisanie historii w świeżym klonie

### Overview

Przepisanie `main`, `prod` i tagu w katalogu tymczasowym. Dodanie jednego commitu na `main`, który blokuje powrót plików. Weryfikacja przed publikacją.

### Changes Required:

#### 1. Filtr historii

**File**: klon w `C:\Users\agapp\printo-kids-rewrite\` (poza repo)

**Intent**: Wyciąć ścieżki kursu z każdego commitu `main`, `prod` i `v2026.11.01` w jednym przebiegu.

**Contract**: Klon z lokalnymi gałęziami `main` i `prod` oraz tagiem. Komenda:

```bash
git filter-branch --index-filter \
  'git rm -r --cached --ignore-unmatch -q ".cursor/skills/10x-*" .cursor/rules/10x-course.mdc .cursor/prompts .10x-cli.json .cursor/.10x-cli-manifest.json' \
  --prune-empty --tag-name-filter cat -- main prod v2026.11.01
```

`--prune-empty` usuwa commity, które dotyczyły tylko plików kursu (`0149e01`, `e6a5e94`, jeśli nie mają nic więcej). Po filtrze usuń `refs/original/*`.

#### 2. Blokada powrotu

**File**: `.gitignore`, `.github/workflows/ci.yml` (w przepisanym klonie, nowy commit na `main`)

**Intent**: Pliki kursu na dysku są ignorowane, a CI odrzuca drzewo, które je zawiera (np. PR ze starej gałęzi).

**Contract**:

- `.gitignore`: sekcja obok `.claude/skills` z listą ścieżek.
- `ci.yml`, job `ci`: krok przed `npm ci`, który kończy się błędem, gdy `git ls-files` zwraca którąkolwiek ścieżkę z listy.
- Commit `chore(gh272): ignoruj pliki kursu 10x i odrzucaj je w CI`. Tylko na `main`; na `prod` trafi przy następnym wydaniu.
- Ten sam commit zawiera folder `context/changes/gh272-remove-10xskills/` (change, frame, plan, brief, review) z Progress faz 0–2, skopiowany z worktree, w którym powstał. Nie commitujemy go wcześniej na starej historii; gałąź `claude/remove-10x-skills-gh272-bfa6c6` jest w fazie 4 przestawiana na nowy `main` jak inne.

### Success Criteria:

#### Automated Verification:

- Brak ścieżek kursu w przepisanej historii: `git log --all --oneline -- ".cursor/skills/10x-*" .cursor/rules/10x-course.mdc .cursor/prompts .10x-cli.json .cursor/.10x-cli-manifest.json` zwraca pusto
- Drzewa różnią się tylko ścieżkami kursu: `git diff --stat <stary prod> <nowy prod>` pokazuje wyłącznie pliki z listy (dla `main` jako bazy porównania użyj nowego `main~1`)
- Tag wskazuje nowy odpowiednik `f20d86a` (nowy `prod`), a liczba commitów spadła dokładnie o 1 (tylko `0149e01` zawierał wyłącznie pliki kursu): `git rev-list --count` nowego `main~1` = stary `main` − 1, nowego `prod` = stary `prod` − 1
- `npm ci && npm test && npm run build` przechodzą na nowym `main`
- Krok CI z blokadą zwraca błąd na drzewie z plikami kursu i sukces na nowym `main` (sprawdzone lokalnie tą samą komendą), a `.github/workflows/ci.yml` parsuje się bez błędu: `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/ci.yml','utf8'))"` (pakiet `yaml` jest w `node_modules`)

#### Manual Verification:

- Użytkowniczka przegląda podsumowanie (liczba commitów przed/po, lista usuniętych ścieżek) i zgadza się na publikację

---

## Phase 3: Publikacja na origin

### Overview

Force-push przepisanej historii, sprzątanie gałęzi na origin, przywrócenie rulesetów. Wymaga jawnej zgody tuż przed pierwszym pushem.

### Changes Required:

#### 1. Rulesety off → push → on

**File**: GitHub `drpc1/printo-kids` (rulesety `25797959`, `26293197`)

**Intent**: Na czas force-pushu przełączyć `enforcement` na `disabled`, a potem przywrócić dokładny JSON z fazy 1.

**Contract**: `gh api -X PUT repos/drpc1/printo-kids/rulesets/<id>` z `enforcement: disabled`, potem z zapisaną konfiguracją. Push: `git push --force origin main prod` i `git push --force origin v2026.11.01`.

#### 2. Usunięcie gałęzi z origin

**File**: wszystkie refy `origin/*` poza `main` i `prod`

**Intent**: Bez tego skille dalej są w publicznych gałęziach.

**Contract**: `git push origin --delete <gałąź>` dla każdej gałęzi z `git ls-remote --heads origin` poza `main` i `prod`. Lista przed usunięciem jest pokazana użytkowniczce.

### Success Criteria:

#### Automated Verification:

- Świeży klon origin: `git log --all -- <ścieżki kursu>` zwraca pusto
- `git ls-remote origin` pokazuje tylko `HEAD`, `main`, `prod`, `v2026.11.01` i `refs/pull/*`
- Oba rulesety mają `enforcement: active` i konfigurację równą zapisanej (`diff` JSON bez pól `updated_at`/`_links`)
- CI na nowym `main` i `prod` zielone: `gh run list --branch main --limit 1`, `--branch prod`

#### Manual Verification:

- Staging (`printo-kids-staging`) i produkcja (`printo-kids`) zdeployowały się z nowych SHA i działają: `npm run smoke` na obu adresach albo podgląd w przeglądarce
- Na github.com repo nie pokazuje `.cursor/skills/10x-*`, a wyszukiwanie w kodzie „10x-course” nic nie zwraca (indeks może się odświeżać do kilku godzin)

---

## Phase 4: Porządki lokalne

### Overview

Każdy worktree i lokalne gałęzie przechodzą na nową historię. Pliki kursu zostają na dysku.

### Changes Required:

#### 1. Worktree bez własnych commitów

**File**: główny checkout `C:\Users\agapp\printo-kids` i worktree stojące na zmergowanych gałęziach

**Intent**: Przestawić na nowy `origin/main` bez utraty plików kursu.

**Contract**: W każdym: zacommitować WIP (jeśli jest), `git fetch --prune`, `git rm -r --cached --ignore-unmatch <ścieżki>`, `git reset --hard origin/main` (albo `checkout -B <gałąź> origin/main`). Worktree w detached HEAD (`gh117-sequence-lat7`) i zmergowane gałęzie: przestawić albo usunąć worktree (`git worktree remove`), zależnie od tego, czy użytkowniczka ich jeszcze używa.

#### 2. Gałęzie z własną pracą

**File**: `claude/s32-coins-comparison-494c51` (S-33, worktree `great-mirzakhani-99c469`) i każda inna gałąź z commitami spoza `main`

**Intent**: Przenieść commity S-33 na nowy `main` bez plików kursu. Gałąź zostaje lokalna; PR S-33 do `main` otwiera użytkowniczka dopiero po wydaniu gh271 + gh272 na `prod`, żeby S-33 nie poszła na produkcję.

**Contract**: Najpierw `git rm -r --cached --ignore-unmatch <ścieżki>` i commit WIP. Potem `git rebase --onto origin/main <stara baza> <gałąź>`, gdzie starą bazę wylicza `git merge-base` ze starym `main` z bundle. Commity nie mogą zawierać ścieżek kursu.

#### 3. Progress faz 3–4

**File**: `context/changes/gh272-remove-10xskills/plan.md`

**Intent**: Po fazie 4 zaznaczyć Progress faz 3–4 i wysłać jednym PR do `main` (rulesety są już włączone, więc zwykłą ścieżką), razem z archiwizacją zmiany, jeśli użytkowniczka chce.

**Contract**: Gałąź z nowego `origin/main`; PR zawiera tylko pliki z `context/`.

#### 4. Stare gałęzie lokalne

**File**: lokalne gałęzie zmergowane albo porzucone (np. `chore/archive-gh180-no-character`, `gh180-no-character`, `sequence-shape-colors`, `gh238-*`)

**Intent**: Usunąć gałęzie ze starą historią, żeby nie wypchnąć ich przypadkiem. Są w bundle z fazy 1.

**Contract**: Lista do usunięcia pokazana użytkowniczce przed `git branch -D`. Zostają tylko gałęzie stojące na nowej historii.

### Success Criteria:

#### Automated Verification:

- W żadnym worktree `git ls-files <ścieżki kursu>` nie zwraca nic, a pliki są na dysku (`ls .cursor/skills/10x-plan/SKILL.md`)
- `git status` w każdym worktree nie pokazuje plików kursu (są ignorowane)
- Żadna lokalna gałąź nie zawiera starych commitów: `git branch --contains 7926d49` zwraca pusto
- S-33 po rebase: `npm test` przechodzi, `git log origin/main..claude/s32-coins-comparison-494c51` pokazuje te same 8 tytułów co przed, a `git merge-base --is-ancestor origin/main claude/s32-coins-comparison-494c51` się udaje

#### Manual Verification:

- Cursor i Claude Code nadal widzą skille 10x w tym repo (np. `/10x-status` działa)
- Użytkowniczka potwierdza, że niczego nie brakuje w S-33 i innych worktree

---

## Testing Strategy

### Unit Tests:

- Brak zmian w kodzie aplikacji. `npm test` na nowym `main` potwierdza, że przepisanie nie ruszyło kodu.

### Integration Tests:

- CI (`ci`, `smoke`, `e2e`) na nowym `main` i `prod` po force-pushu. Krok blokady sprawdzony lokalnie na drzewie z plikami i bez.

### Manual Testing Steps:

1. Świeży klon origin do katalogu tymczasowego i `git log --all -- .cursor/skills/10x-plan` → pusto.
2. Strona staging i produkcja otwierają się, karta generuje się i drukuje.
3. W głównym checkoutcie `/10x-status` działa, a `git status` jest czysty.

## Migration Notes

- **Po planie (poza zakresem, zwykła ścieżka):** wydanie `main` → `prod` z gh271 i commitem blokady gh272 (`.github/PULL_REQUEST_TEMPLATE/release.md`), dopiero potem PR S-33 do `main`. S-33 zostaje na `main` do późniejszego wydania. Archiwizacja gh271 (i gh272) idzie w PR z Progress faz 3–4 (Phase 4, punkt 3), po wydaniu albo przed nim, ale po fazie 4.

- **Rollback** przed fazą 3: usunąć katalog `printo-kids-rewrite`, nic się nie zmieniło.
- **Rollback** po fazie 3: z bundle odtworzyć stare `main`/`prod`/tag i force-push przy wyłączonych rulesetach. Przywraca to też pliki kursu publicznie, więc tylko w razie awarii aplikacji.
- Stare SHA w zamkniętych PR-ach, w `context/archive/**` i w opisach commitów przestają odpowiadać historii `main`. To tylko odnośniki tekstowe, nie łamią budowania.

## References

- Frame: `context/changes/gh272-remove-10xskills/frame.md`
- `.github/workflows/ci.yml:20-34` (job `changes`), `.gitignore:42-44`, `CLAUDE.md`
- `.cursor/.10x-cli-manifest.json` (lista plików kursu)
- GitHub issue drpc1/printo-kids#272

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 0: Warunek wstępny — gh271 na `main`

#### Automated

- [x] 0.1 PR gh271 zmergowany do `main`, CI zielone
- [x] 0.2 Na origin brak niezmergowanych gałęzi poza `prod`

#### Manual

- [x] 0.3 Użytkowniczka potwierdza, że nie ma innych zmian do wypchnięcia przed zamrożeniem

### Phase 1: Kopia i inwentarz

#### Automated

- [x] 1.1 `git bundle verify` na bundle przechodzi i wylicza refy `main`, `prod`, tag i wszystkie gałęzie
- [x] 1.2 Liczba plików w `course-files` równa liczbie z `git ls-files` dla listy ścieżek
- [x] 1.3 Oba pliki JSON rulesetów istnieją i zawierają `"rules"`

#### Manual

- [x] 1.4 Użytkowniczka widzi folder `printo-kids-backup` i potwierdza, że od tej chwili nie pushuje

### Phase 2: Przepisanie historii w świeżym klonie

#### Automated

- [x] 2.1 Brak ścieżek kursu w przepisanej historii
- [x] 2.2 Drzewa różnią się tylko ścieżkami kursu
- [x] 2.3 Tag wskazuje nowy `prod`, a liczba commitów `main~1` i `prod` spadła dokładnie o 1
- [x] 2.4 `npm ci && npm test && npm run build` przechodzą na nowym `main`
- [x] 2.5 Krok CI z blokadą zwraca błąd na drzewie z plikami kursu i sukces na nowym `main`, a `ci.yml` parsuje się bez błędu

#### Manual

- [x] 2.6 Użytkowniczka przegląda podsumowanie i zgadza się na publikację

### Phase 3: Publikacja na origin

#### Automated

- [x] 3.1 Świeży klon origin: `git log --all -- <ścieżki kursu>` zwraca pusto
- [x] 3.2 `git ls-remote origin` pokazuje tylko `HEAD`, `main`, `prod`, `v2026.11.01` i `refs/pull/*`
- [x] 3.3 Oba rulesety mają `enforcement: active` i konfigurację równą zapisanej
- [x] 3.4 CI na nowym `main` i `prod` zielone — `ci`, `smoke`, `e2e` success; job `changes` czerwony tylko raz (stary SHA po force-pushu, zamierzone)

#### Manual

- [x] 3.5 Staging i produkcja zdeployowały się z nowych SHA i działają
- [x] 3.6 Na github.com repo nie pokazuje `.cursor/skills/10x-*`, a wyszukiwanie „10x-course” nic nie zwraca

### Phase 4: Porządki lokalne

#### Automated

- [x] 4.1 W żadnym worktree `git ls-files <ścieżki kursu>` nie zwraca nic, a pliki są na dysku
- [x] 4.2 `git status` w każdym worktree nie pokazuje plików kursu
- [x] 4.3 Żadna lokalna gałąź nie zawiera starych commitów (`git branch --contains 7926d49` pusto)
- [x] 4.4 S-33 po rebase: testy przechodzą, te same 8 commitów, baza to nowy `main`

#### Manual

- [x] 4.5 Cursor i Claude Code nadal widzą skille 10x w tym repo
- [x] 4.6 Użytkowniczka potwierdza, że niczego nie brakuje w S-33 i innych worktree
