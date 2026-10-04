---
date: 2026-10-01T21:31:41+02:00
researcher: drpc1
git_commit: 6d5da6dd28ced195bcdbafed2e5562774916f540
branch: main
repository: printo-kids
topic: "Konfiguracja stylów i użycie klas kolorów oraz prymitywów UI"
tags: [research, codebase, tailwind, shadcn, worksheet]
status: complete
last_updated: 2026-10-01
last_updated_by: drpc1
---

# Research: Konfiguracja stylów i użycie klas kolorów oraz prymitywów UI

**Date**: 2026-10-01T21:31:41+02:00
**Researcher**: drpc1
**Git Commit**: 6d5da6dd28ced195bcdbafed2e5562774916f540
**Branch**: main
**Repository**: printo-kids

## Research Question

Jaki jest główny plik stylów i jakie zmienne ma w `:root` oraz `.dark`? Które z nich są opublikowane w `@theme` albo `@theme inline`? Jakie komponenty leżą fizycznie w `src/components/ui`? Które pliki w `src` używają twardo zakodowanych klas kolorów zamiast klas semantycznych? Jakich prymitywów UI brakuje, żeby docelowy widok pokazał swoje dane?

## Summary

Jedyny arkusz w repozytorium to `src/styles/global.css`, importowany z `src/layouts/Layout.astro:2`. W tym pliku `:root` (linie 6–39) definiuje 32 właściwości, a `.dark` (linie 41–73) nadpisuje 31 z nich — wszystkie poza `--radius`. Bloku `@theme` bez słowa `inline` w tym arkuszu nie ma. Jeden blok `@theme inline` (linie 75–111) publikuje 35 kluczy, i każdy z nich wskazuje `var(--…)` albo `calc(var(--radius) …)`, więc wartości z `.dark` mogą je podmienić, gdy element ma klasę `dark`. W przeskanowanych 28 plikach pod `src` żaden element tej klasy nie ustawia.

W `src/components/ui` są dwa pliki: `button.tsx` i `LibBadge.astro`.

Wzorzec klas palety Tailwinda (na przykład `bg-purple-600`, `text-blue-200`, `text-white`) trafia w 11 z tych 28 plików. Dziesięć z nich to ekrany i kontrolki startowego logowania oraz `LibBadge.astro`; nie używają klas `bg-primary` ani `text-muted-foreground`. `button.tsx` miesza klasy semantyczne z jednym `text-white` na wariancie `destructive`.

Docelowy widok, który pokazuje dane labiryntu, to `/`: `src/pages/index.astro` montuje `WorksheetHome`, a ta montuje `WorksheetGenerator`. Kontrakt S-01 wymaga natywnego przycisku i SVG. Pliku prymitywu, którego ten kontrakt wymaga, a którego nie ma w `src/components/ui`, w tym zakresie nie ma. Przycisk `Button` w katalogu już jest; ten widok go nie importuje.

## Detailed Findings

### 1. Główny plik stylów oraz zmienne `:root` i `.dark`

Glob `**/*.{css,scss}` w korzeniu repozytorium zwrócił jeden plik: `src/styles/global.css`. `components.json:8` w obiekcie `tailwind` ustawia pole `css` na tę samą ścieżkę. Import arkusza jest w `src/layouts/Layout.astro:2`.

Tailwind w `package.json` to zakres `^4.2.4` (`tailwindcss` i `@tailwindcss/vite`). Arkusz zaczyna się od `@import "tailwindcss";` (`src/styles/global.css:1`) i `@custom-variant dark (&:is(.dark *));` (`src/styles/global.css:4`).

**`:root`**, `src/styles/global.css:6-39`, 32 właściwości:

