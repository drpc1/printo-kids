# Pomiń ci, smoke i e2e, gdy pull request zmienia tylko context — plan implementacji

## Overview

Pull request albo push na `main`, w którym każda zmieniona ścieżka leży w `context/`, nie uruchamia jobów `ci`, `smoke` ani `e2e`. Workflow i tak startuje, a te joby są pominięte warunkiem, więc wymagane checki wracają jako sukces i merge nie stoi. Podgląd Cloudflare, który czeka na te trzy joby, też nie powstaje.

## Current State Analysis

`.github/workflows/ci.yml` na push i pull request do `main` zawsze uruchamia `ci` (lint, `npm test`, `astro check`, build), `smoke` i `e2e`. Job `preview` ma `needs: [ci, smoke, e2e]` i publikuje podgląd tylko dla pull requesta z tego samego repozytorium (`ci.yml:59-61`).

Ochrona `main` wymaga checków `ci`, `smoke` i `e2e`. Ruleset „main: checki, pominiecie tylko przy pull request” powtarza `ci` i `smoke` oraz ma regułę pokrycia z progiem 50%. Ten workflow pokrycia nie wysyła. Reguła pokrycia nie czeka na upload.

Żaden z trzech jobów nie czyta `context/`. ESLint patrzy na kod, `npm test` ma jawną listę plików w `package.json`, smoke odpytuje zbudowane strony. Jedyny ślad katalogu w kodzie to komentarze i skrypty mockupów, które tam zapisują obrazki.

## Desired End State

Gdy `git diff -z -M --name-status` między bazą a głową wymienia wyłącznie ścieżki z prefiksem `context/`, albo nie wymienia żadnej, joby `ci`, `smoke` i `e2e` są pominięte, a ich checki nie blokują merge. Podgląd nie powstaje.

Gdy choć jedna ścieżka (także któraś ze stron rename albo copy) nie ma prefiksu `context/`, lecą wszystkie trzy joby, a podgląd jak dziś.

Gdy listy ścieżek nie da się ustalić, te trzy joby też lecą.

Opis w `AGENTS.md`, `context/foundation/infrastructure.md` i zdaniu o CI w `context/foundation/test-stack.md` mówi to samo.

### Key Discoveries:

- Filtr `paths` na triggerze workflow w ogóle go nie startuje. Wymagany check zostaje „Pending” i blokuje merge. Job pominięty warunkiem `if` jest raportowany jako sukces ([Troubleshooting required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)).
- Job, który `needs` nieudany job i sam nie ma `always()`, jest pomijany i może nie zablokować merge. Dlatego błąd klasyfikacji musi albo ustawić „bramka leci”, albo być obsłużony przez `always()` na `ci`, `smoke` i `e2e`.
- Bez `pipefail` padnięty `git diff` w potoku daje pusty stdin. Pusty udany diff oznacza „nic poza context/” i wyłączyłby bramkę. To jest otwarcie merge przy awarii.
- Nowy plik testu nic nie uruchamia, dopóki nie stoi w skrypcie `test` w `package.json` (linia ze `scripts/site-icons.test.mjs`).
- Sekcja E2E w `context/foundation/test-stack.md` jest oznaczona jako własność `/10x-e2e-setup` (linia z komentarzem HTML). Issue #210 każe poprawić tylko zdanie o CI, nie przepisywać sekcji.

## What We're NOT Doing

- Zmiana ochrony `main` ani rulesetu, w tym listy wymaganych checków i progu pokrycia.
- Filtr `paths` albo `paths-ignore` na triggerze workflow.
- Linter markdownu albo frontmatteru w `context/`.
- Ruszanie `.github/workflows/e2e-phone.yml` (jest `workflow_dispatch`, nie jest bramką merge).
- Wysyłanie raportu pokrycia.
- Podgląd Cloudflare przy samym `context/`.
- Ponowne uruchomienie `/10x-e2e-setup` i przeredagowanie reszty sekcji E2E w `test-stack.md`.

## Implementation Approach

Klasyfikacja ścieżek żyje w skrypcie czytanym przez `node:test`, nie w samym YAML-u. Job `changes` robi checkout z pełną historią, liczy diff i zapisuje wynik `app=true` albo `app=false`. Joby `ci`, `smoke` i `e2e` dostają `needs: changes` i warunek, który uruchamia je, gdy `app` jest `true` albo job `changes` nie zakończył się sukcesem. `preview` zostaje na `needs: [ci, smoke, e2e]` bez `always()`, więc przy pominiętych trzech jobach też jest pominięty.

Ten sam warunek obowiązuje push na `main`. Baza pull requesta to `github.event.pull_request.base.sha`, głowa to `github.event.pull_request.head.sha`. Baza pusha to `github.event.before`, głowa to `github.sha`. Sama zerowa baza (`0000000…`) ustawia `app=true` bez wołania diffa.

## Critical Implementation Details

