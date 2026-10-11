# Remove starter scaffold — Plan Brief

> Full plan: `context/changes/remove-starter-scaffold/plan.md`

## What & Why

Aplikacja ma przestać serwować logowanie i dashboard ze startera. Sprawdzian HTTP ma pilnować kartki, a nie flow kont. Zostawienie `CLAUDE.md` i README startera kazałoby kolejnemu agentowi ten stos odbudować.

## Starting Point

`/` już pokazuje kartkę. Labirynt, postacie, profile i ostatnie parametry są w kodzie produktu i nie importują Supabase. Obok zostają strony `/auth/*`, dashboard, middleware, klient Supabase i job `smoke`, który stawia lokalne Supabase i sprawdza rejestrację oraz logowanie. `CLAUDE.md` i `README.md` nadal opisują ten starter.

## Desired End State

Wejście to kartka do druku. Cztery adresy konta zwracają 404. `GET /` zwraca 200 i zawiera zdanie „Wygeneruj labirynt i wydrukuj go na kartce A4.”. Build i CI nie pytają o sekrety Supabase. `CLAUDE.md` nie istnieje i nie ma następcy.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Głębokość | Skasować zamknięty graf auth, zostawić pliki dodane po starterze | Kartka, labirynt i profile nie importują tego grafu | Plan |
| Zestaw UI | Zostawić Button, dialog, input, lucide i tw-animate | Kartka i profile już ich używają | Plan |
| Smoke | 200 i zdanie o kartce A4 na `/`; 404 na czterech trasach konta | Generuj jest w wyspie `client:only` i nie ma go w HTML z serwera | Plan |
| Joby CI | Zostawić identyfikatory `ci` i `smoke` | Tych kontekstów wymaga reguła merge | Plan |
| CLAUDE.md | Usunąć, bez nowego podręcznika | Notatka zmiany: żywe reguły są w `AGENTS.md` | Note |
| README i AGENTS | Przepisać README startera i wyciąć z `AGENTS.md` zdania o kontach, o dostarczonym stosie Supabase i o migracjach RLS | Inaczej kolejny agent odtworzy logowanie. Reguły bazy napisze osobny plasterek | Plan |
| Nazwa paczki | Zostaje `10x-astro-starter` | Nie było decyzji o zmianie nazwy | Plan |
| Fazy | Jedna faza | Podział na kod i dokumenty był za drobny | Plan |

## Scope

**In scope:**

- Usunięcie stron auth, dashboardu, API kont, komponentów auth, middleware, klienta Supabase, banera, `env.d.ts`, katalogu `supabase/`, `.env.example` i `public/template.png`
- Odpięcie banera od layoutu i schematu `SUPABASE_*` od `astro.config.mjs`
- Podmiana `scripts/smoke.mjs` i zdjęcie Supabase z obu jobów CI
- Usunięcie `CLAUDE.md`, korekta `AGENTS.md` i `README.md`, jedno zdanie w `deploy-plan.md`
- Zdjęcie paczek `@supabase/ssr`, `@supabase/supabase-js` i CLI `supabase`

**Out of scope:**

- Pliki kartki, labiryntu, postaci, profili, testów, Playwright, Strykera i `public/characters/`
- Button, dialog, input i ich paczki
- Zmiana nazwy paczki oraz nazw jobów `ci` i `smoke`
- Asercja Generuj albo SVG labiryntu w smoke
- `test-plan.md`, `infrastructure.md`, `tech-stack.md`, `prd.md`

## Architecture / Approach

Odpiąć importy layoutu i schematu env, skasować graf kont, przepisać smoke na zdanie kartki i 404, zdjąć sekrety z CI, na końcu dokumenty. Job `smoke` zostaje, bez lokalnego Supabase.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Stos auth, sprawdzian i dokumenty startera | Brak ekranów konta, smoke pilnuje kartki, dokumenty nie opisują logowania | Job `smoke` jest wymagany przy merge; zła nazwa joba albo smoke szukający Generuj psuje bramkę |

**Prerequisites:** kartka, labirynt i druk są już w repozytorium. Sekrety Supabase nie są potrzebne do tej fazy.
**Estimated effort:** jedna sesja.

## Open Risks & Assumptions

- Pewność, że produkt nie woła grafu kont, pochodzi z importów, nie z buildu po usunięciu. Build bez sekretów jest kryterium fazy.
- `context/foundation/test-plan.md` nadal opisuje smoke kont. Ten plan go nie edytuje.
- `context/foundation/infrastructure.md` nadal mówi, żeby nie ustawiać sekretów Supabase. Ten plan go nie edytuje.

## Success Criteria (Summary)

- Rodzic wchodzi na stronę i widzi kartkę, a nie logowanie.
- Adresy konta ze startera nie serwują dashboardu ani formularza.
- CI buduje aplikację bez sekretów Supabase, a job `smoke` sprawdza zdanie kartki i 404 na trasach konta.
