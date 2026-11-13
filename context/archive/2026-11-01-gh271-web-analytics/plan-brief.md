# Licznik Web Analytics na stronie produkcyjnej — Plan Brief

> Full plan: `context/changes/gh271-web-analytics/plan.md`

## What & Why

Na darmowym koncie Cloudflare widać żądania, ale nie odsłony stron bez botów. Web Analytics to daje bez ciasteczek, ale hostname `workers.dev` wymaga ręcznie wstawionego skryptu (GitHub 271).

## Starting Point

Jeden layout `src/layouts/Layout.astro` obsługuje wszystkie strony (pełne SSR). Staging poznaje się po `ENVIRONMENT=staging` (nagłówek `noindex` w `src/lib/robots.ts`); produkcja nie ma tej zmiennej, a lokalny dev, preview i e2e używają tej samej konfiguracji co produkcja.

## Desired End State

Każda strona na `printo-kids.printokids.workers.dev` ładuje `beacon.min.js` z publicznym tokenem, a staging, lokalny dev i testy e2e nie. Wizyta na produkcji widnieje w panelu Web analytics.

## Key Decisions Made

| Decision              | Choice                                                                    | Why                                                                                     |
| --------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Rozpoznanie produkcji | Hostname `printo-kids.printokids.workers.dev` i `ENVIRONMENT` ≠ `staging` | Dev, preview i e2e czytają główny `wrangler.jsonc`, zmienna ich nie odróżni (review F1) |
| Zmiany w wrangler     | Brak                                                                      | Żadna nowa zmienna nie uznaje lokalnego dev za produkcję                                |
| Token                 | Stała w `src/lib/analytics.ts`                                            | Token jest publiczny; podany przez użytkownika                                          |
| Logika                | Czysta funkcja + test jak `robots.ts`                                     | Ten sam wzorzec, testowalne bez workerd                                                 |

## Scope

**In scope:** funkcja z testem, warunkowy tag w layoucie, wpis testu w `package.json`.

**Out of scope:** zmiany w panelu i w `wrangler.jsonc`, własne zdarzenia, baner zgody, skrypt na stagingu.

## Architecture / Approach

`Layout.astro` przekazuje `Astro.url.hostname` i `env.ENVIRONMENT` do `webAnalyticsBeacon()` i renderuje `<script is:inline type="module" …>` przed `</body>` tylko dla hostname produkcji.

## Phases at a Glance

| Phase                        | What it delivers      | Key risk                                    |
| ---------------------------- | --------------------- | ------------------------------------------- |
| 1. Skrypt tylko na produkcji | Funkcja, layout, test | Własna domena w przyszłości wyłączy licznik |

**Prerequisites:** token (jest), wydanie `main` → `prod` do weryfikacji.
**Estimated effort:** ~1 sesja, 1 faza.

## Open Risks & Assumptions

- Własna domena wymaga zmiany stałej hostname i wpisu w panelu.
- Weryfikacja w panelu możliwa dopiero po wydaniu na produkcję.

## Success Criteria (Summary)

- `npm test`, lint, `astro check` i build przechodzą.
- Wizyta na produkcji widoczna w Web analytics; staging i dev nie liczą się.