- **Pusty diff i padnięty diff:** krok z `git diff` ma `set -o pipefail`. Skrypt dostaje surowe wyjście `git diff -z -M --name-status` (NUL, bez cytowania ścieżek). Pusty udany diff oznacza, że bramka nie leci. Nieudany diff albo nieparsowalny zapis kończy krok błędem, job `changes` pada, a trzy joby i tak lecą.
- **Warunek trzech jobów:** samo `if: needs.changes.outputs.app == 'true'` przy padniętym `changes` pomija je razem z wymaganiem i może puścić merge. Warunek ma być prawdziwy także wtedy, gdy `needs.changes.result` nie jest `success`.

```yaml
needs: changes
if: always() && (needs.changes.result != 'success' || needs.changes.outputs.app == 'true')
```

- **Podgląd:** nie dodawać `always()` do `preview`. Inaczej wstałby przy pominiętej bramce.

## Phase 1: Bramka

### Overview

Skrypt odróżnia diff złożony tylko z `context/` od diffa, który ma ruszyć bramkę. Workflow woła go z `changes` i na tej podstawie pomija albo uruchamia `ci`, `smoke` i `e2e`.

### Changes Required:

#### 1. Klasyfikacja diffa

**File**: `scripts/context-only-diff.mjs`

**Intent**: Jedno miejsce mówi, czy bramka produktowa ma lecieć, żeby reguły prefiksu i rename nie zostały tylko w bashu workflow.

**Contract**: Eksportowana funkcja czyta bufor w formacie `git diff -z -M --name-status`. Zwraca prawdę, gdy bramka ma lecieć. Ścieżka jest w `context/` tylko wtedy, gdy zaczyna się od `context/`. `context` bez ukośnika, `context-foo` i `src/context/foo` są poza katalogiem. Przy statusie rename albo copy liczą się obie ścieżki; jedna poza katalogiem włącza bramkę. Brak ścieżek zwraca fałsz. Zapis, w którym po statusie brakuje ścieżki, rzuca wyjątek. Wejście z CLI czyta stdin i przy wyjątku kończy proces niezerowo; na stdout wypisuje `true` albo `false`.

#### 2. Testy klasyfikacji

**File**: `scripts/context-only-diff.test.mjs`

**Intent**: Regresja ma złapać wyłączenie bramki przy rename z kodu do `context/` i przy ścieżce, która tylko wygląda jak ten katalog.

**Contract**: `node:test`, tak jak `scripts/site-icons.test.mjs`. Przypadki: same ścieżki `context/` oraz pusty bufor zwracają fałsz; ścieżka spoza katalogu zwraca prawdę; rename albo copy z jedną ścieżką w `context/` i drugą poza nim zwraca prawdę; rename wewnątrz `context/` zwraca fałsz; obcięty zapis rename rzuca. Plik dopisany do skryptu `test` w `package.json`, obok `scripts/site-icons.test.mjs`.

#### 3. Warunek w workflow

**File**: `.github/workflows/ci.yml`

**Intent**: Wymagane checki nadal się pojawiają, a praca lintu, smoke i Playwright odpada tylko wtedy, gdy diff na pewno nie rusza aplikacji.

**Contract**: Nowy job `changes` nie jest wymagany w ochronie gałęzi i nie wchodzi w `needs` podglądu. Checkout z `fetch-depth: 0`. Dla pull requesta diff od `base.sha` do `head.sha`, dla pusha od `github.event.before` do `github.sha`. Zerowa baza ustawia output `app=true` i nie woła gita. Inaczej krok z `pipefail` przekazuje `git diff -z -M --name-status` do skryptu i zapisuje jego `true`/`false` jako output `app`. Joby `ci`, `smoke` i `e2e` dostają `needs: changes` oraz warunek z sekcji Critical Implementation Details. Trigger workflow, kroki tych trzech jobów i warunek `preview` zostają. `preview` nie dostaje `always()`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a `scripts/context-only-diff.test.mjs` jest w skrypcie `test` w `package.json`. Testy obejmują sam `context/` i pusty diff (bramka nie leci), ścieżkę spoza `context/` (bramka leci), rename z jedną ścieżką poza katalogiem (bramka leci) i obcięty zapis rename (skrypt się wywala).

#### Manual Verification:

- Pull request, który zmienia `.github/workflows/ci.yml`, nadal uruchamia joby `ci`, `smoke` i `e2e`.
- Pull request złożony wyłącznie z plików pod `context/` pokazuje te trzy joby jako pominięte, a merge nie jest zablokowany ich brakiem.

**Implementation Note**: Po zielonym `npm test` zatrzymaj się na ręczne potwierdzenie obu pull requestów, zanim przejdziesz do fazy 2. Pull request z tą zmianą sam nie pokaże pominięcia, bo `ci.yml` leży poza `context/`.

---

## Phase 2: Opis

### Overview

Trzy miejsca, które dziś mówią, że `ci`, `smoke` i `e2e` zawsze są bramką, opisują pominięcie przy samym `context/`.

### Changes Required:

#### 1. Wytyczne repozytorium

**File**: `AGENTS.md`

**Intent**: Agent czytający bramkę CI nie ma zlecać pełnego przebiegu przy zmianie złożonej tylko z `context/`.

