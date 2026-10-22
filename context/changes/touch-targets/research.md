---
date: 2026-10-22T21:59:53+02:00
researcher: Grok 4.7
git_commit: 38e3b82f1709cfcb76c52774ac1bbae1528f467c
branch: maze
repository: printo-kids (drpc1/printo-kids)
topic: "Co ma zrobić zmiana touch-targets: pole dotyku Profilu i krzyżyka oraz kolumna z paskiem przewijania"
tags: [research, codebase, touch-targets, ProfileCorner, dialog, useScrollIndicator]
status: complete
last_updated: 2026-10-22
last_updated_by: Grok 4.7
---

# Research: Co ma zrobić zmiana touch-targets

**Date**: 2026-10-22T21:59:53+02:00
**Researcher**: Grok 4.7
**Git Commit**: 38e3b82f1709cfcb76c52774ac1bbae1528f467c
**Branch**: maze
**Repository**: printo-kids (drpc1/printo-kids)

## Research Question

Notatka `touch-targets` i issue #37 opisują róg okna i przycisk Profilu. Co z tego jest nadal prawdą w kodzie na `maze`, co jest już ustalone, i które decyzje plan musi podjąć, zanim da się ruszyć geometrię?

## Summary

Na `maze` (`38e3b82`) przycisk Profilu nadal ma klasy `h-auto px-2 py-1 text-base`, a krzyżyk dialogu to ikona `size-4` bez paddingu. Cel z notatki zostaje: na `pointer-coarse` podnieść pole Profilu do co najmniej 44 px wysokości bez zmiany napisu, powiększyć pole krzyżyka do około 36–44 px wokół tej samej ikony, przejąć `focus-visible:` z `button.tsx`, usunąć martwe `data-[state=open]:` na krzyżyku i dopisać komentarz łączący `pr-4`, `right-4` i offset szyny. Issue #37 jest otwarte i ma być zrobione w tej samej zmianie: krzyżyk bezpośrednio nad rysowanym paskiem.

Powiększenie pola przy dzisiejszym `top-4 right-4` nie przesuwa ikony nad szynę. Szyna stoi 7 px na prawo od ramki ikony. Stara definicja „bezpośrednio nad” (wspólne lewa i prawa krawędź ramki 16 px i rynny 16 px) nie przenosi się na szynę 6 px. Plan ma wybrać kotwicę i rozmiar krzyżyka oraz nową definicję kolumny. PRD nie podaje rozmiaru pola dotyku. Ta sesja nie mierzyła układu w przeglądarce.

## Detailed Findings

### Przycisk Profilu

Jedyny wołający to `WorksheetGenerator` i nie podaje `className` (`src/components/WorksheetGenerator.tsx:155-165`). Trigger w `src/components/ProfileCorner.tsx:329-338` ma klasy:

`text-muted-foreground hover:text-foreground absolute top-4 right-4 z-40 h-auto max-w-48 px-2 py-1 text-base font-normal print:hidden sm:pointer-fine:fixed`

Napis to `cornerLabel`: „Profil” albo imię (`src/components/ProfileCorner.tsx:61`, `337`). Na tym triggerze nie ma ikony. `h-auto`, `px-2` i `py-1` nadpisują domyślne `h-9 px-4 py-2` z `src/components/ui/button.tsx:22`. Żaden breakpoint nie zmienia wysokości.

Przy korzeniu 16 px, `--spacing: 0.25rem` (`src/styles/global.css:58`) i domyślnym pudełku `text-base` 1.5rem (w `src/styles/global.css` i `src/layouts/Layout.astro` nie ma własnego `font-size` ani `line-height` na `html`/`body`; `src/components/WorksheetHome.astro:36-38` ustawia `line-height: 2rem` tylko na `h1` wewnątrz `.has-maze`) wysokość to 24 px + `py-1` (4 px + 4 px) = 32 px. Szerokość jest szerokością napisu, do `max-w-48`. Zapis 39×32 z 2026-10-18 dla imienia „Ala” (`context/changes/touch-targets/change.md:16`) pasuje do tej wysokości; 39 px to pomiar tego napisu, nie klasa, i ta sesja go nie powtórzyła w przeglądarce.

`pointer-coarse` w `src/` występuje przy pasku dialogu (`src/components/ui/dialog.tsx:63`, `74`), nie przy wysokości kontrolek. W `src/` nie ma `min-h-11`, `h-11` ani `size-11`.

### Kontrolki, które już mają około 44 px

