# Ikona zakładki w charakterze strony — Plan Brief

> Full plan: `context/changes/site-favicon/plan.md`

## What & Why

Zakładka pokazuje czarny znak Astro ze startowego szablonu, podczas gdy strona jest papierem, szałwią i brązowym tuszem. Issue #29 chce małą ikonę w tym charakterze: kartkę z labiryntem, bez logo Astro. Napis „PrintoKids” i druk karty zostają.

## Starting Point

`src/layouts/Layout.astro` ma jeden link, `href="/favicon.png"`. Plik istnieje i jest znakiem Astro. Nie ma apple-touch ani manifestu. Papier i szałwia są tokenami `--background` i `--primary`.

## Desired End State

W zakładce widać kryjącą ikonę 32×32: papier `#f5f2ed`, szałwiowa kartka z zagiętym rogiem i trzema kreskami labiryntu. Ten sam rysunek jest w `apple-touch-icon.png` (180 px) oraz w ikonach manifestu (192 i 512). Manifest nazywa stronę PrintoKids i ma `display: "browser"`.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Znak | Kartka z zagiętym rogiem i krótkim labiryntem | Przy 16 px pusta kartka gubi labirynt, a gęsty labirynt zlewa się w plamę |
| Kolor | Szałwia `#5f7256` na papierze `#f5f2ed` | Szałwia jest kolorem przycisków; tło ma być jak papier strony |
| Plik zakładki | Podmiana `public/favicon.png` | Link w układzie już wskazuje ten adres |
| Zasięg | Zakładka, apple-touch i manifest | Poza samą zakładką ikona ma być też na ekranie głównym i w manifeście |
| Tryb manifestu | `display: "browser"`, bez service workera | Manifest niesie nazwę i ikony; strona druku zostaje stroną |

## Scope

**In scope:**

- PNG 32×32 pod `/favicon.png`
- `public/apple-touch-icon.png` 180×180, `public/icon-192.png`, `public/icon-512.png`
- `public/site.webmanifest` oraz dwa linki w `src/layouts/Layout.astro`
- Test nagłówków PNG, `display` i `href` dopisany do skryptu `test`

**Out of scope:**

- Service worker, offline i `display: "standalone"`
- SVG jako ikona zakładki, `theme-color`, miniatury katalogu
- Napis „PrintoKids” i druk karty

## Architecture / Approach

Jeden rysunek idzie do czterech PNG. Faza 1 wymienia tylko plik zakładki. Faza 2 dokłada większe pliki, manifest i linki w jednym układzie, z którego korzystają katalog i generatory.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Ikona zakładki | `favicon.png` 32×32 i test nagłówka | Cache przeglądarki nadal pokazuje znak Astro |
| 2. Apple-touch i manifest | PNG 180, 192, 512, manifest `display: browser`, linki w układzie | Manifest zostanie odczytany jako prośba o instalację aplikacji |

**Prerequisites:** Issue #29 i zatwierdzony rysunek z planowania. Ręczne sprawdzenie zakładki potrzebuje działającego `npm run dev`.
**Estimated effort:** Jedna sesja, dwie fazy.

## Open Risks & Assumptions

- Hexy `#f5f2ed` i `#5f7256` są przeliczeniem tokenów oklch z `src/styles/global.css`. Gdy tokeny się zmienią, ikona nie podąży za nimi sama.
- PNG 32×32 na gęstym ekranie może być miększy niż wektor. To koszt decyzji o podmianie PNG.
- Część przeglądarek pokazuje instalację także przy `display: browser`. Service workera i tak nie dodajemy.

## Success Criteria (Summary)

- W zakładce widać kartkę z krótkim labiryntem na papierze, bez znaku Astro, także po wejściu na generator.
- `npm test` pilnuje rozmiarów PNG, `display: browser` i linków w układzie.
- Napis „PrintoKids” i wydruk karty są takie jak przed zmianą.