| Właściwość | Wartość | Linia |
| --- | --- | --- |
| `--radius` | `0.625rem` | 7 |
| `--background` | `oklch(1 0 0)` | 8 |
| `--foreground` | `oklch(0.145 0 0)` | 9 |
| `--card` | `oklch(1 0 0)` | 10 |
| `--card-foreground` | `oklch(0.145 0 0)` | 11 |
| `--popover` | `oklch(1 0 0)` | 12 |
| `--popover-foreground` | `oklch(0.145 0 0)` | 13 |
| `--primary` | `oklch(0.205 0 0)` | 14 |
| `--primary-foreground` | `oklch(0.985 0 0)` | 15 |
| `--secondary` | `oklch(0.97 0 0)` | 16 |
| `--secondary-foreground` | `oklch(0.205 0 0)` | 17 |
| `--muted` | `oklch(0.97 0 0)` | 18 |
| `--muted-foreground` | `oklch(0.556 0 0)` | 19 |
| `--accent` | `oklch(0.97 0 0)` | 20 |
| `--accent-foreground` | `oklch(0.205 0 0)` | 21 |
| `--destructive` | `oklch(0.577 0.245 27.325)` | 22 |
| `--border` | `oklch(0.922 0 0)` | 23 |
| `--input` | `oklch(0.922 0 0)` | 24 |
| `--ring` | `oklch(0.708 0 0)` | 25 |
| `--chart-1` | `oklch(0.646 0.222 41.116)` | 26 |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | 27 |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | 28 |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | 29 |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | 30 |
| `--sidebar` | `oklch(0.985 0 0)` | 31 |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | 32 |
| `--sidebar-primary` | `oklch(0.205 0 0)` | 33 |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | 34 |
| `--sidebar-accent` | `oklch(0.97 0 0)` | 35 |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | 36 |
| `--sidebar-border` | `oklch(0.922 0 0)` | 37 |
| `--sidebar-ring` | `oklch(0.708 0 0)` | 38 |

**`.dark`**, `src/styles/global.css:41-73`, 31 właściwości. `--radius` w tym bloku nie występuje.

| Właściwość | Wartość | Linia |
| --- | --- | --- |
| `--background` | `oklch(0.145 0 0)` | 42 |
| `--foreground` | `oklch(0.985 0 0)` | 43 |
| `--card` | `oklch(0.205 0 0)` | 44 |
| `--card-foreground` | `oklch(0.985 0 0)` | 45 |
| `--popover` | `oklch(0.205 0 0)` | 46 |
| `--popover-foreground` | `oklch(0.985 0 0)` | 47 |
| `--primary` | `oklch(0.922 0 0)` | 48 |
| `--primary-foreground` | `oklch(0.205 0 0)` | 49 |
| `--secondary` | `oklch(0.269 0 0)` | 50 |
| `--secondary-foreground` | `oklch(0.985 0 0)` | 51 |
| `--muted` | `oklch(0.269 0 0)` | 52 |
| `--muted-foreground` | `oklch(0.708 0 0)` | 53 |
| `--accent` | `oklch(0.269 0 0)` | 54 |
| `--accent-foreground` | `oklch(0.985 0 0)` | 55 |
| `--destructive` | `oklch(0.704 0.191 22.216)` | 56 |
| `--border` | `oklch(1 0 0 / 10%)` | 57 |
| `--input` | `oklch(1 0 0 / 15%)` | 58 |
| `--ring` | `oklch(0.556 0 0)` | 59 |
| `--chart-1` | `oklch(0.488 0.243 264.376)` | 60 |
| `--chart-2` | `oklch(0.696 0.17 162.48)` | 61 |
| `--chart-3` | `oklch(0.769 0.188 70.08)` | 62 |
| `--chart-4` | `oklch(0.627 0.265 303.9)` | 63 |
| `--chart-5` | `oklch(0.645 0.246 16.439)` | 64 |
| `--sidebar` | `oklch(0.205 0 0)` | 65 |
| `--sidebar-foreground` | `oklch(0.985 0 0)` | 66 |
| `--sidebar-primary` | `oklch(0.488 0.243 264.376)` | 67 |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | 68 |
| `--sidebar-accent` | `oklch(0.269 0 0)` | 69 |
| `--sidebar-accent-foreground` | `oklch(0.985 0 0)` | 70 |
| `--sidebar-border` | `oklch(1 0 0 / 10%)` | 71 |
| `--sidebar-ring` | `oklch(0.556 0 0)` | 72 |

Kolory karty labiryntu nie są w tych blokach. `WorksheetHome.astro:8` ustawia na `main` trzy lokalne właściwości: `--pk-paper: #F6F1E8`, `--pk-ink: #3F3A34`, `--pk-sage: #7D8B74`.

### 2. Zmienne opublikowane w `@theme` / `@theme inline`

Warunek „poprawnie opublikowane” w tym arkuszu: klucz w `@theme` albo `@theme inline` ma wartość `var(--źródło)` albo `calc(var(--radius) ± …)`, a nie surowe `oklch` albo hex. Przy tym warunku klasa `.dark` może podmienić źródło bez przebudowy utility.