`ACTION_BUTTON_CLASS` (`src/components/WorksheetGenerator.tsx:22-23`) jest na Generuj i Drukuj. Poniżej `sm`, przy tym samym korzeniu 16 px: pudełko `text-base` 24 px + `py-2.5` (10 px + 10 px) = 44 px. Od `sm`: pudełko `text-lg` 1.75rem (28 px) + `py-3.5` (14 px + 14 px) = 56 px. Te 44 px obowiązują więc tylko poniżej `sm`.

`DIALOG_ROW_CLASS` (`src/components/ProfileCorner.tsx:24-25`) daje 44 px po obu stronach `sm`: poniżej `sm` jak wyżej, od `sm` pudełko `text-lg` 28 px + `py-2` (8 px + 8 px) = 44 px. Komentarz nad stałą to mówi. Wiersz listy postaci z obrazkiem `size-10` (40 px, `src/components/ProfileCorner.tsx:600`) jest wyższy niż samo pudełko tekstu. Nota planu S-09 już to zapisała: na telefonie taki wiersz ma 60 px (`context/archive/2026-10-13-phone-worksheet/plan.md:251`).

Dwa triggery paska, postać i poziom, mają ten sam model co Profil: `h-auto gap-1.5 px-2 py-1 text-base` (`src/components/WorksheetGenerator.tsx:264` i `306`). Przy tym samym liczeniu co Profil ich część tekstowa ma 32 px wysokości. Tytuł i notatka `touch-targets` ich nie wymieniają. Ołówek i kosz zostają `size="icon"` (`size-9`, 36 px, `src/components/ui/button.tsx:25`); plan S-09 kazał ich nie ruszać (`context/archive/2026-10-13-phone-worksheet/plan.md:249`).

### Krzyżyk, pas nad wierszem i szyna

`showCloseButton` domyślnie jest `true` (`src/components/ui/dialog.tsx:41`). Żaden z trzech `DialogContent` nie podaje `false` ani własnego paddingu: profil (`src/components/ProfileCorner.tsx:340`), „Wybierz postać” (`src/components/WorksheetGenerator.tsx:274`), „Wybierz poziom” (`src/components/WorksheetGenerator.tsx:313`). Każdy dostaje ten sam krzyżyk.

Przy włączonym krzyżyku padding treści to `pt-14 pr-4` nad `p-6` (`src/components/ui/dialog.tsx:53-54`): góra 56 px, prawo 16 px, dół i lewo 24 px. Krzyżyk (`src/components/ui/dialog.tsx:80-88`) nie ma szerokości, wysokości ani paddingu. `XIcon` nie ma klasy `size-*`, więc obowiązuje `[&_svg:not([class*='size-'])]:size-4`. Przy skali 4 px klasa `top-4 right-4` stawia ramkę 16×16 na y 16–32 i 16–32 px od prawej krawędzi paddingu.

Ciało przewijania ma `-m-1` i `p-1` (`src/components/ui/dialog.tsx:63`). Górna krawędź ciała jest na 56 − 4 = 52 px, a pierwszy wiersz, po oddaniu `p-1`, znów na 56 px. Szyna (`src/hooks/useScrollIndicator.ts:33-36`) dostaje `top = offsetTop` ciała i `left = offsetLeft + offsetWidth + 3`, szerokość `w-1.5` (6 px, `src/components/ui/dialog.tsx:74`). W prawym paddingu 16 px ciało zajmuje wewnętrzne 4 px (`-m-1`), zostaje pasek 12 px, a `+ 3` i 6 px dzielą go na 3 + 6 + 3. Między prawą krawędzią ikony (16 px od prawej) a lewą krawędzią szyny (9 px od prawej) zostaje 7 px. Szyna zaczyna się na y 52, 20 px pod ikoną.

To samo liczenie przy szerokości viewportu 375 px, obramowaniu `border` 1 px i `max-w-[calc(100%-2rem)]` daje krzyżyk na x 326–342 i szynę na x 349–355. Pokrywa się z komentarzem w issue #37 z 2026-10-21. To arytmetyka klas, nie nowy pomiar w przeglądarce.

Pole 36 px lub 44 px, liczone od krawędzi paddingu, przy dwóch kotwicach:

