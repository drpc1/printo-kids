# Frame Brief: Usunięcie skilli 10x z publicznego repo

> Framing step before /10x-plan. Oddziela to, co faktycznie jest problemem, od tego, co zakładano na starcie.

## Reported Observation

Publiczne repo `drpc1/printo-kids` zawiera skille kursu 10x. Osoba, która nie wykupiła kursu, może je przeczytać.

## Initial Framing (preserved)

- **Stated cause or approach**: wystarczy usunąć skille z `main` i `prod`; "historię z nimi związaną chyba też".
- **Proposed direction**: usunąć pliki i historię na obu gałęziach.
- **Pre-dispatch narrowing**:
  - Zakres: skille i reguła kursu (nie ślady w `context/`).
  - Ekspozycja: repo upublicznione niedawno.
  - Historia: użytkownik woli jej nie przepisywać.

## Dimension Map

1. **Drzewo robocze `main`/`prod`**: które pliki są materiałem kursu.
2. **Historia `main`/`prod`**: od którego commita pliki tam są.
3. **Pozostałe gałęzie i refy**: czy skille żyją także poza `main`/`prod`. ← pominięte w pierwotnym ujęciu
4. **Odwołania w repo**: co się zepsuje po usunięciu (CLAUDE.md, hooki, ślady w `context/`).
5. **Ślady po stronie GitHuba**: PR-y, forki, cache, których `git push` nie usuwa.
6. **Sam cel**: "nikt bez kursu nie ma dostępu". Usuwanie to jeden ze sposobów, widoczność repo to drugi. ← pominięte w pierwotnym ujęciu

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Pliki tylko w drzewie `main`/`prod` | 104 pliki w `.cursor/skills/` (28 katalogów `10x-*`), `.cursor/rules/10x-course.mdc`, `.10x-cli.json`, `.cursor/.10x-cli-manifest.json`, identycznie na `origin/main` i `origin/prod` | Potwierdzone, ale niepełne |
| Historia sięga początku repo | Pierwszy commit dotyczący `.cursor/skills` to `7926d49` "Initial commit" (2026-09-27); na `main` 867 commitów, na `prod` 865 | STRONG: usunięcie z historii = przepisanie całości od korzenia |
| Skille są tylko na `main`/`prod` | 48 z 47 gałęzi zdalnych (liczone z `origin/HEAD`, więc praktycznie wszystkie) zawiera `.cursor/skills/`; tag `v2026.11.01` też | STRONG: dwie gałęzie to mały ułamek |
| Zepsują się odwołania | `CLAUDE.md` importuje `@.cursor/rules/10x-course.mdc`; `.gitignore:42-44` odwołuje się do junctiona `.claude/skills`; `context/` odwołuje się do nazw skilli w 35 plikach, ale nie cytuje ich treści | WEAK: do ogarnięcia, nie blokuje |
| GitHub trzyma stare commity poza gałęziami | 100+ PR-ów (`refs/pull/*`), rulesety blokujące `main` i `prod` (`gh api .../rulesets`); 0 forków, 0 gwiazdek, 0 obserwujących | STRONG: force-push nie usunie PR-ów; to wymaga prośby do GitHub Support |
| Cel da się osiągnąć inaczej niż usuwaniem | Repo jest publiczne (`visibility: PUBLIC`); Pre-dispatch: ekspozycja niedawna, nikt nie forkował | Hipoteza do rozważenia w planie |

## Narrowing Signals

- Użytkownik woli nie przepisywać historii, a jedyny sposób usunięcia plików z historii to przepisanie wszystkich 867 commitów.
- Poza `.cursor/skills/` są też inne ślady kursu: `.cursor/prompts/m1l5-*`, `m3l2-*`, `skill-explainer.md` (kursowe prompty) oraz `10x-course.mdc`. Czy to "skille", rozstrzyga użytkownik w planie.
- Repo musi zostać publiczne (decyzja użytkowniczki 2026-11-01, uzasadnienie: koszty). Cloudflare Workers Builds nie stawia w dokumentacji warunku publicznego repo. Prawdziwy koszt prywatnego repo jest po stronie GitHuba: na koncie Free rulesety `main`/`prod` przestają działać, a Actions ma limit 2000 min/mies. Od 2026-10-02 było ponad 200 runów i ponad 1313 min czasu zegarowego (lista ucięta na 200 runach; minuty rozliczane per job są wyższe). Prywatne repo odpada, zostaje przepisanie historii.
- Użytkowniczka chce zachować skille lokalnie: kopia zapasowa przed zmianami; usunięcie z indeksu (`git rm --cached`) i dopisanie do `.gitignore`, a nie z dysku.
- Bez GitHub Support (decyzja użytkowniczki 2026-11-01): robimy tylko to, co da się zrobić samemu. Świadome ryzyko szczątkowe: zamknięte PR-y (`refs/pull/*`) i adresy po SHA nadal pokazują stare commity, a w nich pełne drzewo ze skillami ("Browse files" w PR). Plan ma to zapisać jako znane ograniczenie, a nie próbować obejść.
- `playwright-cli` w `.cursor/skills/` NIE jest w manifeście kursu (0 trafień), więc to zewnętrzne narzędzie i zostaje.

## Cross-System Convention

Wyciek treści z publicznego repo naprawia się zwykle trzema krokami: (1) usunięcie z drzewa, (2) przepisanie historii wszystkich gałęzi i tagów, (3) prośba do GitHub Support o usunięcie cache i `refs/pull/*`. Sam krok 1 daje zero zabezpieczenia, bo treść jest w historii. Alternatywą jest ustawienie repo jako prywatnego, co od razu spełnia cel i nie wymaga przepisywania.

## Reframed (or Confirmed) Problem Statement

> **Problemem jest cel "treść kursu niedostępna publicznie", a nie "pliki w dwóch gałęziach"**: materiał jest w pierwszym commicie, w ~48 gałęziach, w tagu i w refach PR, więc usunięcie z `main` i `prod` niczego nie zabezpiecza.

Początkowa intuicja ("trzeba ruszyć historię") była słuszna. Pominięte zostały pozostałe gałęzie, PR-y oraz opcja prywatnego repo. Pozostaje decyzja, czy cel osiąga się przepisaniem historii, czy zmianą widoczności, bo użytkownik nie chce przepisywać historii.

## Confidence

**MEDIUM** — wszystkie fakty o repo są zweryfikowane, ale decyzja o sposobie zależy od użytkownika (tolerancja na przepisanie historii vs prywatność repo), a rola Support GitHub nie jest sprawdzona.

## What Changes for /10x-plan

Plan nie powinien brzmieć "usuń pliki z `main` i `prod`". Najpierw wybór strategii: zmiana widoczności, albo pełne przepisanie historii wszystkich gałęzi i tagu wraz z prośbą do GitHub Support. Dopiero potem szczegóły: naprawa `CLAUDE.md`, `.gitignore`, hooków oraz rulesetów, które blokują force-push.

## References

- `CLAUDE.md` (import `@.cursor/rules/10x-course.mdc`), `.gitignore:42-44`, `.cursor/.10x-cli-manifest.json`, `.10x-cli.json`
- `git log origin/main -- .cursor/skills` → `7926d49` Initial commit
- `gh api repos/drpc1/printo-kids` (public, 0 forków), `gh api .../rulesets`
