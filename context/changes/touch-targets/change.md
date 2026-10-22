---
change_id: touch-targets
title: Większe pola dotyku przycisku profilu i krzyżyka w oknach
status: impl_reviewed
created: 2026-10-18
updated: 2026-10-23
archived_at: null
---

## Notes

Z przeglądów zamykających 2026-10-18 (`phone-worksheet` F2, `dialog-close-button` F2, F4, F6; raporty w `context/archive/` po archiwizacji tych zmian).

Pomiar na telefonie 375×812:

- Przycisk profilu w rogu strony (`src/components/ProfileCorner.tsx`, trigger `h-auto px-2 py-1 text-base`): 39×32 px przy imieniu „Ala”. Generuj, Drukuj i wiersze okien mają 44 px.
- Krzyżyk w rogu okien (`src/components/ui/dialog.tsx`, `DialogPrimitive.Close`, ikona `size-4` bez odstępu): 16×16 px, poniżej 24 px z WCAG 2.5.8. Na liście postaci to jedyny widoczny sposób wyjścia bez wyboru.

Cel: ikona i napis bez zmian, rośnie tylko pole dotyku (Profil co najmniej 44 px wysokości na `pointer-coarse`, X ok. 36–44 px wokół ikony). Przy okazji X dostaje fokus w stylu `focus-visible:` z `button.tsx` i bez martwych klas `data-[state=open]:…`; komentarz, że `pr-4` okna wiąże się z `right-4` krzyżyka i przesunięciem szyny w `useScrollIndicator.ts`.

Ryzyko: róg okna ma 56 px pasa nad pierwszym wierszem (`pt-14`) i szynę paska przewijania po prawej; większy X musi się zmieścić między nimi. Sprawdzić na iPhonie.

2026-10-21: ten sam róg ma otwarte drpc1/printo-kids#37 (X bezpośrednio nad paskiem przewijania). Na ekranie dotykowym (375 px, lista postaci) X ma x 326–342 px, a rysowany pasek 349–355 px, bo szyna z `useScrollIndicator.ts` stoi w prawym odstępie okna (`offsetLeft + offsetWidth + 3`). Większe pole X i jego kolumna z paskiem to jedna decyzja o rogu; plan powinien domknąć oba.

2026-10-22: na komputerze (wskaźnik precyzyjny, Windows, lista profili) natywny pasek ma 16 px i zajmuje 12–28 px od prawej krawędzi paddingu. Dzisiejszy glif zajmuje 16–32 px, czyli stoi 4 px za bardzo w lewo. Plan fazy 2 dosuwa go do `right-3`. Paska nie przesuwamy.

2026-10-23: najechanie krzyżyka ma wyglądać jak ołówek i kosz. Płytka ma 36 px, `rounded-md` i tło `accent`, a glif jest na jej środku. Pole kliknięcia zostaje 44 px i prawa krawędź glifu zostaje na pasku. Przygaszenie `opacity-70` schodzi. Pierścień fokusu otacza płytkę, nie całe pole.
