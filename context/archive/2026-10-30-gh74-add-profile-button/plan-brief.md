# Przycisk „Dodaj profil” odróżnia się od wierszy profili — Plan Brief

> Full plan: `context/changes/gh74-add-profile-button/plan.md`

## What & Why

W oknie profilu „Dodaj profil” wygląda jak wiersz z imieniem dziecka. Zmieniamy go na wyraźną akcję: obramowanie i ikona Plus. GitHub #74.

## Starting Point

`ProfileCorner.tsx:484` używa `variant="ghost"` i `DIALOG_ROW_CLASS`, tak jak wiersze imion i „Bez profilu”.

## Desired End State

Obramowany, wyśrodkowany przycisk z ikoną Plus na dole listy; reszta wierszy bez zmian. Makieta: `mockup.html`.

## Key Decisions Made

| Decision | Choice | Why | 
| -------- | ------ | --- |
| Wygląd | `outline` + ikona Plus | Bez nowego koloru, zgodnie z regułami UI |
| Zakres | Tylko ten przycisk | `DIALOG_ROW_CLASS` jest współdzielony |
| Test | Jedna asercja e2e | Pilnuje ikony i ramki; nazwa dostępna bez zmian |

## Scope

**In scope:** przycisk „Dodaj profil”, jeden test e2e.

**Out of scope:** „Bez profilu”, wiersze imion, `button.tsx`, tokeny kolorów.

## Architecture / Approach

Zmiana wariantu i dziecka jednego `Button` w komponencie React.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| ----- | ---------------- | -------- |
| 1. Wygląd i test | Nowy przycisk + asercja e2e | Wąski telefon: przycisk nie może się ucinać |

Prerequisites: brak. Estimated effort: ok. 30 minut.