**Contract**: Akapit „Tests and CI”. Dopisać, że przy każdej ścieżce pod `context/` joby `ci`, `smoke` i `e2e` są pominięte i liczą się jako sukces, a podgląd nie powstaje. Ścieżka spoza katalogu, któraś strona rename albo błąd liczenia uruchamia wszystkie trzy.

#### 2. Opis podglądu

**File**: `context/foundation/infrastructure.md`

**Intent**: Opis wydania i podglądu nie obiecuje przebiegu e2e ani adresu podglądu przy diffie, który nie rusza aplikacji.

**Contract**: Zdanie o podglądzie po zielonych `ci`, `smoke` i `e2e` w „Unknown Unknowns” oraz akapit „Preview deploys” w „Operational Story”. W obu: przy samym `context/` trzy joby są pominięte, a podgląd nie powstaje.

#### 3. Zdanie o CI w stosie testów

**File**: `context/foundation/test-stack.md`

**Intent**: Opis joba `e2e` nie mówi, że leci na każdym pushu i pull requeście, skoro przy samym `context/` jest pomijany.

**Contract**: Tylko punkt „CI” w sekcji „Projekty telefonu”. Zostawić komentarz, że sekcję E2E pisze `/10x-e2e-setup`. Nie uruchamiać tego skilla i nie ruszać pozostałych punktów. W punkcie CI dopisać pominięcie joba `e2e` (wraz z `ci` i `smoke`), gdy każda ścieżka jest w `context/`.

### Success Criteria:

#### Manual Verification:

- `AGENTS.md`, `context/foundation/infrastructure.md` i punkt CI w `context/foundation/test-stack.md` opisują pominięcie `ci`, `smoke` i `e2e` przy samym `context/`, ich uruchomienie przy ścieżce spoza katalogu, przy rename albo błędzie liczenia, oraz brak podglądu.

**Implementation Note**: Po aktualizacji trzech plików daj je do przeczytania. Faza nie ma sprawdzenia automatycznego.

---

## Testing Strategy

### Unit Tests:

- `scripts/context-only-diff.test.mjs` na buforze `git diff -z -M --name-status`, bez wołania gita i bez GitHuba.
- Prefiks `context/` jest ścisły: plik `context`, katalog `context-foo` i `src/context/…` włączają bramkę.
- Rename i copy wnoszą dwie ścieżki. Jedna poza `context/` włącza bramkę, obie w środku jej nie włączają.
- Pusty bufor nie włącza bramki. Obcięty rekord rename rzuca.

### Integration Tests:

- Nie ma testu, który stawia GitHub Actions. Workflow jest sprawdzany czytaniem `ci.yml` i dwoma pull requestami z fazy 1.

### Manual Testing Steps:

1. Na pull requeście z tą zmianą sprawdzić, że `ci`, `smoke` i `e2e` dostały kroki, a nie status pominięcia.
2. Na późniejszym pull requeście, którego diff jest tylko pod `context/`, sprawdzić, że te trzy joby są pominięte, podgląd nie powstał, a merge nie czeka na nie w stanie „Pending”.
3. Przeczytać trzy pliki dokumentacji i porównać je z warunkiem w `ci.yml`.

## Performance Considerations

Job `changes` na każdym pushu i pull requeście pobiera pełną historię, żeby mieć oba SHA. Repozytorium jest małe; koszt siedzi w trzech pomijanych jobach (`npm ci`, build, Playwright), nie w tym checkoutcie.

## Migration Notes

Ochrony gałęzi nie ruszamy. Nic w danych aplikacji się nie migruje. Pull request, który wnosi ten workflow, sam przechodzi pełną bramkę. Pierwszy późniejszy pull request złożony tylko z `context/` jest sprawdzianem pominięcia.

## References

- Issue: https://github.com/drpc1/printo-kids/issues/210
- Workflow: `.github/workflows/ci.yml`
- Lista testów: `package.json` (skrypt `test`)
- Pominięty wymagany check: https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Bramka

#### Automated

- [x] 1.1 `npm test` przechodzi, a `scripts/context-only-diff.test.mjs` jest w skrypcie `test` w `package.json`. Testy obejmują sam `context/` i pusty diff (bramka nie leci), ścieżkę spoza `context/` (bramka leci), rename z jedną ścieżką poza katalogiem (bramka leci) i obcięty zapis rename (skrypt się wywala).

#### Manual

- [ ] 1.2 Pull request, który zmienia `.github/workflows/ci.yml`, nadal uruchamia joby `ci`, `smoke` i `e2e`.
- [ ] 1.3 Pull request złożony wyłącznie z plików pod `context/` pokazuje te trzy joby jako pominięte, a merge nie jest zablokowany ich brakiem.

### Phase 2: Opis

#### Manual

- [x] 2.1 `AGENTS.md`, `context/foundation/infrastructure.md` i punkt CI w `context/foundation/test-stack.md` opisują pominięcie `ci`, `smoke` i `e2e` przy samym `context/`, ich uruchomienie przy ścieżce spoza katalogu, przy rename albo błędzie liczenia, oraz brak podglądu.
