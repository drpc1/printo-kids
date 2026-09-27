---
name: First Workers deploy
overview: Przygotować konfigurację PrintoKids pod Cloudflare Workers (nie Pages) i opublikować pierwszy Worker z katalogu głównego repozytorium, bez sekretów Supabase i bez nieużywanych bindingów.
todos:
  - id: config
    content: Zmienić nazwę Workera na printo-kids, wyłączyć sesję KV i binding Images, zaktualizować deployment_target w tech-stack.md
    status: completed
  - id: verify-local
    content: Zbudować produkcyjny bundle i sprawdzić go przez npm run preview
    status: completed
  - id: deploy
    content: Zalogować Wranglera i opublikować Worker przez npx wrangler deploy
    status: completed
  - id: check-live
    content: Otworzyć workers.dev i sprawdzić brak 1102 oraz 404 assetów
    status: completed
isProject: false
---

# Pierwsze wdrożenie na Cloudflare Workers

Źródło kroków: [context/foundation/infrastructure.md](context/foundation/infrastructure.md) (Getting Started i rejestr ryzyk). Stack zostaje Astro 7 + `@astrojs/cloudflare` 14 z [context/foundation/tech-stack.md](context/foundation/tech-stack.md). Etykieta `cloudflare-pages` w tym pliku jest nieaktualna: adapter 14 publikuje Workera, nie projekt Pages.

`npx wrangler whoami` zwraca brak sesji. Produkcyjny `wrangler deploy` ruszy dopiero po Twoim logowaniu w przeglądarce.

## Konfiguracja przed deployem

W [wrangler.jsonc](wrangler.jsonc) zmienić tylko `name` z `10x-astro-starter` na `printo-kids`. Zostawić `compatibility_date` `2026-05-08`, `nodejs_compat`, `main` i `assets.directory: ./dist`.

W [astro.config.mjs](astro.config.mjs) wyłączyć bindingi, których aplikacja nie używa (brak `Astro.session` i brak `astro:assets`):

- `session: false` na poziomie `defineConfig` — adapter czyta `config.session` i przy wartości innej niż `false` sam tworzy KV `SESSION`.
- `adapter: cloudflare({ imageService: "compile" })` — domyślne `cloudflare-binding` provisionuje binding Images.

Nie ustawiać `SUPABASE_URL` ani `SUPABASE_KEY`. [src/lib/supabase.ts](src/lib/supabase.ts) już zwraca `null`, gdy ich brakuje. Nie przekazywać `--env` do Wranglera i nie tworzyć projektu Pages.

W frontmatterze [context/foundation/tech-stack.md](context/foundation/tech-stack.md) poprawić `deployment_target` na `cloudflare-workers` i zdanie o Pages, żeby kolejny deploy nie poszedł w zły produkt. CI w [.github/workflows/ci.yml](.github/workflows/ci.yml) zostaje bez zmian: infrastruktura wyłącza pipeline deployu z tego kroku.

## Publikacja

1. `npm run build`, potem `npm run preview` — oba idą przez `workerd`. Dzień powszedni to `npm run dev`, nie `wrangler dev`.
2. `npx wrangler login` — otworzy przeglądarkę; deploy czeka na zakończenie logowania.
3. Z katalogu głównego: `npx wrangler deploy`. Pierwsza publikacja musi być `deploy`, nie `versions upload`. Wrangler wypisze URL `*.workers.dev`.

## Sprawdzenie po URL

Otworzyć stronę główną pod adresem z Wranglera i potwierdzić, że odpowiedź nie jest błędem 1102 (`exceededCpu`) oraz że assety nie zwracają 404.

- Przy 1102: Worker trzeba przenieść na Workers Paid (5 USD/mies.). Nie podnosić `limits.cpu_ms` na planie Free.
- Przy 404 assetów: powtórzyć deploy z `npx wrangler deploy --config dist/server/wrangler.json`.

Połączenie repozytorium w Workers Builds (build `npx astro build`, deploy `npx wrangler deploy` na gałęzi produkcyjnej) jest kolejnym krokiem w panelu Cloudflare, po tym jak Worker już istnieje. Nie wchodzi w to pierwsze wdrożenie.
