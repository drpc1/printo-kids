# Kolory na karcie „Skopiuj rysunek na kratce” — plan

## Cel

Rodzic włącza na pasku przełącznik „Kolory” (domyślnie wyłączony). Lewa kratka z sylwetką ma wtedy prawdziwe kolory kredek (kolory kratek szablonu, dziury w sylwetce kolorem szablonu albo białe, jak w symetrii, US-09); prawa kratka zostaje pusta, a dziecko koloruje ją według wzoru. Przełącznik nie układa nowej karty. Profil i ostatnie parametry pamiętają kolory jak poziom.

## Decyzje (z symetrii, bez nowych pytań)

- Kolor kratki = kolor z szablonu (`SymmetryCell.color`), token `var(--symmetry-*)` z `global.css`, bez hexów.
- Dziury w sylwetce (puste kratki otoczone sylwetką) dostają `holeColor` szablonu, a gdy jest `null`, zostają białe (jak `holeDetails` w symetrii, US-09).
- Wyłączone kolory = dziś: czarna sylwetka. Karta (`CopyDrawingCard`), jej klucz, `contentKey` (`level|category`) i silnik bez zmian: kolory liczy tylko rysunek z `templateId` i `variants`.
- Druk kolorowy na kolorowej drukarce, na czarno-białej szarości (jak symetria).

## Zakres

W: PRD (US-27, US-28, tabela profilu, FR-037/FR-038, NFR), ustawienie `colors` w `kopiuj`, funkcja kolorów, rysunek lewej kratki, przełącznik na pasku, miniatura bez zmian (domyślnie czarna), testy, e2e.
Poza: kolory w prawej kratce, kolory w miniaturze, zmiana układu.

## Faza 1: Kolory na karcie

Changes Required:

- `context/foundation/prd.md`: US-27 (zdanie o czarnej sylwetce → domyślnie czarna, z kolorami po włączeniu), US-28 (poziom, kategoria i kolory pamięta profil), tabela „Profil i zapamiętane ustawienia” (Skopiuj rysunek: poziom, kolory, kategoria), FR-037/FR-038, zdanie „czarny druk” w NFR i Business Logic karty (kolory jak US-09).
- `src/lib/copy-drawing/colors.ts` (nowy) + `colors.test.ts`: `copyDrawingCellColors(card)` → siatka `SymmetryColor | null` (kolor szablonu z `nonogramImage`-owego układu i wyśrodkowania, dziury z `holeColor`), ta sama kolejność przesunięć co `centerSilhouette`.
- `src/lib/card-settings.ts`: `CopyDrawingSettings` dostaje `colors: boolean`, domyślnie `false`; wpisy w `DEFAULTS`/parsowaniu jak `niepasuje`.
- `src/lib/card-summary.ts`: podsumowanie profilu uwzględnia kolory jak symetria.
- `src/components/CopyDrawingGenerator.tsx`: `SettingToggle` „Kolory” (jak `SymmetryGenerator`), `memory.remember({ colors })`, bez nowej karty.
- `src/components/CopyDrawingSheet.tsx`: prop `colors`; lewa siatka maluje kratki kolorami z `copyDrawingCellColors`, bez kolorów jak dziś.
- Testy: `card-settings.test.ts`, `card-summary.test.ts`, `print-contract.test.ts` (druk kolorów), e2e `copy-drawing.spec.ts` (przełącznik nie zmienia `data-card-key`, kolor kratki), `card-settings.spec.ts`, `phone-toggle-align.spec.ts`, `profile-summary.spec.ts`.

Success Criteria:

Automated: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, e2e (`E2E_PORT=4399`, projekty chromium, phone-360, pixel-7, tablet-768).
Manual: karta z kolorami i bez na ekranie, wydruk kolorowy A4 (czy kolor lewej kratki jest czytelny przy kratce 5 mm), przełącznik nie zasłania Generuj/Drukuj na telefonie.

## Progress

### Phase 1: Kolory na karcie

- [x] 1.1 PRD zgodne z kolorami
- [x] 1.2 `copyDrawingCellColors` z testami
- [x] 1.3 Ustawienie `colors` w profilu i podsumowaniu
- [x] 1.4 Przełącznik i rysunek na stronie
- [x] 1.5 Testy jednostkowe i e2e
- [x] 1.6 Bramki: test, lint, depcruise, astro check, build, e2e
- [ ] 1.7 Ręcznie: karta i wydruk w kolorze