W `src/styles/global.css` jest jeden taki blok, `@theme inline` w liniach 75–111. Bloku `@theme` bez `inline` w tym pliku nie ma. Wszystkie 35 kluczy spełniają warunek powyżej.

Skala promienia, z `--radius` z `:root`:

| Klucz | Wartość | Linia |
| --- | --- | --- |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 76 |
| `--radius-md` | `calc(var(--radius) - 2px)` | 77 |
| `--radius-lg` | `var(--radius)` | 78 |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 79 |

Kolory, każdy jako `--color-<nazwa>: var(--<nazwa>)`. Nazwy źródłowe to 31 właściwości koloru z `:root` (wszystkie poza `--radius`):

| Klucz | Linia |
| --- | --- |
| `--color-background` | 80 |
| `--color-foreground` | 81 |
| `--color-card` | 82 |
| `--color-card-foreground` | 83 |
| `--color-popover` | 84 |
| `--color-popover-foreground` | 85 |
| `--color-primary` | 86 |
| `--color-primary-foreground` | 87 |
| `--color-secondary` | 88 |
| `--color-secondary-foreground` | 89 |
| `--color-muted` | 90 |
| `--color-muted-foreground` | 91 |
| `--color-accent` | 92 |
| `--color-accent-foreground` | 93 |
| `--color-destructive` | 94 |
| `--color-border` | 95 |
| `--color-input` | 96 |
| `--color-ring` | 97 |
| `--color-chart-1` | 98 |
| `--color-chart-2` | 99 |
| `--color-chart-3` | 100 |
| `--color-chart-4` | 101 |
| `--color-chart-5` | 102 |
| `--color-sidebar` | 103 |
| `--color-sidebar-foreground` | 104 |
| `--color-sidebar-primary` | 105 |
| `--color-sidebar-primary-foreground` | 106 |
| `--color-sidebar-accent` | 107 |
| `--color-sidebar-accent-foreground` | 108 |
| `--color-sidebar-border` | 109 |
| `--color-sidebar-ring` | 110 |

Sama nazwa `--radius` nie jest kluczem tego bloku; jest źródłem czterech kluczy `--radius-*`. Nazwy `--pk-paper`, `--pk-ink` i `--pk-sage` w tym bloku nie występują.

`@layer base` w liniach 117–124 nakłada `border-border`, `outline-ring/50`, `bg-background` i `text-foreground` na `*` oraz `body`. To konsumenci opublikowanych kolorów, nie osobna publikacja.

### 3. Komponenty fizycznie w `src/components/ui`

Glob `src/components/ui/**/*` zwrócił dwa pliki. Pliku baryłki `index` w tym katalogu nie ma.

| Plik | Tożsamość | Kotwica |
| --- | --- | --- |
| `src/components/ui/button.tsx` | nazwane eksporty `Button` i `buttonVariants` | `src/components/ui/button.tsx:50` |
| `src/components/ui/LibBadge.astro` | komponent Astro o nazwie pliku `LibBadge`; w pliku nie ma instrukcji `export` | `src/components/ui/LibBadge.astro:2-6` |

`components.json:3` ustawia styl `new-york`. Ten plik nie zawiera listy zainstalowanych komponentów.

Jedyny import `@/components/ui` w `src` jest w `src/components/auth/SubmitButton.tsx:3` i wskazuje `Button`.

### 4. Pliki w `src` z twardymi klasami kolorów