| Pole | Środek na dzisiejszej ikonie (środek 24 px od góry i od prawej) | Przypięte do `top-4 right-4` (rośnie w lewo i w dół) |
| --- | --- | --- |
| 36 px | y 6–42, prawa krawędź 6 px od prawej. Nad pierwszym wierszem (56) o 14 px i nad szyną (52) o 10 px. Nachodzi na zakres x szyny, ale zostaje nad nią. | Dół na 52. Nad wierszem o 4 px. Od szyny wciąż 7 px, bo nie rośnie w prawo. |
| 44 px | y 2–46, prawa krawędź 2 px od prawej. Nad wierszem o 10 px, nad szyną o 6 px. Też tylko nachodzi na zakres x szyny. | Dół na 60. Wchodzi w pierwszy wiersz o 4 px. Od szyny wciąż 7 px. |

Przegląd `dialog-close-button` proponował `size-9`/`size-11` przy `top-2 right-2` i liczył, że 44 px od `top-2` kończy się na 52 px, pod pasem 56 px (`context/archive/2026-10-16-dialog-close-button/reviews/impl-review.md:46-49`). Ta propozycja nie jest przyjęta. Przy `right-2` (8 px od prawej) ramka 44 px i szyna (3–9 px od prawej) stykają się na 1 px szerokości.

### Fokus i martwe klasy

Wspólny przycisk ma `outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]` (`src/components/ui/button.tsx:8`). Krzyżyk ma `focus:ring-2 focus:ring-offset-2 focus:outline-hidden` oraz `data-[state=open]:bg-accent data-[state=open]:text-muted-foreground` (`src/components/ui/dialog.tsx:83`).

W `@radix-ui/react-dialog` 1.1.23 `DialogClose` renderuje przycisk bez `data-state` (`node_modules/@radix-ui/react-dialog/dist/index.mjs:272-286`). `data-state` dostaje treść dialogu (`index.mjs:234`) i trigger (`index.mjs:79`). Wariant `data-[state=open]:` pasuje do atrybutu na tym samym elemencie, więc na krzyżyku te dwie klasy w tej wersji Radixa nie mają stanu, do którego mogłyby się dopasować. Na overlayu i treści te same nazwy wariantów są żywe, bo te elementy atrybut dostają (`src/components/ui/dialog.tsx:30`, `53`).

Komentarza, że `pr-4` należy do `right-4` i do `+ 3` w haku, w `dialog.tsx` nie ma. Haczyk ma inne zdanie: szyna stoi w prawym paddingu, na wysokości ciała (`src/hooks/useScrollIndicator.ts:33`).

### Issue #37 i zakres produktu

