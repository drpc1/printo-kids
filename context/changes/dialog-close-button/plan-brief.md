# Przycisk X zamyka dialog po polsku — Plan Brief

> Full plan: `context/changes/dialog-close-button/plan.md`

## What & Why

Dialog postaci i okno profilu da się dziś zamknąć klawiszem Escape albo kliknięciem w tło. Na telefonie tło łatwo przeoczyć. Rodzic dostaje krzyżyk, który zamyka te okna w ten sam sposób, z polską nazwą dla czytnika.

## Starting Point

`DialogContent` już rysuje krzyżyk, a oba okna podają `showCloseButton={false}`. Ukryty napis to angielskie „Close”. Na pytaniu o usunięcie próba zamknięcia wraca na listę i nie kasuje profilu. „Anuluj” w edycji oraz w formularzu, gdy profil już jest, wraca na listę. Żaden test nie montuje tych dialogów.

## Desired End State

W prawym górnym rogu obu okien widać samą ikonę X. Czytnik mówi „Zamknij”. Krzyżyk zamyka okno jak Escape. Na „Usunąć profil …?” wraca na listę, profil zostaje, a okno zostaje otwarte. X nie zasłania ołówka, kosza ani pierwszego wiersza i zostaje w rogu, gdy lista się przewija.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) |
| --- | --- | --- |
| Krzyżyk | Jeden na dialog, nie na panel | Rodzic zamyka okno, a krok wewnątrz zostaje przy „Anuluj” |
| Wygląd | Sama ikona, nazwa „Zamknij” dla czytnika | Prośba była o przycisk X, a angielskie „Close” schodzi z jedynego napisu |
| Usuwanie | X wraca na listę | Tak jak Escape i „Anuluj”; profil zostaje |
| Pozostałe widoki | X zamyka całe okno | Tak jak Escape, także z listy postaci wewnątrz profilu |
| „Anuluj” | Gdy profil już jest, wraca na listę | Edycja i formularz mają wtedy osobny gest od zamknięcia okna |
| Sprawdzenie | Ręcznie, bez nowego testu UI | `npm test` nie montuje dialogów |

## Scope

**In scope:** włączenie istniejącego krzyżyka na dialogu postaci i w rogu profilu, napis „Zamknij”, powrót na listę z pytania o usunięcie, odstęp od pierwszego wiersza, krzyżyk przypięty do rogu przy przewijaniu.

**Out of scope:** osobny X w każdym panelu, widoczne słowo „Zamknij”, tooltip, zmiana Escape i „Anuluj”, zamknięcie całego okna z potwierdzenia usunięcia, nowy test UI, włączanie stopki dialogu.

## Architecture / Approach

Zostaje `DialogPrimitive.Close` w `DialogContent`. Woła `onOpenChange(false)`, a osłona w `handleProfileOpenChange` na panelu `delete` już zamienia to w `cancelDelete`. Faza 1 tylko włącza krzyżyk i podmienia napis. Faza 2 rozsuwa róg i, jeśli przewijanie zabiera X, przenosi `overflow-y-auto` na treść panelu.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Krzyżyk i polska nazwa | X na obu oknach, nazwa „Zamknij”, usuwanie wraca na listę | Własny `onClick` na krzyżyku obszedłby osłonę usuwania |
| 2. Odstęp w rogu | X nie zasłania pierwszego wiersza i zostaje przy przewijaniu | `overflow-y-auto` na tym samym elemencie może zabrać X z rogu |

**Prerequisites:** brak. Krzyżyk jest już w `src/components/ui/dialog.tsx`.
**Estimated effort:** jedna sesja, dwie krótkie fazy.

## Open Risks & Assumptions

- Założenie: kontrolowany dialog zostaje otwarty, gdy `onOpenChange(false)` na usuwaniu wraca wcześniej i nie ustawia `profileOpen`. To jest dzisiejsza osłona Escape; krzyżyk ma w nią wpaść.
- `npm test` nie złapie regresji gestu. Zostaje ręczne przejście listy z fazy 1 i rogu z fazy 2.

## Success Criteria (Summary)

- Czytnik nazywa krzyżyk „Zamknij”, a na ekranie widać samą ikonę.
- X zamyka dialog postaci i okno profilu jak Escape, a na pytaniu o usunięcie wraca na listę bez kasowania.
- Ołówek, kosz i pierwszy wiersz postaci zostają klikalne, także po przewinięciu i na wąskim oknie.