Zakres: 28 plików pasujących do `src/**/*.{astro,tsx,ts,css,jsx,js}`. Wzorzec szukał klas narzędziowych palety (`bg-`, `text-`, `border-`, `ring-`, `from-`, `to-`, `placeholder-` i pokrewnych prefiksów) z rodzinami `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `black`, `white`, także z odcieniem (`-200`) i przezroczystością (`/10`) oraz z prefiksem wariantu (`hover:`).

Wzorzec dopasował 11 plików. W dziesięciu z nich, poza `button.tsx`, nie ma klas `bg-primary`, `text-primary-foreground`, `text-muted-foreground`, `bg-background`, `bg-destructive` ani `bg-accent`.

**Ekrany startowe, bez klas semantycznych:**

| Plik | Klasy palety | Linie |
| --- | --- | --- |
| `src/pages/dashboard.astro` | `border-white/10`, `bg-white/10`, `text-white`, `from-blue-200`, `to-purple-200`, `text-blue-100/80`, `text-blue-100/50`, `border-white/20`, `hover:bg-white/20` | 9, 10, 13, 14, 16, 20 |
| `src/pages/auth/signup.astro` | `border-white/10`, `bg-white/10`, `text-white`, `from-blue-200`, `to-purple-200`, `text-blue-100/60`, `text-purple-300` | 10, 11, 15, 17 |
| `src/pages/auth/signin.astro` | `border-white/10`, `bg-white/10`, `text-white`, `from-blue-200`, `to-purple-200`, `text-blue-100/60`, `text-purple-300` | 10, 11, 15, 17 |
| `src/pages/auth/confirm-email.astro` | `border-white/10`, `bg-white/10`, `text-white`, `from-blue-200`, `to-purple-200`, `text-blue-100/80`, `text-purple-300` | 23, 25, 28, 29 |

**Kontrolki logowania, bez klas semantycznych:**

| Plik | Klasy palety | Linie |
| --- | --- | --- |
| `src/components/auth/FormField.tsx` | `bg-white/10`, `text-white`, `placeholder-white/40`, `text-blue-100/80`, `text-white/40`, `border-red-400/60`, `focus:ring-red-400`, `border-white/20`, `focus:ring-purple-400`, `text-red-300` | 6, 37, 41, 53, 59 |
| `src/components/auth/SubmitButton.tsx` | `bg-purple-600`, `text-white`, `hover:bg-purple-500`, `border-white/30`, `border-t-white` | 18, 22 |
| `src/components/auth/PasswordToggle.tsx` | `text-white/40`, `hover:text-white/70` | 13 |
| `src/components/auth/ServerError.tsx` | `border-red-500/30`, `bg-red-900/30`, `text-red-300` | 11 |
| `src/components/auth/SignUpForm.tsx` | `text-blue-100/50` | 59 |
| `src/components/ui/LibBadge.astro` | `bg-blue-900/50`, `text-blue-200`, `bg-purple-500/30`, `text-purple-200` | 10, 12 |

**Mieszane:** `src/components/ui/button.tsx:14` ma `text-white` na wariancie `destructive`. Ten sam plik na liniach 12–19 używa `bg-primary`, `text-primary-foreground`, `bg-destructive`, `bg-background`, `bg-secondary`, `text-secondary-foreground`, `bg-accent`, `text-accent-foreground` i `text-primary`.

Pozostałe 17 plików z zestawu 28 nie zawiera dopasowania tego wzorca palety. To nie znaczy, że nie mają żadnego zapisanego koloru:

- `src/components/WorksheetHome.astro:13` ma klasę `text-[#5B554C]`. To arbitralny hex, nie krok palety i nie klasa semantyczna.
- Ten sam plik, linia 7, używa `bg-[var(--pk-paper)]` i `text-[var(--pk-ink)]`. To odwołania do lokalnych zmiennych, nie do `--color-primary` ani palety.
- `src/components/WorksheetGenerator.tsx:48` używa `bg-[var(--pk-sage)]` i `text-[var(--pk-paper)]`; linia 72 używa `ring-[var(--pk-ink)]`.
- `src/components/WorksheetGenerator.tsx:76` ustawia atrybut SVG `fill="#fff"`, nie klasę Tailwinda.
- `src/styles/global.css:114` trzyma hex `#0a0e1a` i `#0f1529` wewnątrz `@utility bg-cosmic`.

### 5. Brakujące prymitywy UI docelowego widoku

Docelowy widok danych labiryntu, w zakresie otwartego kamienia, to strona `/`. `src/pages/index.astro:5-7` renderuje `WorksheetHome` bez banera konfiguracji. `WorksheetHome.astro:15` montuje `WorksheetGenerator` z `client:load`. Wyspa trzyma labirynt w stanie i po kliknięciu `Generuj` rysuje SVG 210×297, gdy `countPaths` zwraca 1 (`src/components/WorksheetGenerator.tsx:36-52` i `70-110`).

Kontrakt tego widoku, `context/changes/first-printable-maze/plan.md:115`, wymaga elementu `<button type="button">` z tekstem `Generuj` oraz SVG. Nie wymienia nazwy komponentu z `src/components/ui`. Plan F-01, `context/archive/2026-09-28-worksheet-page-shell/plan.md:13`, też zostawia przycisk strony głównej jako statyczny HTML, bo wtedy nie miał zachowania.

Przy tym kontrakcie zestaw brakujących plików prymitywów jest pusty: żaden wymagany przez S-01 albo F-01 komponent shadcn nie jest nieobecny w `src/components/ui`. Plik `button.tsx` już tam jest. Widok go nie importuje; jedyny import `@/components/ui` w `src` jest w `SubmitButton.tsx:3`.

Dane karty (ściany, napisy Start i Meta) są rysowane jako SVG w `WorksheetGenerator.tsx:70-110`. Plan S-01 nie wymaga do tego `Card`, `Table` ani innego prymitywu z katalogu shadcn.

Plany późniejszych plasterków (postać, profile, druk) nie nazywają brakujących plików w `src/components/ui`. Tego zestawu nie da się z tych planów wypisać.

## Code References

- `src/styles/global.css:6-39` — 32 właściwości `:root`
- `src/styles/global.css:41-73` — 31 właściwości `.dark`
- `src/styles/global.css:75-111` — jedyny blok `@theme inline`, 35 kluczy przez `var()`
- `src/layouts/Layout.astro:2` — import arkusza
- `src/components/ui/button.tsx:50` — eksport `Button` i `buttonVariants`
- `src/components/ui/LibBadge.astro:10-12` — klasy `bg-blue-900/50` i `bg-purple-500/30`
- `src/components/WorksheetHome.astro:7-15` — lokalne `--pk-*` i montaż wyspy
- `src/components/WorksheetGenerator.tsx:45-51` — natywny przycisk `Generuj`
- `src/pages/index.astro:5-7` — trasa `/`

## Architecture Insights

W tym repozytorium są dwa źródła koloru, i widok produktu czyta drugie.

Globalny zestaw shadcn żyje w `:root` / `.dark` i jest publikowany przez `@theme inline` jako `--color-*`. Bazowa warstwa nakłada `bg-background` i `text-foreground` na `body`. Ekrany `/auth/*` i `/dashboard` tego nie używają: malują się klasami palety i utility `bg-cosmic`.

Widok `/` nie czyta `--color-*`. Kolory kartki są trzema właściwościami na `main` (`--pk-paper`, `--pk-ink`, `--pk-sage`), a zdanie pod nagłówkiem ma osobny hex `text-[#5B554C]`. Generowanie i rysunek labiryntu są w `WorksheetGenerator`; katalog `src/components/ui` nie bierze w tym udziału.

## Historical Context (from prior changes)

- `context/archive/2026-09-28-worksheet-page-shell/plan-brief.md:35` — kolory Montessori miały zostać w komponencie strony głównej, poza globalnym `:root`. **Wsparte:** `WorksheetHome.astro:8` nadal trzyma `#F6F1E8`, `#3F3A34` i `#7D8B74` na `main`, a przeczytany `:root` tych hexów nie zawiera.
- `context/archive/2026-09-28-worksheet-page-shell/reviews/impl-review.md:41` — papier, węgiel i akapit `#5B554C` żyją w jednym komponencie; `#5B554C` nie było w kontrakcie; globalne tokeny shadcn zostały nietknięte; S-01 / S-02 miały użyć jednego źródła. **Częściowo:** trzy nazwane kolory są jednym atrybutem `style` na `main`, ale `#5B554C` nadal jest osobną klasą w `WorksheetHome.astro:13`. Globalny `:root` nadal nie zawiera tych hexów. Jedno źródło dla S-02 nie zostało w tym przeglądzie sprawdzone, bo `print-a4-maze` nie ma planu.
- `context/changes/first-printable-maze/plan.md:36` i `:123` — nie zmieniać globalnych tokenów shadcn; `--pk-*` definiować na `main`, nie w `:root`. **Wsparte** przez aktualny `global.css` i `WorksheetHome.astro:8`.
- `context/changes/first-printable-maze/plan.md:115` — kontrolka to natywny `<button type="button">`. **Wsparte** przez `WorksheetGenerator.tsx:45-47`.

## Related Research

W `context/changes/` i `context/archive/` nie ma pliku `research.md` poza tym dokumentem. Wcześniejsze notatki o kolorach są w planach i recenzji F-01 oraz w planie S-01, cytowanych wyżej.

## Open Questions

- Czy `--pk-paper`, `--pk-ink`, `--pk-sage` i `#5B554C` mają wejść do `:root` / `@theme inline`, jest decyzją następnej zmiany UI. Ten przegląd tylko stwierdza, że dziś są poza tym blokiem.
- Prymitwy dla wyboru postaci, profili i druku nie mają planu, który wymieniałby pliki w `src/components/ui`.