Issue [drpc1/printo-kids#37](https://github.com/drpc1/printo-kids/issues/37) jest OPEN, etykieta `bug`, tytuł „Przycisk X w oknie ma być bezpośrednio nad paskiem przewijania”. Treść: X i pasek nie stoją w jednej kolumnie; ma być „X jest bezpośrednio nad paskiem przewijania”; PRD i roadmapa bez zmian. Komentarz z 2026-10-21 mówi, że obie poprawki ruszają ten sam róg i mają iść z `touch-targets`. Osobnego issue dla `touch-targets` nie ma: wyszukanie tej nazwy w tytułach, treściach i komentarzach zwróciło tylko #37.

W `context/foundation/prd.md` akapit US-04 (`:102-108`) i wymagania niefunkcjonalne (`:148-158`) nie podają pikseli pola dotyku, fokusu ani chromu dialogu. Najbliższe zdania to używalność Profilu i wyboru postaci (`prd.md:106`) oraz nienachodzenie Generuj i Drukuj (`prd.md:154`). Wyszukanie w `context/foundation` haseł `WCAG`, `pole dotyku` i `touch-targets` trafiło tylko wiersz przekazania S-09.

Roadmapa stawia `touch-targets` poza kamieniem M-1 (`context/foundation/roadmap.md:259`): „Dalej: `print-browser-coverage`, `print-printer-margins`, `touch-targets` (poza kamieniem)”.

## Code References

- `src/components/ProfileCorner.tsx:24-25` — `DIALOG_ROW_CLASS`, 44 px po obu stronach `sm`
- `src/components/ProfileCorner.tsx:329-338` — trigger Profilu, `h-auto px-2 py-1 text-base`
- `src/components/WorksheetGenerator.tsx:22-23` — Generuj i Drukuj, 44 px poniżej `sm`
- `src/components/WorksheetGenerator.tsx:264` i `:306` — postać i poziom na pasku, ten sam `px-2 py-1 text-base`
- `src/components/ui/dialog.tsx:53-54` — `pt-14 pr-4` przy krzyżyku
- `src/components/ui/dialog.tsx:80-88` — krzyżyk `top-4 right-4`, ikona `size-4`, fokus `focus:`
- `src/hooks/useScrollIndicator.ts:33-36` — szyna: `offsetLeft + offsetWidth + 3`
- `src/components/ui/button.tsx:8` — `focus-visible:` wspólnego przycisku
- `node_modules/@radix-ui/react-dialog/dist/index.mjs:272-286` — `DialogClose` bez `data-state`, pakiet 1.1.23

## Architecture Insights

Krzyżyk, pas `pt-14` i szyna są jedną implementacją w `DialogContent`. Trzy okna (profil, postać, poziom) dziedziczą każdy ruch tego rogu. Szyna jest rysowana tylko przy `pointer-coarse` i `data-scrollable`; na wskaźniku precyzyjnym zostaje natywny pasek, którego ta sesja nie mierzyła. Issue #37 też mówi, że na komputerze z natywnym paskiem nie zmierzono kolumny, bo Chromium bez okna nakłada paski.

Powiększenie pola i ustawienie ikony nad szyną to dwa różne ruchy. Pole przypięte do `top-4 right-4` rośnie w lewo i w dół. Szyna jest na prawo od ikony. Samo większe pole jej nie dogania.

## Historical Context (from prior changes)

- Wspierane. Plan S-09 wymaga co najmniej 44 px dla Generuj i Drukuj poniżej `sm` oraz dla wierszy dialogów (`context/archive/2026-10-13-phone-worksheet/plan.md:84`, `:247`). Nie wymaga tego dla Profilu. Przegląd końcowy zmierzył trigger na około 32 px i odłożył `pointer-coarse:min-h-11` do tej zmiany (`reviews/impl-review-final.md:52-54`). Werdykt: luka nadal jest w klasach triggera.
- Wspierane. Plan `dialog-close-button` ustalił cel kliknięcia „co najmniej taki, jak ikona `size-4`” (`plan.md:115`). Przegląd nazwał 16×16 luką planu, nie dryfem, i odłożył większe pole, fokus oraz komentarz przy `pr-4` (`reviews/impl-review.md:39-56`, `:68-76`, `:88-96`). Werdykt: klasy krzyżyka są nadal te z tamtej decyzji.
- Wspierane jako ówczesny kontrakt, niespełnione wobec dzisiejszej szyny. `dialog-close-above-scrollbar` zdefiniowało „bezpośrednio nad” jako wspólne lewą i prawą krawędź ramki X i rynny 16 px oraz zostawiło `pt-14` (`plan.md:39-43`, `:59`). Późniejsza szyna S-09 ma 6 px i stoi w pozostałych 12 px paddingu (`context/archive/2026-10-13-phone-worksheet/reviews/impl-review-phase-6-scrollbar.md:25`). Komentarz #37 opisuje skutek: kolumna się rozjechała. Werdykt: kontrakt 16 px na 16 px nie opisuje szyny 6 px.
- Częściowe. Notatka zmiany mówi „ikona i napis bez zmian” (`change.md:19`). Trigger Profilu nie ma ikony. Zdanie pasuje do krzyżyka i do napisu Profilu; ikony Profilu nie ma czego zachować.

## Related Research

- `context/archive/2026-10-13-phone-worksheet/research.md` — wcześniejsze pytanie o telefon i druk; ta sesja czytała plan i przeglądy S-09, nie cały tamten research.
- `context/archive/2026-10-16-dialog-close-button/reviews/impl-review.md` — źródło odłożonego pola krzyżyka i fokusu.
- `context/archive/2026-10-16-dialog-close-above-scrollbar/plan.md` — źródło definicji wspólnej kolumny dla rynny 16 px.

## Open Questions

- Kotwica i rozmiar krzyżyka: 36 czy 44 px, oraz czy ramka zostaje przy `top-4 right-4`, środkuje się na ikonie, czy schodzi do `top-2 right-2`. Od tego zależy, czy dół wchodzi w pierwszy wiersz.
- Nowa definicja „bezpośrednio nad” dla szyny 6 px. Stara (wspólne obie krawędzie z ramką 16 px) nie ma tu zastosowania. Do ustalenia, czy kolumna dotyczy ikony, czy całego pola dotyku, i czy na wskaźniku precyzyjnym (natywny pasek) coś się zmienia. Tej sesji nie mierzono.
- Czy triggery postaci i poziomu na pasku (te same `px-2 py-1 text-base`, część tekstowa 32 px przy korzeniu 16 px) wchodzą w tę zmianę. Tytuł i notatka mówią o Profilu i krzyżyku.
- Sprawdzenie na iPhonie zostaje warunkiem z notatki (`change.md:21`). Ta sesja go nie wykonała.
