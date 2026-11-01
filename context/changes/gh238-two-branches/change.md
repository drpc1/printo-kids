---
change_id: gh238-two-branches
title: "Dwa środowiska: staging z main i produkcja z prod"
status: implemented
created: 2026-10-31
updated: 2026-11-01
archived_at: null
---

## Notes

Źródło: [GitHub #238](https://github.com/drpc1/printo-kids/issues/238), 2026-10-31.

**Cel:** jedna stabilna wersja produkcyjna i jedna do rozwoju i testów. Staging po pełnym przetestowaniu (nie tylko przez właściciela) trafia na produkcję. Wszystko na darmowych planach GitHuba i Cloudflare.

**Układ docelowy:**

| Gałąź | Rola | Worker | Adres |
| --- | --- | --- | --- |
| `main` | staging: rozwój, testy | `printo-kids-staging` | `printo-kids-staging.<konto>.workers.dev` |
| `prod` | produkcja | `printo-kids` | własna domena albo `printo-kids.<konto>.workers.dev` |

PR-y nadal idą do `main`. Osobne adresy dają osobny `localStorage`.

**Do zrobienia w repo:**
- `wrangler.jsonc`: `env.staging` (`printo-kids-staging`), sprawdzić build i deploy obu środowisk.
- `ci.yml`: `push` i `pull_request` także dla `prod`.
- `noindex` tylko na stagingu (meta albo `X-Robots-Tag`), chyba że za Cloudflare Access.
- `.github/PULL_REQUEST_TEMPLATE/release.md`: lista zmian + testy ręczne (druk A4 z marginesem 10 mm w Chrome/Edge/Brave/Firefox/Safari, telefon, każdy rodzaj karty).
- `AGENTS.md`: gałęzie, środowiska, proces wydania.

**GitHub (poza kodem):** gałąź `prod` z `main`; ruleset (tylko PR, wymagane checki, bez force push i usuwania); opcjonalnie Environments.

**Cloudflare (poza kodem, właściciel):** ustalić, jak dziś wdraża się produkcja (ręcznie czy Workers Builds z `main`; jeśli to drugie, najpierw przepiąć Worker `printo-kids` na `prod`); Workers Builds: `printo-kids` ← `prod`, `printo-kids-staging` ← `main`; domena tylko do `printo-kids`; decyzja: staging publiczny z `noindex` czy za Cloudflare Access.

**Proces wydania:** testy na stagingu → PR `main → prod` („Wydanie RRRR-MM-DD”) → zielone CI → merge commitem (bez squash), tag `vRRRR.MM.DD` → poprawka pilna z `prod`, potem merge `prod → main`.

**Gotowe, gdy:** merge do `main` zmienia tylko staging; merge `main → prod` zmienia produkcję; push do `prod` zablokowany, PR wymaga zielonego CI; proces opisany w `AGENTS.md`.
